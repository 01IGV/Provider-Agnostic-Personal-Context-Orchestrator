#!/usr/bin/env node

import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  writeLocalJsonAgentLocalV0ToolPackArtifactSet
} from "./local-json-agent-local-v0-tool-pack-cli.mjs";
import { runLocalJsonAgentRequestRunner } from "./local-json-agent-request-runner-cli.mjs";

const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));

const tempDir = mkdtempSync(join(tmpdir(), "local-json-agent-local-v0-acceptance-"));
const manifestOutputPath = join(tempDir, "local-json-agent-tool-manifest.json");
const schemaOutputPath = join(tempDir, "local-json-agent-request-response-schema.json");
const sourceCatalogOutputPath = join(tempDir, "local-v0-source-catalog.json");
const sampleRequestOutputPath = join(tempDir, "agent-context-request.sample.json");
const sampleResponseOutputPath = join(tempDir, "verified-protocol-surface-adapter.sample.response.json");
const sampleSummaryOutputPath = join(tempDir, "local-json-agent-request-run.sample.summary.json");
const sampleIndexOutputPath = join(tempDir, "local-json-agent-request-runner.sample.index.json");
const toolPackIndexOutputPath = join(tempDir, "local-json-agent-local-v0-tool-pack.index.json");
const acceptedResponseOutputPath = join(tempDir, "accepted-protocol-surface-adapter.response.json");
const acceptedSummaryOutputPath = join(tempDir, "local-json-agent-local-v0-acceptance.summary.json");

const toolPackWriteResult = writeLocalJsonAgentLocalV0ToolPackArtifactSet({
  manifest_output_path: manifestOutputPath,
  schema_output_path: schemaOutputPath,
  source_catalog_output_path: sourceCatalogOutputPath,
  sample_request_output_path: sampleRequestOutputPath,
  sample_response_output_path: sampleResponseOutputPath,
  sample_summary_output_path: sampleSummaryOutputPath,
  sample_index_output_path: sampleIndexOutputPath,
  tool_pack_index_output_path: toolPackIndexOutputPath
});

const toolPackIndexArtifact = readJson(toolPackIndexOutputPath);
const discoveredPaths = toolPackIndexArtifact.artifact_paths;
const manifestArtifact = readJson(discoveredPaths.manifest_output_path);
const schemaArtifact = readJson(discoveredPaths.schema_output_path);
const sourceCatalogArtifact = readJson(discoveredPaths.source_catalog_output_path);
const sampleRequestArtifact = readJson(discoveredPaths.sample_request_output_path);
const sampleResponseArtifact = readJson(discoveredPaths.sample_response_output_path);
const sampleSummaryArtifact = readJson(discoveredPaths.sample_summary_output_path);
const sampleIndexArtifact = readJson(discoveredPaths.sample_index_output_path);

const acceptanceRunResult = runLocalJsonAgentRequestRunner({
  request_path: discoveredPaths.sample_request_output_path,
  response_path: acceptedResponseOutputPath,
  summary_path: acceptedSummaryOutputPath
});

const acceptedResponseArtifact = readJson(acceptedResponseOutputPath);
const acceptedSummaryArtifact = readJson(acceptedSummaryOutputPath);
const acceptedObservationSummary = acceptedResponseArtifact.response_observation_summary_json;
const sampleObservationSummary = sampleResponseArtifact.response_observation_summary_json;
const manifestCommandRefs = manifestArtifact.commands.map((command) => command.command_ref);

