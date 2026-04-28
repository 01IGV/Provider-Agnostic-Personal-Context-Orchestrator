#!/usr/bin/env node

import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  writeLocalJsonAgentRequestRunnerSampleArtifactSet
} from "./local-json-agent-request-runner-sample-cli.mjs";

const tempDir = mkdtempSync(join(tmpdir(), "local-json-agent-request-runner-sample-"));
const requestOutputPath = join(tempDir, "agent-context-request.sample.json");
const responseOutputPath = join(tempDir, "verified-protocol-surface-adapter.sample.response.json");
const summaryOutputPath = join(tempDir, "local-json-agent-request-run.sample.summary.json");
const indexOutputPath = join(tempDir, "local-json-agent-request-runner.sample.index.json");

const sampleWriteResult = writeLocalJsonAgentRequestRunnerSampleArtifactSet({
  request_output_path: requestOutputPath,
  response_output_path: responseOutputPath,
  summary_output_path: summaryOutputPath,
  index_output_path: indexOutputPath
});

const requestArtifact = JSON.parse(readFileSync(requestOutputPath, "utf8"));
const responseArtifact = JSON.parse(readFileSync(responseOutputPath, "utf8"));
const summaryArtifact = JSON.parse(readFileSync(summaryOutputPath, "utf8"));
const indexArtifact = JSON.parse(readFileSync(indexOutputPath, "utf8"));
const responseObservationSummary = responseArtifact.response_observation_summary_json;

const assertions = {
  sample_artifact_set_written:
    sampleWriteResult.verification_result ===
      "local_json_agent_request_runner_sample_artifact_set_written" &&
    sampleWriteResult.output_contract_ref ===
      "local-json-agent-request-runner-sample-artifact-set/v1" &&
    sampleWriteResult.failure_count === 0,
  explicit_paths_used:
    indexArtifact.artifact_paths.request_output_path === requestOutputPath &&
    indexArtifact.artifact_paths.response_output_path === responseOutputPath &&
    indexArtifact.artifact_paths.summary_output_path === summaryOutputPath &&
    indexArtifact.artifact_paths.index_output_path === indexOutputPath &&
    indexArtifact.writes_only_explicit_sample_artifact_paths === true,
  request_response_summary_refs_match:
    requestArtifact.agent_context_request_id === summaryArtifact.agent_context_request_id &&
    responseArtifact.runner_response_id === summaryArtifact.runner_response_id &&
    indexArtifact.agent_context_request_id === summaryArtifact.agent_context_request_id &&
    indexArtifact.runner_response_id === summaryArtifact.runner_response_id,
  index_contracts_match_artifacts:
    indexArtifact.artifact_contract_refs.request === requestArtifact.operation_version &&
    indexArtifact.artifact_contract_refs.response_summary ===
      responseObservationSummary.agent_readable_contract &&
    indexArtifact.artifact_contract_refs.run_summary === summaryArtifact.output_contract_ref,
  agent_readable_summary_preserved:
    summaryArtifact.output_contract_ref === "local-json-agent-request-run-summary/v1" &&
    summaryArtifact.agent_readable_contract ===
      "agent-readable-local-json-response-observation/v1" &&
    Array.isArray(indexArtifact.safe_agent_use_hints) &&
    Array.isArray(indexArtifact.denied_agent_action_hints),
  default_deny_posture_preserved:
    indexArtifact.runtime_permission_granted === false &&
    indexArtifact.actual_contour_execution_allowed_now === false &&
    summaryArtifact.runtime_permission_granted === false &&
    summaryArtifact.actual_contour_execution_allowed_now === false &&
    responseObservationSummary.runtime_permission_granted === false &&
    responseObservationSummary.actual_contour_execution_allowed_now === false,
  runtime_surfaces_remain_closed:
    indexArtifact.child_process_spawned === false &&
    indexArtifact.arbitrary_source_loading_allowed === false &&
    indexArtifact.mcp_server_implemented === false &&
    indexArtifact.mcp_tool_registered === false &&
    indexArtifact.mcp_resource_registered === false &&
    indexArtifact.api_route_registered === false &&
    indexArtifact.api_controller_registered === false &&
    indexArtifact.runtime_handler_bound === false &&
    indexArtifact.provider_sdk_call_allowed_now === false &&
    indexArtifact.transport_execution_allowed_now === false &&
    indexArtifact.concrete_persistence_read_allowed_now === false &&
    indexArtifact.concrete_persistence_write_allowed_now === false &&
    indexArtifact.real_model_call_allowed_now === false &&
    indexArtifact.real_storage_write_allowed_now === false
};

const failed = Object.entries(assertions)
  .filter(([, passed]) => passed !== true)
  .map(([name]) => name);

const verification = {
  verification_result:
    failed.length === 0
      ? "local_json_agent_request_runner_sample_artifact_set_verified"
      : "local_json_agent_request_runner_sample_artifact_set_failed",
  output_contract_ref: sampleWriteResult.output_contract_ref,
  request_output_path: requestOutputPath,
  response_output_path: responseOutputPath,
  summary_output_path: summaryOutputPath,
  index_output_path: indexOutputPath,
  agent_context_request_id: summaryArtifact.agent_context_request_id,
  runner_response_id: summaryArtifact.runner_response_id,
  selected_source_refs: summaryArtifact.selected_source_refs,
  selected_scope_ids: summaryArtifact.selected_scope_ids,
  runtime_permission_granted: summaryArtifact.runtime_permission_granted,
  actual_contour_execution_allowed_now: summaryArtifact.actual_contour_execution_allowed_now,
  failure_count: failed.length,
  failures: failed
};

console.log(JSON.stringify(verification, null, 2));

if (failed.length > 0) {
  process.exit(1);
}
