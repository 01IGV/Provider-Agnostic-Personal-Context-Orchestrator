#!/usr/bin/env node

import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import {
  runLocalRealSourceAgentToolEntrypointV0
} from "./local-real-source-agent-tool-entrypoint-v0-cli.mjs";
import {
  writeLocalRealSourceAgentToolRunReceiptV0
} from "./local-real-source-agent-tool-run-receipt-v0-cli.mjs";

const tempDir = mkdtempSync(join(tmpdir(), "local-real-source-agent-tool-run-receipt-"));
const artifactDirPath = join(tempDir, "agent-tool-artifacts");
const receiptOutputPath = join(artifactDirPath, "local-real-source-agent-tool.run-receipt.json");
const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));
const selectedSourceRefs = [
  "repo-file://docs/04-implementation/CURRENT_IMPLEMENTATION_STATE.md",
  "repo-file://docs/04-implementation/KNOWN_IMPLEMENTATION_ISSUES.md"
];

const entrypointResult = runLocalRealSourceAgentToolEntrypointV0({
  artifact_dir_path: artifactDirPath,
  variation: {
    task_signal: "run receipt repo-work context request",
    read_mode_hint: "planning",
    depth_hint: "standard"
  }
});
const entrypointSummaryPath = entrypointResult.artifact_paths.entrypoint_summary_output_path;
const receiptResult = writeLocalRealSourceAgentToolRunReceiptV0({
  entrypoint_summary_path: entrypointSummaryPath,
  receipt_output_path: receiptOutputPath
});
const receiptArtifact = readJson(receiptOutputPath);
const responseArtifact = readJson(receiptArtifact.response_artifact_path);
const runSummaryArtifact = readJson(receiptArtifact.run_summary_artifact_path);
const consumptionSummaryArtifact = readJson(receiptArtifact.consumption_summary_artifact_path);

