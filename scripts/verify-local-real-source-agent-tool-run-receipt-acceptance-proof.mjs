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

const tempDir = mkdtempSync(
  join(tmpdir(), "local-real-source-agent-tool-run-receipt-acceptance-")
);
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
    task_signal: "run receipt acceptance proof repo-work context request",
    read_mode_hint: "planning",
    depth_hint: "standard"
  }
});
const entrypointSummaryPath = entrypointResult.artifact_paths.entrypoint_summary_output_path;

writeLocalRealSourceAgentToolRunReceiptV0({
  entrypoint_summary_path: entrypointSummaryPath,
  receipt_output_path: receiptOutputPath
});

const receiptArtifact = readJson(receiptOutputPath);
const receiptDeclaredArtifactPaths = [
  receiptArtifact.response_artifact_path,
  receiptArtifact.run_summary_artifact_path,
  receiptArtifact.run_index_artifact_path,
  receiptArtifact.tool_pack_index_artifact_path,
  receiptArtifact.consumption_summary_artifact_path,
  receiptArtifact.run_consumption_index_artifact_path,
  receiptArtifact.readiness_index_artifact_path
];
const [
  responseArtifact,
  runSummaryArtifact,
  runIndexArtifact,
  toolPackIndexArtifact,
  consumptionSummaryArtifact,
  runConsumptionIndexArtifact,
  readinessIndexArtifact
] = receiptDeclaredArtifactPaths.map((artifactPath) => readJson(artifactPath));

const assertions = {
  agent_starts_from_run_receipt:
    receiptArtifact.verification_result ===
      "local_real_source_agent_tool_run_receipt_v0_written" &&
    receiptArtifact.output_contract_ref === "local-real-source-agent-tool-run-receipt-v0/v1" &&
    receiptArtifact.intended_consumer === "ai_agent" &&
    receiptArtifact.artifact_boundary === "agent_consumable_local_real_source_tool_run_receipt" &&
    receiptArtifact.failure_count === 0,
  receipt_declares_all_agent_read_paths:
    receiptDeclaredArtifactPaths.every((artifactPath) => typeof artifactPath === "string") &&
    receiptDeclaredArtifactPaths.every((artifactPath) => dirname(artifactPath) === artifactDirPath) &&
    receiptArtifact.receipt_output_confined_to_entrypoint_artifact_dir === true &&
    dirname(receiptArtifact.receipt_output_path) === artifactDirPath,
  agent_uses_only_receipt_declared_artifacts:
    receiptArtifact.reads_only_entrypoint_discovered_artifacts === true &&
    receiptArtifact.agent_next_read_hints.includes(
      "read_response_artifact_path_for_bounded_context"
    ) &&
    receiptArtifact.agent_next_read_hints.includes(
      "read_run_summary_artifact_path_for_compact_execution_posture"
    ) &&
    receiptArtifact.agent_next_read_hints.includes(
      "read_consumption_summary_artifact_path_for_tool_pack_validation"
    ),
  bounded_response_contract_is_valid:
    responseArtifact.output_contract_ref === receiptArtifact.artifact_contract_refs.response &&
    responseArtifact.output_contract_ref === "local-real-source-adapter-v0-response/v1" &&
    responseArtifact.read_boundary_ref === "narrow-local-real-source-read-boundary/v1" &&
    responseArtifact.source_catalog_ref === "local-v0-source-catalog/v1",
  run_artifact_contracts_are_valid:
    runSummaryArtifact.output_contract_ref === receiptArtifact.artifact_contract_refs.run_summary &&
    runIndexArtifact.output_contract_ref === receiptArtifact.artifact_contract_refs.run_index &&
    toolPackIndexArtifact.output_contract_ref ===
      receiptArtifact.artifact_contract_refs.tool_pack_index &&
    consumptionSummaryArtifact.output_contract_ref ===
      receiptArtifact.artifact_contract_refs.consumption_summary &&
    runConsumptionIndexArtifact.output_contract_ref ===
      receiptArtifact.artifact_contract_refs.run_consumption_index &&
    readinessIndexArtifact.output_contract_ref ===
      receiptArtifact.artifact_contract_refs.readiness_index,
  selected_refs_are_consistent:
    receiptArtifact.selected_scope_ids.join("|") === "scope:repo-work-context" &&
    receiptArtifact.selected_source_refs.join("|") === selectedSourceRefs.join("|") &&
    responseArtifact.selected_scope_ids.join("|") === receiptArtifact.selected_scope_ids.join("|") &&
    responseArtifact.selected_source_refs.join("|") ===
      receiptArtifact.selected_source_refs.join("|") &&
    readinessIndexArtifact.selected_source_refs.join("|") ===
      receiptArtifact.selected_source_refs.join("|"),
  content_digests_are_validated_from_receipt:
    receiptArtifact.content_digests.length === 2 &&
    receiptArtifact.content_digests.every((digest) => digest.startsWith("sha256:")) &&
    receiptArtifact.content_digests.join("|") === runSummaryArtifact.content_digests.join("|"),
  materialization_and_envelope_refs_are_validated:
    receiptArtifact.source_materialization_receipt_ref ===
      runSummaryArtifact.source_materialization_receipt_ref &&
    receiptArtifact.source_materialization_receipt_ref ===
      readinessIndexArtifact.source_materialization_receipt_ref &&
    receiptArtifact.provenance_envelope_ref === runSummaryArtifact.provenance_envelope_ref &&
    receiptArtifact.permission_envelope_ref === runSummaryArtifact.permission_envelope_ref &&
    receiptArtifact.audit_envelope_ref === runSummaryArtifact.audit_envelope_ref,
  verifier_commands_are_agent_visible:
    receiptArtifact.verifier_commands.includes(
      "npm run tool:local-real-source-agent-tool-entrypoint-v0:verify"
    ) &&
    receiptArtifact.verifier_commands.includes(
      "npm run proof:local-real-source-agent-tool-readiness-acceptance:verify"
    ) &&
    receiptArtifact.verifier_commands.includes("npm run proof:authority-boundary-denial:verify"),
  default_deny_posture_preserved:
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
      ? "local_real_source_agent_tool_run_receipt_acceptance_proof_verified"
      : "local_real_source_agent_tool_run_receipt_acceptance_proof_failed",
  output_contract_ref: "local-real-source-agent-tool-run-receipt-acceptance-proof/v1",
  started_from_run_receipt: true,
  receipt_output_path: receiptOutputPath,
  receipt_declared_artifact_paths: receiptDeclaredArtifactPaths,
  response_artifact_path: receiptArtifact.response_artifact_path,
  selected_scope_ids: receiptArtifact.selected_scope_ids,
  selected_source_refs: receiptArtifact.selected_source_refs,
  content_digests: receiptArtifact.content_digests,
  source_materialization_receipt_ref: receiptArtifact.source_materialization_receipt_ref,
  provenance_envelope_ref: receiptArtifact.provenance_envelope_ref,
  permission_envelope_ref: receiptArtifact.permission_envelope_ref,
  audit_envelope_ref: receiptArtifact.audit_envelope_ref,
  direct_agent_repo_file_access_allowed_now:
    receiptArtifact.direct_agent_repo_file_access_allowed_now,
  runtime_permission_granted: receiptArtifact.runtime_permission_granted,
  actual_contour_execution_allowed_now: receiptArtifact.actual_contour_execution_allowed_now,
  failure_count: failed.length,
  failures: failed
};

console.log(JSON.stringify(verification, null, 2));

if (failed.length > 0) {
  process.exit(1);
}
