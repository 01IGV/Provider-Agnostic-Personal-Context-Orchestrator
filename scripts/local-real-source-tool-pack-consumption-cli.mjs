#!/usr/bin/env node

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const stableJson = (value) => `${JSON.stringify(value, null, 2)}\n`;
const usage =
  "Usage: node scripts/local-real-source-tool-pack-consumption-cli.mjs --tool-pack-index <path> --manifest <path> --request <path> --response <path> --summary <path> --index <path> --sample-index <path> --consumption-summary-output <path>";
const requiredArgs = [
  "tool-pack-index",
  "manifest",
  "request",
  "response",
  "summary",
  "index",
  "sample-index",
  "consumption-summary-output"
];

const parseArgs = (argv) => {
  const args = new Map();

  for (let index = 0; index < argv.length; index += 2) {
    const key = argv[index];
    const value = argv[index + 1];

    if (!key?.startsWith("--") || !value) {
      throw new Error(usage);
    }

    args.set(key.slice(2), value);
  }

  const missing = requiredArgs.filter((key) => !args.has(key));

  if (missing.length > 0 || args.size !== requiredArgs.length) {
    throw new Error(usage);
  }

  return {
    tool_pack_index_path: resolve(args.get("tool-pack-index")),
    manifest_path: resolve(args.get("manifest")),
    request_path: resolve(args.get("request")),
    response_path: resolve(args.get("response")),
    summary_path: resolve(args.get("summary")),
    index_path: resolve(args.get("index")),
    sample_index_path: resolve(args.get("sample-index")),
    consumption_summary_output_path: resolve(args.get("consumption-summary-output"))
  };
};

const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));

const sameArray = (left, right) =>
  Array.isArray(left) &&
  Array.isArray(right) &&
  left.length === right.length &&
  left.every((item, index) => item === right[index]);