const assertions = {
  receipt_written:
    receiptResult.verification_result ===
      "local_real_source_agent_tool_run_receipt_v0_written" &&
    receiptArtifact.verification_result === receiptResult.verification_result &&
    receiptArtifact.output_contract_ref === "local-real-source-agent-tool-run-receipt-v0/v1" &&
    receiptArtifact.failure_count === 0,
  receipt_starts_from_entrypoint_summary:
    receiptArtifact.entrypoint_summary_path === entrypointSummaryPath &&
    receiptArtifact.entrypoint_command_ref ===
      "tool:local-real-source-agent-tool-entrypoint-v0:run" &&
    receiptArtifact.primary_command_ref === "tool:local-real-source-tool-pack:run-consume-v0",
  receipt_output_is_confined:
    receiptArtifact.artifact_dir_path === artifactDirPath &&
    receiptArtifact.receipt_output_path === receiptOutputPath &&
    receiptArtifact.receipt_output_confined_to_entrypoint_artifact_dir === true &&
    dirname(receiptArtifact.receipt_output_path) === artifactDirPath,
  request_intent_is_preserved:
    receiptArtifact.request_task_signal === "run receipt repo-work context request" &&
    receiptArtifact.request_read_mode_hint === "planning" &&
    receiptArtifact.request_depth_hint === "standard",
  bounded_response_is_discoverable:
    receiptArtifact.response_artifact_path === entrypointResult.artifact_paths.response_output_path &&
    receiptArtifact.artifact_contract_refs.response ===
      "local-real-source-adapter-v0-response/v1" &&
    responseArtifact.output_contract_ref === receiptArtifact.artifact_contract_refs.response,
  run_summaries_are_discoverable:
    receiptArtifact.run_summary_artifact_path ===
      entrypointResult.artifact_paths.summary_output_path &&
    receiptArtifact.consumption_summary_artifact_path ===
      entrypointResult.artifact_paths.consumption_summary_output_path &&
    runSummaryArtifact.output_contract_ref === receiptArtifact.artifact_contract_refs.run_summary &&
    consumptionSummaryArtifact.output_contract_ref ===
      receiptArtifact.artifact_contract_refs.consumption_summary,
  selected_refs_are_consistent:
    receiptArtifact.selected_scope_ids.join("|") === "scope:repo-work-context" &&
    receiptArtifact.selected_source_refs.join("|") === selectedSourceRefs.join("|") &&
    responseArtifact.selected_source_refs.join("|") === selectedSourceRefs.join("|"),
  content_digests_are_preserved:
    receiptArtifact.content_digests.length === 2 &&
    receiptArtifact.content_digests.join("|") === runSummaryArtifact.content_digests.join("|"),
  envelope_refs_are_preserved:
    receiptArtifact.source_materialization_receipt_ref ===
      runSummaryArtifact.source_materialization_receipt_ref &&
    receiptArtifact.provenance_envelope_ref === runSummaryArtifact.provenance_envelope_ref &&
    receiptArtifact.permission_envelope_ref === runSummaryArtifact.permission_envelope_ref &&
    receiptArtifact.audit_envelope_ref === runSummaryArtifact.audit_envelope_ref,
  default_deny_posture_preserved:
    receiptArtifact.reads_only_entrypoint_discovered_artifacts === true &&
    receiptArtifact.writes_only_explicit_run_receipt_output_path === true &&
    receiptArtifact.direct_agent_repo_file_access_allowed_now === false &&
    receiptArtifact.arbitrary_source_loading_allowed === false &&
    receiptArtifact.arbitrary_file_read_allowed_now === false &&
    receiptArtifact.user_selected_path_read_allowed_now === false &&
    receiptArtifact.directory_traversal_allowed_now === false &&
    receiptArtifact.directory_listing_allowed_now === false &&
    receiptArtifact.repo_scanning_allowed_now === false &&
    receiptArtifact.runtime_permission_granted === false &&
    receiptArtifact.actual_contour_execution_allowed_now === false,
  runtime_surfaces_remain_closed:
    receiptArtifact.child_process_spawned === false &&
    receiptArtifact.mcp_server_implemented === false &&
    receiptArtifact.mcp_tool_registered === false &&
    receiptArtifact.mcp_resource_registered === false &&
    receiptArtifact.api_route_registered === false &&
    receiptArtifact.api_controller_registered === false &&
    receiptArtifact.runtime_handler_bound === false &&
    receiptArtifact.provider_sdk_call_allowed_now === false &&
    receiptArtifact.transport_execution_allowed_now === false &&
    receiptArtifact.concrete_persistence_read_allowed_now === false &&
    receiptArtifact.concrete_persistence_write_allowed_now === false &&
    receiptArtifact.real_model_call_allowed_now === false &&
    receiptArtifact.real_storage_write_allowed_now === false
};

const failed = Object.entries(assertions)
  .filter(([, passed]) => passed !== true)
  .map(([name]) => name);

const verification = {
  verification_result:
    failed.length === 0
      ? "local_real_source_agent_tool_run_receipt_v0_verified"
      : "local_real_source_agent_tool_run_receipt_v0_failed",
  output_contract_ref: "local-real-source-agent-tool-run-receipt-v0/v1",
  entrypoint_summary_path: entrypointSummaryPath,
  receipt_output_path: receiptOutputPath,
  response_artifact_path: receiptArtifact.response_artifact_path,
  selected_scope_ids: receiptArtifact.selected_scope_ids,
  selected_source_refs: receiptArtifact.selected_source_refs,
  content_digests: receiptArtifact.content_digests,
  runtime_permission_granted: receiptArtifact.runtime_permission_granted,
  actual_contour_execution_allowed_now: receiptArtifact.actual_contour_execution_allowed_now,
  failure_count: failed.length,
  failures: failed
};

console.log(JSON.stringify(verification, null, 2));

if (failed.length > 0) {
  process.exit(1);
}
