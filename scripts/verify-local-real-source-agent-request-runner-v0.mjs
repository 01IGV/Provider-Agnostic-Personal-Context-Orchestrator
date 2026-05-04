#!/usr/bin/env node

import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  writeLocalJsonRequestFixture
} from "./local-json-request-fixture-authoring-cli.mjs";
import {
  runLocalRealSourceAgentRequestRunnerV0
} from "./local-real-source-agent-request-runner-v0-cli.mjs";

const tempDir = mkdtempSync(join(tmpdir(), "local-real-source-agent-request-runner-v0-"));
const requestPath = join(tempDir, "agent-context-request.repo-work-context.json");
const responsePath = join(tempDir, "local-real-source-agent-request-runner-v0.response.json");
const summaryPath = join(tempDir, "local-real-source-agent-request-runner-v0.summary.json");
const indexPath = join(tempDir, "local-real-source-agent-request-runner-v0.index.json");
const deniedRequestPath = join(tempDir, "agent-context-request.unsupported-scope.json");
const deniedResponsePath = join(
  tempDir,
  "local-real-source-agent-request-runner-v0.denied.response.json"
);
const deniedSummaryPath = join(
  tempDir,
  "local-real-source-agent-request-runner-v0.denied.summary.json"
);
const deniedIndexPath = join(
  tempDir,
  "local-real-source-agent-request-runner-v0.denied.index.json"
);
const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));

const requestWriteResult = writeLocalJsonRequestFixture({
  output_path: requestPath,
  variation: {
    task_signal: "real source repo work context request",
    read_mode_hint: "planning",
    depth_hint: "standard",
    requested_scope_hints: ["scope:repo-work-context"]
  }
});
const runResult = runLocalRealSourceAgentRequestRunnerV0({
  request_path: requestPath,
  response_output_path: responsePath,
  summary_output_path: summaryPath,
  index_output_path: indexPath
});
const response = readJson(responsePath);
const summary = readJson(summaryPath);
const index = readJson(indexPath);

const deniedRequestWriteResult = writeLocalJsonRequestFixture({
  output_path: deniedRequestPath,
  variation: {
    task_signal: "unsupported real source scope request",
    read_mode_hint: "planning",
    depth_hint: "standard",
    requested_scope_hints: ["scope:active-boundary-chain"]
  }
});
const deniedRunResult = runLocalRealSourceAgentRequestRunnerV0({
  request_path: deniedRequestPath,
  response_output_path: deniedResponsePath,
  summary_output_path: deniedSummaryPath,
  index_output_path: deniedIndexPath
});
const deniedResponse = readJson(deniedResponsePath);
const deniedSummary = readJson(deniedSummaryPath);
const deniedIndex = readJson(deniedIndexPath);
const expectedRefs = [
  "repo-file://docs/04-implementation/CURRENT_IMPLEMENTATION_STATE.md",
  "repo-file://docs/04-implementation/KNOWN_IMPLEMENTATION_ISSUES.md"
];

