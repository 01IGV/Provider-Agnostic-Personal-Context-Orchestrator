#!/usr/bin/env node

import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import {
  runLocalRealSourceAgentToolOneCommandRunV0
} from "./local-real-source-agent-tool-one-command-run-v0-cli.mjs";

const tempDir = mkdtempSync(join(tmpdir(), "local-real-source-agent-tool-one-command-run-"));
const artifactDirPath = join(tempDir, "agent-tool-artifacts");
const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));
const selectedSourceRefs = [
  "repo-file://docs/04-implementation/CURRENT_IMPLEMENTATION_STATE.md",
  "repo-file://docs/04-implementation/KNOWN_IMPLEMENTATION_ISSUES.md"
];

const oneCommandResult = runLocalRealSourceAgentToolOneCommandRunV0({
  artifact_dir_path: artifactDirPath,
  variation: {
    task_signal: "one command run repo-work context request",
    read_mode_hint: "planning",
    depth_hint: "standard"
  }
});
const oneCommandSummary = readJson(oneCommandResult.one_command_summary_output_path);
const receiptArtifact = readJson(oneCommandResult.primary_agent_output_path);
const responseArtifact = readJson(receiptArtifact.response_artifact_path);
const runSummaryArtifact = readJson(receiptArtifact.run_summary_artifact_path);

