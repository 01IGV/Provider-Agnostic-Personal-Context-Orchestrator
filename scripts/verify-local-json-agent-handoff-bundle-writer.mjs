#!/usr/bin/env node

import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { writeLocalJsonAgentHandoffBundle } from "./local-json-agent-handoff-bundle-cli.mjs";

const tempDir = mkdtempSync(join(tmpdir(), "local-json-agent-handoff-bundle-writer-"));
const manifestOutputPath = join(tempDir, "local-json-agent-tool-manifest.json");
const schemaOutputPath = join(tempDir, "local-json-agent-request-response-schema.json");
const requestOutputPath = join(tempDir, "agent-context-request.example.json");
const responseOutputPath = join(tempDir, "response-observation-summary.example.json");
const examplesSummaryOutputPath = join(tempDir, "schema-aware-local-json-examples.summary.json");
const bundleSummaryOutputPath = join(tempDir, "local-json-agent-handoff-bundle.summary.json");

const writeResult = writeLocalJsonAgentHandoffBundle({
  manifest_output_path: manifestOutputPath,
  schema_output_path: schemaOutputPath,
  request_output_path: requestOutputPath,
  response_output_path: responseOutputPath,
  examples_summary_output_path: examplesSummaryOutputPath,
  bundle_summary_output_path: bundleSummaryOutputPath
});

const manifestArtifact = JSON.parse(readFileSync(manifestOutputPath, "utf8"));
const schemaArtifact = JSON.parse(readFileSync(schemaOutputPath, "utf8"));
const requestArtifact = JSON.parse(readFileSync(requestOutputPath, "utf8"));
const responseArtifact = JSON.parse(readFileSync(responseOutputPath, "utf8"));
const examplesSummaryArtifact = JSON.parse(readFileSync(examplesSummaryOutputPath, "utf8"));
const bundleSummaryArtifact = JSON.parse(readFileSync(bundleSummaryOutputPath, "utf8"));
const manifestCommandRefs = manifestArtifact.commands.map((command) => command.command_ref);

const assertions = {
  bundle_written:
    writeResult.verification_result === "local_json_agent_handoff_bundle_written" &&
    writeResult.bundle_contract_ref === "local-json-agent-handoff-bundle/v1" &&
    writeResult.failure_count === 0,
  bundle_summary_matches_return_value:
    bundleSummaryArtifact.verification_result === writeResult.verification_result &&
    bundleSummaryArtifact.bundle_contract_ref === writeResult.bundle_contract_ref &&
    bundleSummaryArtifact.artifact_paths.manifest_output_path === manifestOutputPath,
  manifest_artifact_is_agent_readable:
    manifestArtifact.manifest_id === "local-json-agent-tool-manifest" &&
    manifestArtifact.manifest_version === "local-json-agent-tool-manifest/v1" &&
    manifestArtifact.intended_consumer === "ai_agent" &&
    manifestCommandRefs.includes("tool:local-json-agent-handoff-bundle:write"),
  schema_artifact_is_agent_contract:
    schemaArtifact.contract_version === "local-json-agent-request-response-contract-schema/v1" &&
    schemaArtifact.request_contract.shape_ref === "AgentContextRequestBoundaryShape" &&
    schemaArtifact.response_contract.shape_ref === "LocalJsonRequestResponseRunnerResponseEnvelopeShape",
  request_artifact_is_schema_aware:
    requestArtifact.operation_id === "agent_context_request_boundary" &&
    requestArtifact.operation_version === "agent-context-request-boundary/v1" &&
    requestArtifact.intent.requested_scope_hints[0] === "scope:active-boundary-chain",
  response_artifact_is_agent_readable:
    responseArtifact.agent_readable_contract === "agent-readable-local-json-response-observation/v1" &&
    responseArtifact.agent_response_status === "bounded_context_ready_for_agent_use" &&
    responseArtifact.runtime_permission_granted === false &&
    responseArtifact.actual_contour_execution_allowed_now === false,
  examples_summary_links_request_and_response:
    examplesSummaryArtifact.schema_contract_version ===
      "local-json-agent-request-response-contract-schema/v1" &&
    examplesSummaryArtifact.example_request_json.operation_id === requestArtifact.operation_id &&
    examplesSummaryArtifact.expected_response_observation_summary_json.agent_readable_contract ===
      responseArtifact.agent_readable_contract,
  bundle_contract_refs_are_consistent:
    bundleSummaryArtifact.artifact_contract_refs.manifest ===
      "local-json-agent-tool-manifest-artifact/v1" &&
    bundleSummaryArtifact.artifact_contract_refs.schema === schemaArtifact.contract_version &&
    bundleSummaryArtifact.artifact_contract_refs.response_observation_summary ===
      responseArtifact.agent_readable_contract,
  default_deny_posture_preserved:
    bundleSummaryArtifact.runtime_permission_granted === false &&
    bundleSummaryArtifact.actual_contour_execution_allowed_now === false &&
    manifestArtifact.runtime_permission_granted === false &&
    responseArtifact.runtime_permission_granted === false,
  runtime_surfaces_remain_closed:
    bundleSummaryArtifact.child_process_spawned === false &&
    bundleSummaryArtifact.arbitrary_source_loading_allowed === false &&
    bundleSummaryArtifact.mcp_server_implemented === false &&
    bundleSummaryArtifact.mcp_tool_registered === false &&
    bundleSummaryArtifact.mcp_resource_registered === false &&
    bundleSummaryArtifact.api_route_registered === false &&
    bundleSummaryArtifact.api_controller_registered === false &&
    bundleSummaryArtifact.runtime_handler_bound === false &&
    bundleSummaryArtifact.provider_sdk_call_allowed_now === false &&
    bundleSummaryArtifact.concrete_persistence_read_allowed_now === false &&
    bundleSummaryArtifact.concrete_persistence_write_allowed_now === false &&
    bundleSummaryArtifact.real_model_call_allowed_now === false &&
    bundleSummaryArtifact.real_storage_write_allowed_now === false
};

const failed = Object.entries(assertions)
  .filter(([, passed]) => passed !== true)
  .map(([name]) => name);

const verification = {
  verification_result:
    failed.length === 0
      ? "local_json_agent_handoff_bundle_writer_verified"
      : "local_json_agent_handoff_bundle_writer_failed",
  bundle_contract_ref: writeResult.bundle_contract_ref,
  artifact_paths: writeResult.artifact_paths,
  manifest_command_refs: manifestCommandRefs,
  schema_contract_version: schemaArtifact.contract_version,
  response_contract_ref: responseArtifact.agent_readable_contract,
  runtime_permission_granted: bundleSummaryArtifact.runtime_permission_granted,
  actual_contour_execution_allowed_now: bundleSummaryArtifact.actual_contour_execution_allowed_now,
  failure_count: failed.length,
  failures: failed
};

console.log(JSON.stringify(verification, null, 2));

if (failed.length > 0) {
  process.exit(1);
}