const assertions = {
  tool_pack_materialized:
    toolPackWriteResult.verification_result ===
      "local_json_agent_local_v0_tool_pack_artifact_set_written" &&
    toolPackIndexArtifact.output_contract_ref ===
      "local-json-agent-local-v0-tool-pack-artifact-set/v1" &&
    toolPackWriteResult.failure_count === 0 &&
    toolPackIndexArtifact.failure_count === 0,
  agent_starts_from_tool_pack_index:
    discoveredPaths.tool_pack_index_output_path === toolPackIndexOutputPath &&
    discoveredPaths.manifest_output_path === manifestOutputPath &&
    discoveredPaths.schema_output_path === schemaOutputPath &&
    discoveredPaths.source_catalog_output_path === sourceCatalogOutputPath &&
    discoveredPaths.sample_request_output_path === sampleRequestOutputPath &&
    discoveredPaths.sample_response_output_path === sampleResponseOutputPath &&
    discoveredPaths.sample_summary_output_path === sampleSummaryOutputPath &&
    discoveredPaths.sample_index_output_path === sampleIndexOutputPath,
  manifest_schema_and_sample_refs_are_discoverable:
    manifestCommandRefs.includes("tool:local-json-agent-local-v0-tool-pack:write") &&
    manifestCommandRefs.includes("tool:local-json-agent-request:run") &&
    schemaArtifact.contract_version === toolPackIndexArtifact.schema_contract_ref &&
    sampleIndexArtifact.output_contract_ref ===
      toolPackIndexArtifact.artifact_contract_refs.sample_index &&
    sampleRequestArtifact.operation_version ===
      toolPackIndexArtifact.artifact_contract_refs.sample_request &&
    sampleSummaryArtifact.output_contract_ref ===
      toolPackIndexArtifact.artifact_contract_refs.sample_run_summary &&
    sampleObservationSummary.agent_readable_contract ===
      toolPackIndexArtifact.artifact_contract_refs.sample_response_summary,
  source_catalog_is_discoverable_from_tool_pack:
    sourceCatalogArtifact.catalog_version ===
      toolPackIndexArtifact.artifact_contract_refs.source_catalog &&
    toolPackIndexArtifact.source_catalog_ref === sourceCatalogArtifact.catalog_version &&
    sourceCatalogArtifact.supported_scope_ids.join("|") ===
      toolPackIndexArtifact.source_catalog_supported_scope_ids.join("|") &&
    sourceCatalogArtifact.selection_policy.arbitrary_file_paths_allowed === false &&
    sourceCatalogArtifact.selection_policy.unknown_scope_grants_access === false &&
    sourceCatalogArtifact.execution_posture.runtime_permission_granted === false &&
    sourceCatalogArtifact.execution_posture.actual_contour_execution_allowed_now === false,
  acceptance_run_completed_from_discovered_request:
    acceptanceRunResult.verification_result === "local_json_agent_request_run_completed" &&
    acceptanceRunResult.output_contract_ref === "local-json-agent-request-run-summary/v1" &&
    acceptanceRunResult.request_path === discoveredPaths.sample_request_output_path &&
    acceptanceRunResult.response_path === acceptedResponseOutputPath &&
    acceptanceRunResult.summary_path === acceptedSummaryOutputPath &&
    acceptanceRunResult.failure_count === 0,
  acceptance_summary_matches_artifacts:
    acceptedSummaryArtifact.verification_result === acceptanceRunResult.verification_result &&
    acceptedSummaryArtifact.agent_context_request_id ===
      sampleRequestArtifact.agent_context_request_id &&
    acceptedSummaryArtifact.runner_response_id ===
      acceptedResponseArtifact.runner_response_id &&
    acceptedSummaryArtifact.bounded_context_response_id ===
      acceptedResponseArtifact.refs.bounded_context_response_id &&
    acceptedSummaryArtifact.bounded_context_package_id ===
      acceptedResponseArtifact.refs.bounded_context_package_id,
  acceptance_output_matches_tool_pack_sample_semantics:
    acceptanceRunResult.agent_context_request_id ===
      toolPackIndexArtifact.agent_context_request_id &&
    acceptanceRunResult.agent_readable_contract ===
      sampleObservationSummary.agent_readable_contract &&
    acceptanceRunResult.selected_source_refs.join("|") ===
      toolPackIndexArtifact.selected_source_refs.join("|") &&
    acceptanceRunResult.selected_scope_ids.join("|") ===
      toolPackIndexArtifact.selected_scope_ids.join("|"),
  bounded_file_io_only:
    toolPackIndexArtifact.writes_only_explicit_tool_pack_artifact_paths === true &&
    acceptanceRunResult.file_read_performed === true &&
    acceptanceRunResult.response_file_write_performed === true &&
    acceptanceRunResult.summary_file_write_performed === true &&
    acceptanceRunResult.writes_only_explicit_response_and_summary_paths === true,
  default_deny_posture_preserved:
    toolPackIndexArtifact.runtime_permission_granted === false &&
    toolPackIndexArtifact.actual_contour_execution_allowed_now === false &&
    acceptanceRunResult.runtime_permission_granted === false &&
    acceptanceRunResult.actual_contour_execution_allowed_now === false &&
    acceptedObservationSummary.runtime_permission_granted === false &&
    acceptedObservationSummary.actual_contour_execution_allowed_now === false,
  runtime_surfaces_remain_closed:
    toolPackIndexArtifact.child_process_spawned === false &&
    toolPackIndexArtifact.arbitrary_source_loading_allowed === false &&
    toolPackIndexArtifact.mcp_server_implemented === false &&
    toolPackIndexArtifact.mcp_tool_registered === false &&
    toolPackIndexArtifact.mcp_resource_registered === false &&
    toolPackIndexArtifact.api_route_registered === false &&
    toolPackIndexArtifact.api_controller_registered === false &&
    toolPackIndexArtifact.runtime_handler_bound === false &&
    toolPackIndexArtifact.provider_sdk_call_allowed_now === false &&
    toolPackIndexArtifact.transport_execution_allowed_now === false &&
    toolPackIndexArtifact.concrete_persistence_read_allowed_now === false &&
    toolPackIndexArtifact.concrete_persistence_write_allowed_now === false &&
    toolPackIndexArtifact.real_model_call_allowed_now === false &&
    toolPackIndexArtifact.real_storage_write_allowed_now === false &&
    acceptanceRunResult.child_process_spawned === false &&
    acceptanceRunResult.arbitrary_source_loading_allowed === false &&
    acceptanceRunResult.mcp_server_implemented === false &&
    acceptanceRunResult.mcp_tool_registered === false &&
    acceptanceRunResult.mcp_resource_registered === false &&
    acceptanceRunResult.api_route_registered === false &&
    acceptanceRunResult.api_controller_registered === false &&
    acceptanceRunResult.runtime_handler_bound === false &&
    acceptanceRunResult.provider_sdk_call_allowed_now === false &&
    acceptanceRunResult.transport_execution_allowed_now === false &&
    acceptanceRunResult.concrete_persistence_read_allowed_now === false &&
    acceptanceRunResult.concrete_persistence_write_allowed_now === false &&
    acceptanceRunResult.real_model_call_allowed_now === false &&
    acceptanceRunResult.real_storage_write_allowed_now === false
};

