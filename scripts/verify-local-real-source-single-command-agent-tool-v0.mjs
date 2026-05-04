#!/usr/bin/env node

import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  runLocalRealSourceSingleCommandAgentToolV0
} from "./local-real-source-single-command-agent-tool-v0-cli.mjs";

const tempDir = mkdtempSync(join(tmpdir(), "local-real-source-single-command-agent-tool-v0-"));
const requestPath = join(tempDir, "agent-context-request.real-source-single-command.json");
const responsePath = join(tempDir, "local-real-source-single-command.response.json");
const summaryPath = join(tempDir, "local-real-source-single-command.summary.json");
const indexPath = join(tempDir, "local-real-source-single-command.index.json");
const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));

const result = runLocalRealSourceSingleCommandAgentToolV0({
  request_output_path: requestPath,
  response_output_path: responsePath,
  summary_output_path: summaryPath,
  index_output_path: indexPath,
  variation: {
    task_signal: "single command real-source repo work context request",
    read_mode_hint: "planning",
    depth_hint: "standard"
  }
});
const request = readJson(requestPath);
const response = readJson(responsePath);
const summary = readJson(summaryPath);
const index = readJson(indexPath);
const expectedRefs = [
  "repo-file://docs/04-implementation/CURRENT_IMPLEMENTATION_STATE.md",
  "repo-file://docs/04-implementation/KNOWN_IMPLEMENTATION_ISSUES.md"
];

const assertions = {
  single_command_completed:
    result.verification_result ===
      "local_real_source_single_command_agent_tool_v0_completed" &&
    result.output_contract_ref ===
      "local-real-source-single-command-agent-tool-v0-summary/v1" &&
    result.failure_count === 0,
  request_authored_with_repo_work_scope:
    request.intent.requested_scope_hints.join("|") === "scope:repo-work-context" &&
    result.requested_scope_hints.join("|") === "scope:repo-work-context" &&
    result.request_task_signal ===
      "single command real-source repo work context request",
  explicit_paths_used:
    result.request_output_path === requestPath &&
    result.response_output_path === responsePath &&
    result.summary_output_path === summaryPath &&
    result.index_output_path === indexPath &&
    index.artifact_paths.response_output_path === responsePath &&
    index.artifact_paths.summary_output_path === summaryPath &&
    index.artifact_paths.index_output_path === indexPath,
  bounded_real_source_response_written:
    response.output_contract_ref === "local-real-source-adapter-v0-response/v1" &&
    response.read_boundary_ref === "narrow-local-real-source-read-boundary/v1" &&
    response.source_catalog_ref === "local-v0-source-catalog/v1" &&
    response.receipt_contract_ref === "local-v0-source-materialization-receipt/v1",
  selected_context_matches_boundary:
    result.selected_scope_ids.join("|") === "scope:repo-work-context" &&
    result.selected_source_refs.join("|") === expectedRefs.join("|") &&
    result.selected_source_item_count === 2,
  receipt_and_digests_carried:
    result.source_materialization_receipt_ref ===
      "local-v0-source-materialization-receipt/v1" &&
    result.content_digests.every((digest) => digest.startsWith("sha256:")) &&
    result.content_digests.join("|") === summary.content_digests.join("|"),
  file_io_is_bounded:
    result.request_fixture_written === true &&
    result.request_fixture_read === true &&
    result.source_read_performed === true &&
    result.live_source_read_performed === true &&
    result.response_file_write_performed === true &&
    result.summary_file_write_performed === true &&
    result.index_file_write_performed === true &&
    result.writes_only_explicit_request_response_summary_index_paths === true &&
    result.reads_only_authored_request_and_narrow_real_source_refs === true,
  default_deny_runtime_posture_preserved:
    result.direct_agent_repo_file_access_allowed_now === false &&
    result.arbitrary_source_loading_allowed === false &&
    result.arbitrary_file_read_allowed_now === false &&
    result.user_selected_path_read_allowed_now === false &&
    result.directory_traversal_allowed_now === false &&
    result.directory_listing_allowed_now === false &&
    result.repo_scanning_allowed_now === false &&
    result.mcp_server_implemented === false &&
    result.mcp_tool_registered === false &&
    result.mcp_resource_registered === false &&
    result.api_route_registered === false &&
    result.api_controller_registered === false &&
    result.runtime_handler_bound === false &&
    result.provider_sdk_call_allowed_now === false &&
    result.transport_execution_allowed_now === false &&
    result.concrete_persistence_read_allowed_now === false &&
    result.concrete_persistence_write_allowed_now === false &&
    result.real_model_call_allowed_now === false &&
    result.real_storage_write_allowed_now === false &&
    result.runtime_permission_granted === false &&
    result.actual_contour_execution_allowed_now === false
};

const failed = Object.entries(assertions)
  .filter(([, passed]) => passed !== true)
  .map(([name]) => name);

const verification = {
  verification_result:
    failed.length === 0
      ? "local_real_source_single_command_agent_tool_v0_verified"
      : "local_real_source_single_command_agent_tool_v0_failed",
  output_contract_ref: "local-real-source-single-command-agent-tool-v0-proof/v1",
  request_path: requestPath,
  response_path: responsePath,
  summary_path: summaryPath,
  index_path: indexPath,
  selected_scope_ids: result.selected_scope_ids,
  selected_source_refs: result.selected_source_refs,
  direct_agent_repo_file_access_allowed_now:
    result.direct_agent_repo_file_access_allowed_now,
  runtime_permission_granted: result.runtime_permission_granted,
  actual_contour_execution_allowed_now: result.actual_contour_execution_allowed_now,
  failure_count: failed.length,
  failures: failed
};

console.log(JSON.stringify(verification, null, 2));

if (failed.length > 0) {
  process.exit(1);
}
