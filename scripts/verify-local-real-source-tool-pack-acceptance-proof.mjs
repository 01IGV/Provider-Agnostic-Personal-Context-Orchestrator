#!/usr/bin/env node

import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { writeLocalRealSourceToolPackArtifactSet } from "./local-real-source-tool-pack-cli.mjs";

const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));

const tempDir = mkdtempSync(join(tmpdir(), "local-real-source-tool-pack-acceptance-"));
const manifestOutputPath = join(tempDir, "local-json-agent-tool-manifest.json");
const requestOutputPath = join(tempDir, "agent-context-request.real-source-acceptance.sample.json");
const responseOutputPath = join(tempDir, "local-real-source-acceptance.sample.response.json");
const summaryOutputPath = join(tempDir, "local-real-source-acceptance.sample.summary.json");
const indexOutputPath = join(tempDir, "local-real-source-acceptance.sample.index.json");
const sampleIndexOutputPath = join(
  tempDir,
  "local-real-source-acceptance.sample.artifact-set.index.json"
);
const toolPackIndexOutputPath = join(tempDir, "local-real-source-tool-pack.index.json");
const expectedRefs = [
  "repo-file://docs/04-implementation/CURRENT_IMPLEMENTATION_STATE.md",
  "repo-file://docs/04-implementation/KNOWN_IMPLEMENTATION_ISSUES.md"
];

const toolPackWriteResult = writeLocalRealSourceToolPackArtifactSet({
  manifest_output_path: manifestOutputPath,
  request_output_path: requestOutputPath,
  response_output_path: responseOutputPath,
  summary_output_path: summaryOutputPath,
  index_output_path: indexOutputPath,
  sample_index_output_path: sampleIndexOutputPath,
  tool_pack_index_output_path: toolPackIndexOutputPath
});

const toolPackIndexArtifact = readJson(toolPackIndexOutputPath);
const discoveredPaths = toolPackIndexArtifact.artifact_paths;
const manifestArtifact = readJson(discoveredPaths.manifest_output_path);
const requestArtifact = readJson(discoveredPaths.request_output_path);
const responseArtifact = readJson(discoveredPaths.response_output_path);
const summaryArtifact = readJson(discoveredPaths.summary_output_path);
const indexArtifact = readJson(discoveredPaths.index_output_path);
const sampleIndexArtifact = readJson(discoveredPaths.sample_index_output_path);
const manifestCommandRefs = manifestArtifact.commands.map((command) => command.command_ref);
const receipt = responseArtifact.source_materialization_receipt ?? {};