const assertions = {
  request_fixture_written:
    requestWriteResult.verification_result === "local_json_request_fixture_authored" &&
    requestWriteResult.requested_scope_hints.join("|") === "scope:repo-work-context" &&
    requestWriteResult.failure_count === 0,
  runner_completed:
    runResult.verification_result === "local_real_source_agent_request_runner_v0_completed" &&
    runResult.output_contract_ref === "local-real-source-agent-request-runner-v0-summary/v1" &&
    runResult.failure_count === 0,
  explicit_paths_used:
    summary.request_path === requestPath &&
    summary.response_output_path === responsePath &&
    summary.summary_output_path === summaryPath &&
    summary.index_output_path === indexPath &&
    index.artifact_paths.response_output_path === responsePath &&
    index.artifact_paths.summary_output_path === summaryPath &&
    index.artifact_paths.index_output_path === indexPath,
  response_is_bounded_real_source_context:
    response.output_contract_ref === "local-real-source-adapter-v0-response/v1" &&
    response.read_boundary_ref === "narrow-local-real-source-read-boundary/v1" &&
    response.source_catalog_ref === "local-v0-source-catalog/v1" &&
    response.receipt_contract_ref === "local-v0-source-materialization-receipt/v1",
  request_drives_repo_work_context_scope:
    summary.requested_scope_hints.join("|") === "scope:repo-work-context" &&
    summary.selected_scope_ids.join("|") === "scope:repo-work-context" &&
    summary.selected_source_refs.join("|") === expectedRefs.join("|"),
  receipt_and_digests_carried:
    summary.source_materialization_receipt_ref ===
      "local-v0-source-materialization-receipt/v1" &&
    summary.content_digests.every((digest) => digest.startsWith("sha256:")) &&
    summary.content_digests.join("|") === index.content_digests.join("|"),
  source_read_is_bounded_not_direct_access:
    summary.request_file_read_performed === true &&
    summary.source_read_performed === true &&
    summary.live_source_read_performed === true &&
    summary.reads_only_explicit_request_and_narrow_real_source_refs === true &&
    summary.direct_agent_repo_file_access_allowed_now === false &&
    summary.arbitrary_source_loading_allowed === false &&
    summary.arbitrary_file_read_allowed_now === false &&
    summary.directory_traversal_allowed_now === false &&
    summary.directory_listing_allowed_now === false &&
    summary.repo_scanning_allowed_now === false,
  runtime_surfaces_remain_closed:
    summary.child_process_spawned === false &&
    summary.mcp_server_implemented === false &&
    summary.mcp_tool_registered === false &&
    summary.mcp_resource_registered === false &&
    summary.api_route_registered === false &&
    summary.api_controller_registered === false &&
    summary.runtime_handler_bound === false &&
    summary.provider_sdk_call_allowed_now === false &&
    summary.transport_execution_allowed_now === false &&
    summary.concrete_persistence_read_allowed_now === false &&
    summary.concrete_persistence_write_allowed_now === false &&
    summary.real_model_call_allowed_now === false &&
    summary.real_storage_write_allowed_now === false &&
    summary.runtime_permission_granted === false &&
    summary.actual_contour_execution_allowed_now === false,
  unsupported_scope_denied_before_source_read:
    deniedRequestWriteResult.failure_count === 0 &&
    deniedRunResult.verification_result ===
      "local_real_source_agent_request_runner_v0_denied" &&
    deniedRunResult.failure_count === 1 &&
    deniedRunResult.failures.includes(
      "request_scope_not_supported_by_local_real_source_runner_v0"
    ) &&
    deniedSummary.source_read_performed === false &&
    deniedSummary.live_source_read_performed === false &&
    deniedResponse.source_read_performed === false &&
    deniedIndex.source_read_performed === false
};

const failed = Object.entries(assertions)
  .filter(([, passed]) => passed !== true)
  .map(([name]) => name);

const verification = {
  verification_result:
    failed.length === 0
      ? "local_real_source_agent_request_runner_v0_verified"
      : "local_real_source_agent_request_runner_v0_failed",
  output_contract_ref: "local-real-source-agent-request-runner-v0-proof/v1",
  request_path: requestPath,
  response_path: responsePath,
  summary_path: summaryPath,
  index_path: indexPath,
  selected_scope_ids: summary.selected_scope_ids,
  selected_source_refs: summary.selected_source_refs,
  denied_failure: deniedRunResult.failures?.[0],
  direct_agent_repo_file_access_allowed_now:
    summary.direct_agent_repo_file_access_allowed_now,
  runtime_permission_granted: summary.runtime_permission_granted,
  actual_contour_execution_allowed_now: summary.actual_contour_execution_allowed_now,
  failure_count: failed.length,
  failures: failed
};

console.log(JSON.stringify(verification, null, 2));

if (failed.length > 0) {
  process.exit(1);
}
