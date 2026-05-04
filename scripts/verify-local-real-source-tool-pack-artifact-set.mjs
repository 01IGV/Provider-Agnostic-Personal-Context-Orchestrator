#!/usr/bin/env node

import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { writeLocalRealSourceToolPackArtifactSet } from "./local-real-source-tool-pack-cli.mjs";

const tempDir = mkdtempSync(join(tmpdir(), "local-real-source-tool-pack-"));
const manifestOutputPath = join(tempDir, "local-json-agent-tool-manifest.json");
const requestOutputPath = join(tempDir, "agent-context-request.real-source-tool-pack.sample.json");
const responseOutputPath = join(tempDir, "local-real-source-tool-pack.sample.response.json");
const summaryOutputPath = join(tempDir, "local-real-source-tool-pack.sample.summary.json");
const indexOutputPath = join(tempDir, "local-real-source-tool-pack.sample.index.json");
const sampleIndexOutputPath = join(
  tempDir,
  "local-real-source-tool-pack.sample.artifact-set.index.json"
);
const toolPackIndexOutputPath = join(tempDir, "local-real-source-tool-pack.index.json");
const expectedRefs = [
  "repo-file://docs/04-implementation/CURRENT_IMPLEMENTATION_STATE.md",
  "repo-file://docs/04-implementation/KNOWN_IMPLEMENTATION_ISSUES.md"
];
const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));

const toolPackWriteResult = writeLocalRealSourceToolPackArtifactSet({
  manifest_output_path: manifestOutputPath,
  request_output_path: requestOutputPath,
  response_output_path: responseOutputPath,
  summary_output_path: summaryOutputPath,
  index_output_path: indexOutputPath,
  sample_index_output_path: sampleIndexOutputPath,
  tool_pack_index_output_path: toolPackIndexOutputPath
});
const manifestArtifact = readJson(manifestOutputPath);
const requestArtifact = readJson(requestOutputPath);
const responseArtifact = readJson(responseOutputPath);
const summaryArtifact = readJson(summaryOutputPath);
const indexArtifact = readJson(indexOutputPath);
const sampleIndexArtifact = readJson(sampleIndexOutputPath);
const toolPackIndexArtifact = readJson(toolPackIndexOutputPath);
const commandRefs = manifestArtifact.commands.map((command) => command.command_ref);
const receipt = responseArtifact.source_materialization_receipt ?? {};