const assertions = {
  tool_pack_materialized:
    toolPackWriteResult.verification_result ===
      "local_real_source_tool_pack_artifact_set_written" &&
    toolPackWriteResult.output_contract_ref === "local-real-source-tool-pack-artifact-set/v1" &&
    toolPackWriteResult.failure_count === 0 &&
    toolPackIndexArtifact.failure_count === 0,
  agent_starts_from_tool_pack_index:
    discoveredPaths.tool_pack_index_output_path === toolPackIndexOutputPath &&
    discoveredPaths.manifest_output_path === manifestOutputPath &&
    discoveredPaths.request_output_path === requestOutputPath &&
    discoveredPaths.response_output_path === responseOutputPath &&
    discoveredPaths.summary_output_path === summaryOutputPath &&
    discoveredPaths.index_output_path === indexOutputPath &&
    discoveredPaths.sample_index_output_path === sampleIndexOutputPath,
  manifest_and_commands_are_discoverable:
    manifestCommandRefs.includes("tool:local-real-source-tool-pack:write") &&
    manifestCommandRefs.includes("tool:local-real-source-single-command-agent-tool-v0:run") &&
    manifestCommandRefs.includes("tool:local-real-source-single-command-sample:write") &&
    toolPackIndexArtifact.required_command_refs.includes(
      "tool:local-real-source-single-command-agent-tool-v0:run"
    ) &&
    toolPackIndexArtifact.required_command_refs.includes(
      "tool:local-real-source-single-command-sample:write"
    ) &&
    toolPackIndexArtifact.required_command_refs.includes("tool:local-real-source-tool-pack:write"),
  artifact_refs_are_discoverable:
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
  acceptance_semantics_match_tool_pack:
    requestArtifact.intent.requested_scope_hints.join("|") === "scope:repo-work-context" &&
    toolPackIndexArtifact.selected_scope_ids.join("|") === "scope:repo-work-context" &&
    toolPackIndexArtifact.selected_source_refs.join("|") === expectedRefs.join("|") &&
    sampleIndexArtifact.selected_source_refs.join("|") === expectedRefs.join("|") &&
    summaryArtifact.selected_source_refs.join("|") === expectedRefs.join("|"),
  receipt_digests_and_envelopes_are_carried:
    toolPackIndexArtifact.source_materialization_receipt_ref ===
      "local-v0-source-materialization-receipt/v1" &&
    toolPackIndexArtifact.source_materialization_receipt_id === receipt.receipt_id &&
    toolPackIndexArtifact.content_digests.every((digest) => digest.startsWith("sha256:")) &&
    toolPackIndexArtifact.content_digests.join("|") === summaryArtifact.content_digests.join("|") &&
    toolPackIndexArtifact.provenance_envelope_ref === summaryArtifact.provenance_envelope_ref &&
    toolPackIndexArtifact.permission_envelope_ref === summaryArtifact.permission_envelope_ref &&
    toolPackIndexArtifact.audit_envelope_ref === summaryArtifact.audit_envelope_ref,
  bounded_file_io_only:
    toolPackIndexArtifact.writes_only_explicit_real_source_tool_pack_artifact_paths === true &&
    toolPackIndexArtifact.reads_only_authored_request_and_narrow_real_source_refs === true &&
    sampleIndexArtifact.writes_only_explicit_sample_artifact_paths === true &&
    summaryArtifact.writes_only_explicit_response_summary_index_paths === true,
  default_deny_posture_preserved:
    toolPackIndexArtifact.direct_agent_repo_file_access_allowed_now === false &&
    toolPackIndexArtifact.arbitrary_source_loading_allowed === false &&
    toolPackIndexArtifact.arbitrary_file_read_allowed_now === false &&
    toolPackIndexArtifact.user_selected_path_read_allowed_now === false &&
    toolPackIndexArtifact.directory_traversal_allowed_now === false &&
    toolPackIndexArtifact.directory_listing_allowed_now === false &&
    toolPackIndexArtifact.repo_scanning_allowed_now === false &&
    toolPackIndexArtifact.runtime_permission_granted === false &&
    toolPackIndexArtifact.actual_contour_execution_allowed_now === false &&
    summaryArtifact.runtime_permission_granted === false &&
    summaryArtifact.actual_contour_execution_allowed_now === false,
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
      ? "local_real_source_tool_pack_acceptance_proof_verified"
      : "local_real_source_tool_pack_acceptance_proof_failed",
  output_contract_ref: "local-real-source-tool-pack-acceptance-proof/v1",
  tool_pack_index_output_path: toolPackIndexOutputPath,
  manifest_output_path: discoveredPaths.manifest_output_path,
  request_output_path: discoveredPaths.request_output_path,
  response_output_path: discoveredPaths.response_output_path,
  summary_output_path: discoveredPaths.summary_output_path,
  index_output_path: discoveredPaths.index_output_path,
  sample_index_output_path: discoveredPaths.sample_index_output_path,
  agent_context_request_id: toolPackIndexArtifact.agent_context_request_id,
  selected_scope_ids: toolPackIndexArtifact.selected_scope_ids,
  selected_source_refs: toolPackIndexArtifact.selected_source_refs,
  source_materialization_receipt_ref: toolPackIndexArtifact.source_materialization_receipt_ref,
  content_digests: toolPackIndexArtifact.content_digests,
  started_from_tool_pack_index: true,
  used_discovered_manifest_and_sample_refs: failed.length === 0,
  writes_only_explicit_proof_artifact_paths: true,
  direct_agent_repo_file_access_allowed_now: false,
  arbitrary_source_loading_allowed: false,
  child_process_spawned: false,
  mcp_server_implemented: false,
  mcp_tool_registered: false,
  mcp_resource_registered: false,
  api_route_registered: false,
  api_controller_registered: false,
  runtime_handler_bound: false,
  provider_sdk_call_allowed_now: false,
  transport_execution_allowed_now: false,
  concrete_persistence_read_allowed_now: false,
  concrete_persistence_write_allowed_now: false,
  real_model_call_allowed_now: false,
  real_storage_write_allowed_now: false,
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