const failed = Object.entries(assertions)
  .filter(([, passed]) => passed !== true)
  .map(([name]) => name);

const verification = {
  verification_result:
    failed.length === 0
      ? "local_json_agent_local_v0_acceptance_proof_verified"
      : "local_json_agent_local_v0_acceptance_proof_failed",
  output_contract_ref: "local-json-agent-local-v0-acceptance-proof/v1",
  tool_pack_index_output_path: toolPackIndexOutputPath,
  accepted_response_output_path: acceptedResponseOutputPath,
  accepted_summary_output_path: acceptedSummaryOutputPath,
  agent_context_request_id: acceptanceRunResult.agent_context_request_id,
  runner_response_id: acceptanceRunResult.runner_response_id,
  bounded_context_response_id: acceptanceRunResult.bounded_context_response_id,
  bounded_context_package_id: acceptanceRunResult.bounded_context_package_id,
  selected_source_refs: acceptanceRunResult.selected_source_refs,
  selected_scope_ids: acceptanceRunResult.selected_scope_ids,
  source_catalog_ref: toolPackIndexArtifact.source_catalog_ref,
  source_catalog_supported_scope_ids: toolPackIndexArtifact.source_catalog_supported_scope_ids,
  safe_agent_use_hints: acceptanceRunResult.safe_agent_use_hints,
  denied_agent_action_hints: acceptanceRunResult.denied_agent_action_hints,
  started_from_tool_pack_index: true,
  used_discovered_manifest_schema_and_sample_refs: failed.length === 0,
  writes_only_explicit_proof_artifact_paths: true,
  arbitrary_source_loading_allowed: false,
  child_process_spawned: false,
  mcp_server_implemented: false,
  mcp_tool_registered: false,
  mcp_resource_registered: false,
  api_route_registered: false,
  api_controller_registered: false,
  runtime_handler_bound: false,
  provider_sdk_call_allowed_now: false,
  transport_execution_allowed_now: false,
  concrete_persistence_read_allowed_now: false,
  concrete_persistence_write_allowed_now: false,
  real_model_call_allowed_now: false,
  real_storage_write_allowed_now: false,
  runtime_permission_granted: acceptanceRunResult.runtime_permission_granted,
  actual_contour_execution_allowed_now:
    acceptanceRunResult.actual_contour_execution_allowed_now,
  failure_count: failed.length,
  failures: failed
};

console.log(JSON.stringify(verification, null, 2));

if (failed.length > 0) {
  process.exit(1);
}