const assertions = {
  tool_pack_written:
    toolPackWriteResult.verification_result ===
      "local_real_source_tool_pack_artifact_set_written" &&
    toolPackWriteResult.output_contract_ref === "local-real-source-tool-pack-artifact-set/v1" &&
    toolPackWriteResult.failure_count === 0,
  explicit_paths_used:
    toolPackIndexArtifact.artifact_paths.manifest_output_path === manifestOutputPath &&
    toolPackIndexArtifact.artifact_paths.request_output_path === requestOutputPath &&
    toolPackIndexArtifact.artifact_paths.response_output_path === responseOutputPath &&
    toolPackIndexArtifact.artifact_paths.summary_output_path === summaryOutputPath &&
    toolPackIndexArtifact.artifact_paths.index_output_path === indexOutputPath &&
    toolPackIndexArtifact.artifact_paths.sample_index_output_path === sampleIndexOutputPath &&
    toolPackIndexArtifact.artifact_paths.tool_pack_index_output_path === toolPackIndexOutputPath &&
    toolPackIndexArtifact.writes_only_explicit_real_source_tool_pack_artifact_paths === true,
  contracts_match_artifacts:
    toolPackIndexArtifact.artifact_contract_refs.manifest ===
      "local-json-agent-tool-manifest-artifact/v1" &&
    toolPackIndexArtifact.artifact_contract_refs.request === requestArtifact.operation_version &&
    toolPackIndexArtifact.artifact_contract_refs.response === responseArtifact.output_contract_ref &&
    toolPackIndexArtifact.artifact_contract_refs.run_summary ===
      summaryArtifact.output_contract_ref &&
    toolPackIndexArtifact.artifact_contract_refs.run_index === indexArtifact.output_contract_ref &&
    toolPackIndexArtifact.artifact_contract_refs.sample_index ===
      sampleIndexArtifact.output_contract_ref &&
    toolPackIndexArtifact.artifact_contract_refs.source_materialization_receipt ===
      receipt.receipt_version &&
    toolPackIndexArtifact.artifact_contract_refs.read_boundary === responseArtifact.read_boundary_ref &&
    toolPackIndexArtifact.artifact_contract_refs.source_catalog === responseArtifact.source_catalog_ref,
  manifest_advertises_real_source_tool_pack:
    commandRefs.includes("tool:local-real-source-single-command-agent-tool-v0:run") &&
    commandRefs.includes("tool:local-real-source-single-command-sample:write") &&
    commandRefs.includes("tool:local-real-source-tool-pack:write") &&
    manifestArtifact.recommended_sequence.includes("tool:local-real-source-tool-pack:write") &&
    manifestArtifact.commands
      .find((command) => command.command_ref === "tool:local-real-source-tool-pack:write")
      ?.command.includes("--tool-pack-index-output <path>") === true,
  tool_pack_points_to_real_source_path:
    toolPackIndexArtifact.required_command_refs.includes(
      "tool:local-real-source-single-command-agent-tool-v0:run"
    ) &&
    toolPackIndexArtifact.required_command_refs.includes(
      "tool:local-real-source-single-command-sample:write"
    ) &&
    toolPackIndexArtifact.recommended_start_command.includes(
      "tool:local-real-source-single-command-agent-tool-v0:run"
    ) &&
    toolPackIndexArtifact.sample_writer_command.includes(
      "tool:local-real-source-single-command-sample:write"
    ) &&
    toolPackIndexArtifact.verifier_command === "npm run tool:local-real-source-tool-pack:verify",
  selected_refs_preserved:
    toolPackIndexArtifact.selected_scope_ids.join("|") === "scope:repo-work-context" &&
    toolPackIndexArtifact.selected_source_refs.join("|") === expectedRefs.join("|") &&
    sampleIndexArtifact.selected_source_refs.join("|") === expectedRefs.join("|") &&
    summaryArtifact.selected_source_refs.join("|") === expectedRefs.join("|"),
  receipt_digests_and_envelopes_preserved:
    toolPackIndexArtifact.source_materialization_receipt_ref ===
      "local-v0-source-materialization-receipt/v1" &&
    toolPackIndexArtifact.source_materialization_receipt_id ===
      sampleIndexArtifact.source_materialization_receipt_id &&
    toolPackIndexArtifact.content_digests.every((digest) => digest.startsWith("sha256:")) &&
    toolPackIndexArtifact.content_digests.join("|") ===
      sampleIndexArtifact.content_digests.join("|") &&
    typeof toolPackIndexArtifact.provenance_envelope_ref === "string" &&
    typeof toolPackIndexArtifact.permission_envelope_ref === "string" &&
    typeof toolPackIndexArtifact.audit_envelope_ref === "string",
  default_deny_posture_preserved:
    toolPackIndexArtifact.direct_agent_repo_file_access_allowed_now === false &&
    toolPackIndexArtifact.arbitrary_source_loading_allowed === false &&
    toolPackIndexArtifact.arbitrary_file_read_allowed_now === false &&
    toolPackIndexArtifact.user_selected_path_read_allowed_now === false &&
    toolPackIndexArtifact.directory_traversal_allowed_now === false &&
    toolPackIndexArtifact.directory_listing_allowed_now === false &&
    toolPackIndexArtifact.repo_scanning_allowed_now === false &&
    toolPackIndexArtifact.runtime_permission_granted === false &&
    toolPackIndexArtifact.actual_contour_execution_allowed_now === false,
  runtime_surfaces_remain_closed:
    toolPackIndexArtifact.child_process_spawned === false &&
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
      ? "local_real_source_tool_pack_artifact_set_verified"
      : "local_real_source_tool_pack_artifact_set_failed",
  output_contract_ref: toolPackWriteResult.output_contract_ref,
  manifest_output_path: manifestOutputPath,
  request_output_path: requestOutputPath,
  response_output_path: responseOutputPath,
  summary_output_path: summaryOutputPath,
  index_output_path: indexOutputPath,
  sample_index_output_path: sampleIndexOutputPath,
  tool_pack_index_output_path: toolPackIndexOutputPath,
  selected_scope_ids: toolPackIndexArtifact.selected_scope_ids,
  selected_source_refs: toolPackIndexArtifact.selected_source_refs,
  source_materialization_receipt_ref: toolPackIndexArtifact.source_materialization_receipt_ref,
  runtime_permission_granted: toolPackIndexArtifact.runtime_permission_granted,
  actual_contour_execution_allowed_now:
    toolPackIndexArtifact.actual_contour_execution_allowed_now,
  failure_count: failed.length,
  failures: failed
};

console.log(JSON.stringify(verification, null, 2));

if (failed.length > 0) {
  process.exit(1);
}
