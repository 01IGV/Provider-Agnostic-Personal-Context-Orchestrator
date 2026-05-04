#!/usr/bin/env node

import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  writeLocalRealSourceSingleCommandSampleArtifactSet
} from "./local-real-source-single-command-sample-cli.mjs";

const tempDir = mkdtempSync(join(tmpdir(), "local-real-source-single-command-sample-"));
const requestOutputPath = join(tempDir, "agent-context-request.real-source-single-command.sample.json");
const responseOutputPath = join(tempDir, "local-real-source-single-command.sample.response.json");
const summaryOutputPath = join(tempDir, "local-real-source-single-command.sample.summary.json");
const indexOutputPath = join(tempDir, "local-real-source-single-command.sample.index.json");
const sampleIndexOutputPath = join(
  tempDir,
  "local-real-source-single-command.sample.artifact-set.index.json"
);
const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));
const expectedRefs = [
  "repo-file://docs/04-implementation/CURRENT_IMPLEMENTATION_STATE.md",
  "repo-file://docs/04-implementation/KNOWN_IMPLEMENTATION_ISSUES.md"
];

const sampleWriteResult = writeLocalRealSourceSingleCommandSampleArtifactSet({
  request_output_path: requestOutputPath,
  response_output_path: responseOutputPath,
  summary_output_path: summaryOutputPath,
  index_output_path: indexOutputPath,
  sample_index_output_path: sampleIndexOutputPath
});
const requestArtifact = readJson(requestOutputPath);
const responseArtifact = readJson(responseOutputPath);
const summaryArtifact = readJson(summaryOutputPath);
const indexArtifact = readJson(indexOutputPath);
const sampleIndexArtifact = readJson(sampleIndexOutputPath);
const receipt = responseArtifact.source_materialization_receipt ?? {};

const assertions = {
  sample_artifact_set_written:
    sampleWriteResult.verification_result ===
      "local_real_source_single_command_sample_artifact_set_written" &&
    sampleWriteResult.output_contract_ref ===
      "local-real-source-single-command-sample-artifact-set/v1" &&
    sampleWriteResult.failure_count === 0,
  explicit_paths_used:
    sampleIndexArtifact.artifact_paths.request_output_path === requestOutputPath &&
    sampleIndexArtifact.artifact_paths.response_output_path === responseOutputPath &&
    sampleIndexArtifact.artifact_paths.summary_output_path === summaryOutputPath &&
    sampleIndexArtifact.artifact_paths.index_output_path === indexOutputPath &&
    sampleIndexArtifact.artifact_paths.sample_index_output_path === sampleIndexOutputPath &&
    sampleIndexArtifact.writes_only_explicit_sample_artifact_paths === true,
  contracts_match_artifacts:
    sampleIndexArtifact.artifact_contract_refs.request === requestArtifact.operation_version &&
    sampleIndexArtifact.artifact_contract_refs.response ===
      responseArtifact.output_contract_ref &&
    sampleIndexArtifact.artifact_contract_refs.run_summary ===
      summaryArtifact.output_contract_ref &&
    sampleIndexArtifact.artifact_contract_refs.run_index === indexArtifact.output_contract_ref &&
    sampleIndexArtifact.artifact_contract_refs.source_materialization_receipt ===
      receipt.receipt_version,
  sample_request_and_response_match_boundary:
    requestArtifact.intent.requested_scope_hints.join("|") === "scope:repo-work-context" &&
    sampleIndexArtifact.selected_scope_ids.join("|") === "scope:repo-work-context" &&
    sampleIndexArtifact.selected_source_refs.join("|") === expectedRefs.join("|") &&
    summaryArtifact.selected_source_refs.join("|") === expectedRefs.join("|"),
  receipt_and_digests_carried:
    sampleIndexArtifact.source_materialization_receipt_ref ===
      "local-v0-source-materialization-receipt/v1" &&
    typeof sampleIndexArtifact.source_materialization_receipt_id === "string" &&
    sampleIndexArtifact.content_digests.every((digest) => digest.startsWith("sha256:")) &&
    sampleIndexArtifact.content_digests.join("|") ===
      summaryArtifact.content_digests.join("|"),
  default_deny_posture_preserved:
    sampleIndexArtifact.direct_agent_repo_file_access_allowed_now === false &&
    sampleIndexArtifact.arbitrary_source_loading_allowed === false &&
    sampleIndexArtifact.arbitrary_file_read_allowed_now === false &&
    sampleIndexArtifact.user_selected_path_read_allowed_now === false &&
    sampleIndexArtifact.directory_traversal_allowed_now === false &&
    sampleIndexArtifact.directory_listing_allowed_now === false &&
    sampleIndexArtifact.repo_scanning_allowed_now === false &&
    sampleIndexArtifact.runtime_permission_granted === false &&
    sampleIndexArtifact.actual_contour_execution_allowed_now === false,
  runtime_surfaces_remain_closed:
    sampleIndexArtifact.child_process_spawned === false &&
    sampleIndexArtifact.mcp_server_implemented === false &&
    sampleIndexArtifact.mcp_tool_registered === false &&
    sampleIndexArtifact.mcp_resource_registered === false &&
    sampleIndexArtifact.api_route_registered === false &&
    sampleIndexArtifact.api_controller_registered === false &&
    sampleIndexArtifact.runtime_handler_bound === false &&
    sampleIndexArtifact.provider_sdk_call_allowed_now === false &&
    sampleIndexArtifact.transport_execution_allowed_now === false &&
    sampleIndexArtifact.concrete_persistence_read_allowed_now === false &&
    sampleIndexArtifact.concrete_persistence_write_allowed_now === false &&
    sampleIndexArtifact.real_model_call_allowed_now === false &&
    sampleIndexArtifact.real_storage_write_allowed_now === false
};

const failed = Object.entries(assertions)
  .filter(([, passed]) => passed !== true)
  .map(([name]) => name);

const verification = {
  verification_result:
    failed.length === 0
      ? "local_real_source_single_command_sample_artifact_set_verified"
      : "local_real_source_single_command_sample_artifact_set_failed",
  output_contract_ref: sampleWriteResult.output_contract_ref,
  request_output_path: requestOutputPath,
  response_output_path: responseOutputPath,
  summary_output_path: summaryOutputPath,
  index_output_path: indexOutputPath,
  sample_index_output_path: sampleIndexOutputPath,
  selected_scope_ids: sampleIndexArtifact.selected_scope_ids,
  selected_source_refs: sampleIndexArtifact.selected_source_refs,
  runtime_permission_granted: sampleIndexArtifact.runtime_permission_granted,
  actual_contour_execution_allowed_now:
    sampleIndexArtifact.actual_contour_execution_allowed_now,
  failure_count: failed.length,
  failures: failed
};

console.log(JSON.stringify(verification, null, 2));

if (failed.length > 0) {
  process.exit(1);
}
