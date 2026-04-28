#!/usr/bin/env node

import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  writeLocalJsonAgentLocalV0ToolPackArtifactSet
} from "./local-json-agent-local-v0-tool-pack-cli.mjs";

const tempDir = mkdtempSync(join(tmpdir(), "local-json-agent-local-v0-tool-pack-"));
const manifestOutputPath = join(tempDir, "local-json-agent-tool-manifest.json");
const schemaOutputPath = join(tempDir, "local-json-agent-request-response-schema.json");
const sampleRequestOutputPath = join(tempDir, "agent-context-request.sample.json");
const sampleResponseOutputPath = join(tempDir, "verified-protocol-surface-adapter.sample.response.json");
const sampleSummaryOutputPath = join(tempDir, "local-json-agent-request-run.sample.summary.json");
const sampleIndexOutputPath = join(tempDir, "local-json-agent-request-runner.sample.index.json");
const toolPackIndexOutputPath = join(tempDir, "local-json-agent-local-v0-tool-pack.index.json");

const toolPackWriteResult = writeLocalJsonAgentLocalV0ToolPackArtifactSet({
  manifest_output_path: manifestOutputPath,
  schema_output_path: schemaOutputPath,
  sample_request_output_path: sampleRequestOutputPath,
  sample_response_output_path: sampleResponseOutputPath,
  sample_summary_output_path: sampleSummaryOutputPath,
  sample_index_output_path: sampleIndexOutputPath,
  tool_pack_index_output_path: toolPackIndexOutputPath
});

const manifestArtifact = JSON.parse(readFileSync(manifestOutputPath, "utf8"));
const schemaArtifact = JSON.parse(readFileSync(schemaOutputPath, "utf8"));
const sampleRequestArtifact = JSON.parse(readFileSync(sampleRequestOutputPath, "utf8"));
const sampleResponseArtifact = JSON.parse(readFileSync(sampleResponseOutputPath, "utf8"));
const sampleSummaryArtifact = JSON.parse(readFileSync(sampleSummaryOutputPath, "utf8"));
const sampleIndexArtifact = JSON.parse(readFileSync(sampleIndexOutputPath, "utf8"));
const toolPackIndexArtifact = JSON.parse(readFileSync(toolPackIndexOutputPath, "utf8"));
const responseObservationSummary = sampleResponseArtifact.response_observation_summary_json;

const assertions = {
  tool_pack_written:
    toolPackWriteResult.verification_result ===
      "local_json_agent_local_v0_tool_pack_artifact_set_written" &&
    toolPackWriteResult.output_contract_ref ===
      "local-json-agent-local-v0-tool-pack-artifact-set/v1" &&
    toolPackWriteResult.failure_count === 0,
  explicit_paths_used:
    toolPackIndexArtifact.artifact_paths.manifest_output_path === manifestOutputPath &&
    toolPackIndexArtifact.artifact_paths.schema_output_path === schemaOutputPath &&
    toolPackIndexArtifact.artifact_paths.sample_request_output_path === sampleRequestOutputPath &&
    toolPackIndexArtifact.artifact_paths.sample_response_output_path === sampleResponseOutputPath &&
    toolPackIndexArtifact.artifact_paths.sample_summary_output_path === sampleSummaryOutputPath &&
    toolPackIndexArtifact.artifact_paths.sample_index_output_path === sampleIndexOutputPath &&
    toolPackIndexArtifact.artifact_paths.tool_pack_index_output_path === toolPackIndexOutputPath &&
    toolPackIndexArtifact.writes_only_explicit_tool_pack_artifact_paths === true,
  contracts_match_artifacts:
    toolPackIndexArtifact.artifact_contract_refs.manifest ===
      "local-json-agent-tool-manifest-artifact/v1" &&
    toolPackIndexArtifact.artifact_contract_refs.schema === schemaArtifact.contract_version &&
    toolPackIndexArtifact.artifact_contract_refs.sample_request ===
      sampleRequestArtifact.operation_version &&
    toolPackIndexArtifact.artifact_contract_refs.sample_response_summary ===
      responseObservationSummary.agent_readable_contract &&
    toolPackIndexArtifact.artifact_contract_refs.sample_run_summary ===
      sampleSummaryArtifact.output_contract_ref &&
    toolPackIndexArtifact.artifact_contract_refs.sample_index ===
      sampleIndexArtifact.output_contract_ref,
  manifest_advertises_local_v0_commands:
    manifestArtifact.commands
      .map((command) => command.command_ref)
      .includes("tool:local-json-agent-request-runner-sample:write") &&
    manifestArtifact.commands
      .map((command) => command.command_ref)
      .includes("tool:local-json-agent-request:run"),
  sample_refs_preserved:
    toolPackIndexArtifact.agent_context_request_id ===
      sampleSummaryArtifact.agent_context_request_id &&
    toolPackIndexArtifact.runner_response_id === sampleSummaryArtifact.runner_response_id &&
    sampleIndexArtifact.agent_context_request_id === sampleSummaryArtifact.agent_context_request_id,
  default_deny_posture_preserved:
    toolPackIndexArtifact.runtime_permission_granted === false &&
    toolPackIndexArtifact.actual_contour_execution_allowed_now === false &&
    sampleSummaryArtifact.runtime_permission_granted === false &&
    sampleSummaryArtifact.actual_contour_execution_allowed_now === false &&
    responseObservationSummary.runtime_permission_granted === false &&
    responseObservationSummary.actual_contour_execution_allowed_now === false,
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
    toolPackIndexArtifact.real_storage_write_allowed_now === false
};

const failed = Object.entries(assertions)
  .filter(([, passed]) => passed !== true)
  .map(([name]) => name);

const verification = {
  verification_result:
    failed.length === 0
      ? "local_json_agent_local_v0_tool_pack_artifact_set_verified"
      : "local_json_agent_local_v0_tool_pack_artifact_set_failed",
  output_contract_ref: toolPackWriteResult.output_contract_ref,
  manifest_output_path: manifestOutputPath,
  schema_output_path: schemaOutputPath,
  sample_request_output_path: sampleRequestOutputPath,
  sample_response_output_path: sampleResponseOutputPath,
  sample_summary_output_path: sampleSummaryOutputPath,
  sample_index_output_path: sampleIndexOutputPath,
  tool_pack_index_output_path: toolPackIndexOutputPath,
  agent_context_request_id: sampleSummaryArtifact.agent_context_request_id,
  runner_response_id: sampleSummaryArtifact.runner_response_id,
  selected_source_refs: sampleSummaryArtifact.selected_source_refs,
  selected_scope_ids: sampleSummaryArtifact.selected_scope_ids,
  runtime_permission_granted: sampleSummaryArtifact.runtime_permission_granted,
  actual_contour_execution_allowed_now: sampleSummaryArtifact.actual_contour_execution_allowed_now,
  failure_count: failed.length,
  failures: failed
};

console.log(JSON.stringify(verification, null, 2));

if (failed.length > 0) {
  process.exit(1);
}
