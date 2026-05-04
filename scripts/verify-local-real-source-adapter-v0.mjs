#!/usr/bin/env node

import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  readLocalRealSourceAdapterV0DeniedProbes,
  runLocalRealSourceAdapterV0
} from "./local-real-source-adapter-v0-cli.mjs";

const tempDir = mkdtempSync(join(tmpdir(), "local-real-source-adapter-v0-"));
const responseOutputPath = join(tempDir, "local-real-source-adapter-v0.response.json");
const summaryOutputPath = join(tempDir, "local-real-source-adapter-v0.summary.json");
const indexOutputPath = join(tempDir, "local-real-source-adapter-v0.index.json");
const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));

const runResult = runLocalRealSourceAdapterV0({
  response_output_path: responseOutputPath,
  summary_output_path: summaryOutputPath,
  index_output_path: indexOutputPath
});
const response = readJson(responseOutputPath);
const summary = readJson(summaryOutputPath);
const index = readJson(indexOutputPath);
const receipt = response.source_materialization_receipt ?? {};
const posture = response.execution_posture ?? {};
const receiptPosture = receipt.execution_posture ?? {};
const sourceItems = response.source_items ?? [];
const deniedProbes = readLocalRealSourceAdapterV0DeniedProbes();
const expectedRefs = [
  "repo-file://docs/04-implementation/CURRENT_IMPLEMENTATION_STATE.md",
  "repo-file://docs/04-implementation/KNOWN_IMPLEMENTATION_ISSUES.md"
];

const assertions = {
  artifact_set_written:
    runResult.verification_result === "local_real_source_adapter_v0_artifact_set_written" &&
    runResult.output_contract_ref === "local-real-source-adapter-v0-artifact-set/v1" &&
    runResult.failure_count === 0,
  explicit_output_paths_used:
    index.artifact_paths.response_output_path === responseOutputPath &&
    index.artifact_paths.summary_output_path === summaryOutputPath &&
    index.artifact_paths.index_output_path === indexOutputPath &&
    index.writes_only_explicit_local_real_source_adapter_v0_paths === true,
  bounded_response_shape:
    response.verification_result === "local_real_source_adapter_v0_response_ready" &&
    response.output_contract_ref === "local-real-source-adapter-v0-response/v1" &&
    response.intended_consumer === "ai_agent" &&
    response.artifact_boundary === "agent_consumable_bounded_context_response" &&
    response.read_boundary_ref === "narrow-local-real-source-read-boundary/v1",
  reads_only_allowlisted_source_refs:
    sourceItems.length === 2 &&
    response.selected_source_refs.join("|") === expectedRefs.join("|") &&
    index.selected_source_refs.join("|") === expectedRefs.join("|") &&
    index.reads_only_narrow_local_real_source_boundary_refs === true,
  source_items_include_bounded_content_and_digest:
    sourceItems.every((item) => item.content_digest?.startsWith("sha256:")) &&
    sourceItems.every((item) => typeof item.content_text === "string") &&
    sourceItems[0].content_text.includes("# Current Implementation State") &&
    sourceItems[1].content_text.includes("# Known Implementation Issues") &&
    sourceItems.every((item) => item.byte_length <= 65536),
  materialization_receipt_present:
    receipt.receipt_version === "local-v0-source-materialization-receipt/v1" &&
    receipt.read_boundary_ref === "narrow-local-real-source-read-boundary/v1" &&
    receipt.source_catalog_ref === "local-v0-source-catalog/v1" &&
    receipt.selected_source_refs.join("|") === expectedRefs.join("|") &&
    receipt.receipt_items.length === sourceItems.length,
  envelopes_and_digests_carried:
    response.provenance_envelope_ref === receipt.provenance_envelope_ref &&
    response.permission_envelope_ref === receipt.permission_envelope_ref &&
    response.audit_envelope_ref === receipt.audit_envelope_ref &&
    summary.content_digests.join("|") ===
      sourceItems.map((item) => item.content_digest).join("|") &&
    receipt.receipt_items
      .map((item) => item.content_digest)
      .join("|") === sourceItems.map((item) => item.content_digest).join("|"),
  live_read_is_bounded_not_direct_agent_file_access:
    posture.live_source_read_performed === true &&
    posture.bounded_real_source_read_performed === true &&
    posture.reads_only_narrow_local_real_source_boundary_refs === true &&
    posture.direct_agent_repo_file_access_allowed_now === false &&
    posture.arbitrary_file_read_allowed_now === false &&
    posture.user_selected_path_read_allowed_now === false &&
    posture.directory_traversal_allowed_now === false &&
    posture.directory_listing_allowed_now === false &&
    posture.repo_scanning_allowed_now === false &&
    receiptPosture.live_source_read_performed === true &&
    receiptPosture.direct_agent_repo_file_access_allowed_now === false,
  runtime_surfaces_remain_closed:
    posture.git_command_execution_allowed_now === false &&
    posture.network_access_allowed_now === false &&
    posture.mcp_server_allowed_now === false &&
    posture.mcp_tool_resource_registration_allowed_now === false &&
    posture.api_route_controller_allowed_now === false &&
    posture.runtime_handler_bound === false &&
    posture.provider_sdk_call_allowed_now === false &&
    posture.concrete_persistence_read_allowed_now === false &&
    posture.concrete_persistence_write_allowed_now === false &&
    posture.auth_iam_implementation_allowed_now === false &&
    posture.token_session_validation_allowed_now === false &&
    posture.policy_engine_execution_allowed_now === false &&
    posture.permission_grant_allowed_now === false &&
    posture.real_model_call_allowed_now === false &&
    posture.real_storage_write_allowed_now === false &&
    posture.runtime_permission_granted === false &&
    posture.actual_contour_execution_allowed_now === false,
  denied_probes_enforced:
    deniedProbes.length === 4 &&
    deniedProbes.every((probe) => probe.denied === true) &&
    deniedProbes.some((probe) => probe.label === "absolute_path_source_ref_denied") &&
    deniedProbes.some((probe) => probe.label === "parent_directory_source_ref_denied") &&
    deniedProbes.some((probe) => probe.label === "unknown_source_ref_denied") &&
    deniedProbes.some((probe) => probe.label === "directory_ref_denied")
};

const failed = Object.entries(assertions)
  .filter(([, passed]) => passed !== true)
  .map(([name]) => name);

const verification = {
  verification_result:
    failed.length === 0
      ? "local_real_source_adapter_v0_verified"
      : "local_real_source_adapter_v0_failed",
  output_contract_ref: runResult.output_contract_ref,
  response_output_path: responseOutputPath,
  summary_output_path: summaryOutputPath,
  index_output_path: indexOutputPath,
  selected_source_refs: response.selected_source_refs,
  content_digests: summary.content_digests,
  denied_probes: deniedProbes,
  direct_agent_repo_file_access_allowed_now:
    posture.direct_agent_repo_file_access_allowed_now,
  live_source_read_performed: posture.live_source_read_performed,
  runtime_permission_granted: posture.runtime_permission_granted,
  actual_contour_execution_allowed_now: posture.actual_contour_execution_allowed_now,
  failure_count: failed.length,
  failures: failed
};

console.log(JSON.stringify(verification, null, 2));

if (failed.length > 0) {
  process.exit(1);
}