export const runLocalRealSourceToolPackConsumption = ({
  tool_pack_index_path,
  manifest_path,
  request_path,
  response_path,
  summary_path,
  index_path,
  sample_index_path,
  consumption_summary_output_path
}) => {
  const toolPackIndex = readJson(tool_pack_index_path);
  const manifest = readJson(manifest_path);
  const request = readJson(request_path);
  const response = readJson(response_path);
  const summary = readJson(summary_path);
  const index = readJson(index_path);
  const sampleIndex = readJson(sample_index_path);
  const receipt = response.source_materialization_receipt ?? {};
  const manifestCommandRefs = manifest.commands?.map((command) => command.command_ref) ?? [];

  const pathFailures = [];

  if (toolPackIndex?.artifact_paths?.tool_pack_index_output_path !== tool_pack_index_path) {
    pathFailures.push("tool_pack_index_path_mismatch");
  }
  if (toolPackIndex?.artifact_paths?.manifest_output_path !== manifest_path) {
    pathFailures.push("manifest_path_mismatch");
  }
  if (toolPackIndex?.artifact_paths?.request_output_path !== request_path) {
    pathFailures.push("request_path_mismatch");
  }
  if (toolPackIndex?.artifact_paths?.response_output_path !== response_path) {
    pathFailures.push("response_path_mismatch");
  }
  if (toolPackIndex?.artifact_paths?.summary_output_path !== summary_path) {
    pathFailures.push("summary_path_mismatch");
  }
  if (toolPackIndex?.artifact_paths?.index_output_path !== index_path) {
    pathFailures.push("index_path_mismatch");
  }
  if (toolPackIndex?.artifact_paths?.sample_index_output_path !== sample_index_path) {
    pathFailures.push("sample_index_path_mismatch");
  }

  const contractFailures = [];

  if (toolPackIndex?.output_contract_ref !== "local-real-source-tool-pack-artifact-set/v1") {
    contractFailures.push("tool_pack_contract_ref_mismatch");
  }
  if (manifest?.manifest_version !== "local-json-agent-tool-manifest/v1") {
    contractFailures.push("manifest_version_mismatch");
  }
  if (!manifestCommandRefs.includes("tool:local-real-source-tool-pack:consume")) {
    contractFailures.push("manifest_missing_real_source_tool_pack_consume_command");
  }
  if (
    toolPackIndex?.artifact_contract_refs?.request !== request?.operation_version ||
    toolPackIndex?.artifact_contract_refs?.response !== response?.output_contract_ref ||
    toolPackIndex?.artifact_contract_refs?.run_summary !== summary?.output_contract_ref ||
    toolPackIndex?.artifact_contract_refs?.run_index !== index?.output_contract_ref ||
    toolPackIndex?.artifact_contract_refs?.sample_index !== sampleIndex?.output_contract_ref ||
    toolPackIndex?.artifact_contract_refs?.source_materialization_receipt !== receipt?.receipt_version
  ) {
    contractFailures.push("artifact_contract_refs_mismatch");
  }
  if (
    !sameArray(toolPackIndex?.selected_scope_ids, ["scope:repo-work-context"]) ||
    !sameArray(toolPackIndex?.selected_scope_ids, sampleIndex?.selected_scope_ids) ||
    !sameArray(toolPackIndex?.selected_source_refs, sampleIndex?.selected_source_refs) ||
    !sameArray(toolPackIndex?.selected_source_refs, summary?.selected_source_refs)
  ) {
    contractFailures.push("selected_scope_or_source_refs_mismatch");
  }
  if (
    toolPackIndex?.source_materialization_receipt_ref !==
      "local-v0-source-materialization-receipt/v1" ||
    toolPackIndex?.source_materialization_receipt_id !== receipt?.receipt_id ||
    !sameArray(toolPackIndex?.content_digests, summary?.content_digests)
  ) {
    contractFailures.push("receipt_or_digest_mismatch");
  }
  if (
    toolPackIndex?.provenance_envelope_ref !== summary?.provenance_envelope_ref ||
    toolPackIndex?.permission_envelope_ref !== summary?.permission_envelope_ref ||
    toolPackIndex?.audit_envelope_ref !== summary?.audit_envelope_ref
  ) {
    contractFailures.push("envelope_ref_mismatch");
  }

  const postureFailures = [];

  if (
    toolPackIndex?.direct_agent_repo_file_access_allowed_now !== false ||
    toolPackIndex?.arbitrary_source_loading_allowed !== false ||
    toolPackIndex?.arbitrary_file_read_allowed_now !== false ||
    toolPackIndex?.user_selected_path_read_allowed_now !== false ||
    toolPackIndex?.directory_traversal_allowed_now !== false ||
    toolPackIndex?.directory_listing_allowed_now !== false ||
    toolPackIndex?.repo_scanning_allowed_now !== false ||
    toolPackIndex?.runtime_permission_granted !== false ||
    toolPackIndex?.actual_contour_execution_allowed_now !== false
  ) {
    postureFailures.push("default_deny_posture_mismatch");
  }
  if (
    toolPackIndex?.mcp_server_implemented !== false ||
    toolPackIndex?.mcp_tool_registered !== false ||
    toolPackIndex?.mcp_resource_registered !== false ||
    toolPackIndex?.api_route_registered !== false ||
    toolPackIndex?.api_controller_registered !== false ||
    toolPackIndex?.runtime_handler_bound !== false ||
    toolPackIndex?.provider_sdk_call_allowed_now !== false ||
    toolPackIndex?.transport_execution_allowed_now !== false ||
    toolPackIndex?.concrete_persistence_read_allowed_now !== false ||
    toolPackIndex?.concrete_persistence_write_allowed_now !== false ||
    toolPackIndex?.real_model_call_allowed_now !== false ||
    toolPackIndex?.real_storage_write_allowed_now !== false
  ) {
    postureFailures.push("runtime_surface_posture_mismatch");
  }

  const failures = [...pathFailures, ...contractFailures, ...postureFailures];
  const consumptionSummary = {
    verification_result:
      failures.length === 0
        ? "local_real_source_tool_pack_consumption_completed"
        : "local_real_source_tool_pack_consumption_failed",
    output_contract_ref: "local-real-source-tool-pack-consumption/v1",
    tool_pack_contract_ref: toolPackIndex.output_contract_ref,
    tool_pack_index_path,
    manifest_path,
    request_path,
    response_path,
    summary_path,
    index_path,
    sample_index_path,
    consumption_summary_output_path,
    agent_context_request_id: toolPackIndex.agent_context_request_id,
    selected_scope_ids: toolPackIndex.selected_scope_ids,
    selected_source_refs: toolPackIndex.selected_source_refs,
    source_materialization_receipt_ref: toolPackIndex.source_materialization_receipt_ref,
    content_digests: toolPackIndex.content_digests,
    provenance_envelope_ref: toolPackIndex.provenance_envelope_ref,
    permission_envelope_ref: toolPackIndex.permission_envelope_ref,
    audit_envelope_ref: toolPackIndex.audit_envelope_ref,
    file_read_performed: true,
    file_write_performed: true,
    writes_only_explicit_consumption_summary_path: true,
    child_process_spawned: false,
    direct_agent_repo_file_access_allowed_now: false,
    arbitrary_source_loading_allowed: false,
    arbitrary_file_read_allowed_now: false,
    user_selected_path_read_allowed_now: false,
    directory_traversal_allowed_now: false,
    directory_listing_allowed_now: false,
    repo_scanning_allowed_now: false,
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
    runtime_permission_granted: false,
    actual_contour_execution_allowed_now: false,
    failure_count: failures.length,
    failures
  };

  writeFileSync(consumption_summary_output_path, stableJson(consumptionSummary), "utf8");

  return consumptionSummary;
};

const isDirectRun = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectRun) {
  try {
    const result = runLocalRealSourceToolPackConsumption(parseArgs(process.argv.slice(2)));

    console.log(stableJson(result));
    process.exit(result.failure_count === 0 ? 0 : 1);
  } catch (error) {
    console.error(
      stableJson({
        verification_result: "local_real_source_tool_pack_consumption_failed",
        output_contract_ref: "local-real-source-tool-pack-consumption/v1",
        message: error instanceof Error ? error.message : String(error),
        file_write_performed: false,
        runtime_permission_granted: false,
        actual_contour_execution_allowed_now: false,
        failure_count: 1
      })
    );
    process.exit(1);
  }
}