const assertions = {
  one_command_run_completed:
    oneCommandResult.verification_result ===
      "local_real_source_agent_tool_one_command_run_v0_completed" &&
    oneCommandSummary.verification_result === oneCommandResult.verification_result &&
    oneCommandSummary.output_contract_ref ===
      "local-real-source-agent-tool-one-command-run-v0/v1" &&
    oneCommandSummary.failure_count === 0,
  primary_agent_output_is_run_receipt:
    oneCommandSummary.primary_agent_output_kind === "run_receipt" &&
    oneCommandSummary.primary_agent_output_path ===
      join(artifactDirPath, "local-real-source-agent-tool.run-receipt.json") &&
    oneCommandSummary.primary_agent_output_contract_ref ===
      "local-real-source-agent-tool-run-receipt-v0/v1" &&
    receiptArtifact.output_contract_ref === oneCommandSummary.primary_agent_output_contract_ref,
  one_command_outputs_are_confined:
    oneCommandSummary.artifact_dir_path === artifactDirPath &&
    dirname(oneCommandSummary.primary_agent_output_path) === artifactDirPath &&
    dirname(oneCommandSummary.one_command_summary_output_path) === artifactDirPath &&
    oneCommandSummary.one_command_paths_confined_to_artifact_dir === true &&
    receiptArtifact.receipt_output_confined_to_entrypoint_artifact_dir === true,
  request_intent_is_preserved:
    oneCommandSummary.request_task_signal === "one command run repo-work context request" &&
    oneCommandSummary.request_read_mode_hint === "planning" &&
    oneCommandSummary.request_depth_hint === "standard" &&
    receiptArtifact.request_task_signal === oneCommandSummary.request_task_signal,
  receipt_is_agent_consumable:
    receiptArtifact.verification_result ===
      "local_real_source_agent_tool_run_receipt_v0_written" &&
    receiptArtifact.intended_consumer === "ai_agent" &&
    receiptArtifact.failure_count === 0 &&
    receiptArtifact.response_artifact_path === oneCommandSummary.response_artifact_path,
  bounded_response_is_discoverable:
    responseArtifact.output_contract_ref === "local-real-source-adapter-v0-response/v1" &&
    responseArtifact.output_contract_ref === receiptArtifact.artifact_contract_refs.response &&
    runSummaryArtifact.output_contract_ref === receiptArtifact.artifact_contract_refs.run_summary,
  selected_refs_are_consistent:
    oneCommandSummary.selected_scope_ids.join("|") === "scope:repo-work-context" &&
    oneCommandSummary.selected_source_refs.join("|") === selectedSourceRefs.join("|") &&
    receiptArtifact.selected_source_refs.join("|") === selectedSourceRefs.join("|") &&
    responseArtifact.selected_source_refs.join("|") === selectedSourceRefs.join("|"),
  content_and_envelope_refs_are_preserved:
    oneCommandSummary.content_digests.length === 2 &&
    oneCommandSummary.content_digests.join("|") === receiptArtifact.content_digests.join("|") &&
    oneCommandSummary.source_materialization_receipt_ref ===
      receiptArtifact.source_materialization_receipt_ref &&
    oneCommandSummary.provenance_envelope_ref === receiptArtifact.provenance_envelope_ref &&
    oneCommandSummary.permission_envelope_ref === receiptArtifact.permission_envelope_ref &&
    oneCommandSummary.audit_envelope_ref === receiptArtifact.audit_envelope_ref,
  default_deny_posture_preserved:
    oneCommandSummary.reads_only_entrypoint_discovered_artifacts === true &&
    oneCommandSummary.writes_only_fixed_artifacts_under_explicit_artifact_dir === true &&
    oneCommandSummary.direct_agent_repo_file_access_allowed_now === false &&
    oneCommandSummary.arbitrary_source_loading_allowed === false &&
    oneCommandSummary.arbitrary_file_read_allowed_now === false &&
    oneCommandSummary.user_selected_path_read_allowed_now === false &&
    oneCommandSummary.directory_traversal_allowed_now === false &&
    oneCommandSummary.directory_listing_allowed_now === false &&
    oneCommandSummary.repo_scanning_allowed_now === false &&
    oneCommandSummary.runtime_permission_granted === false &&
    oneCommandSummary.actual_contour_execution_allowed_now === false,
  runtime_surfaces_remain_closed:
    oneCommandSummary.child_process_spawned === false &&
    oneCommandSummary.mcp_server_implemented === false &&
    oneCommandSummary.mcp_tool_registered === false &&
    oneCommandSummary.mcp_resource_registered === false &&
    oneCommandSummary.api_route_registered === false &&
    oneCommandSummary.api_controller_registered === false &&
    oneCommandSummary.runtime_handler_bound === false &&
    oneCommandSummary.provider_sdk_call_allowed_now === false &&
    oneCommandSummary.transport_execution_allowed_now === false &&
    oneCommandSummary.concrete_persistence_read_allowed_now === false &&
    oneCommandSummary.concrete_persistence_write_allowed_now === false &&
    oneCommandSummary.real_model_call_allowed_now === false &&
    oneCommandSummary.real_storage_write_allowed_now === false
};

const failed = Object.entries(assertions)
  .filter(([, passed]) => passed !== true)
  .map(([name]) => name);

const verification = {
  verification_result:
    failed.length === 0
      ? "local_real_source_agent_tool_one_command_run_v0_verified"
      : "local_real_source_agent_tool_one_command_run_v0_failed",
  output_contract_ref: "local-real-source-agent-tool-one-command-run-v0/v1",
  primary_agent_output_path: oneCommandSummary.primary_agent_output_path,
  primary_agent_output_contract_ref: oneCommandSummary.primary_agent_output_contract_ref,
  one_command_summary_output_path: oneCommandSummary.one_command_summary_output_path,
  response_artifact_path: oneCommandSummary.response_artifact_path,
  selected_scope_ids: oneCommandSummary.selected_scope_ids,
  selected_source_refs: oneCommandSummary.selected_source_refs,
  content_digests: oneCommandSummary.content_digests,
  runtime_permission_granted: oneCommandSummary.runtime_permission_granted,
  actual_contour_execution_allowed_now:
    oneCommandSummary.actual_contour_execution_allowed_now,
  failure_count: failed.length,
  failures: failed
};

console.log(JSON.stringify(verification, null, 2));

if (failed.length > 0) {
  process.exit(1);
}
