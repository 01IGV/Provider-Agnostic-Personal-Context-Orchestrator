#!/usr/bin/env node

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { writeLocalJsonAgentToolManifestArtifact } from "./local-json-agent-tool-manifest-cli.mjs";
import {
  writeLocalRealSourceSingleCommandSampleArtifactSet
} from "./local-real-source-single-command-sample-cli.mjs";

const stableJson = (value) => `${JSON.stringify(value, null, 2)}\n`;
const usage =
  "Usage: node scripts/local-real-source-tool-pack-cli.mjs --manifest-output <path> --request-output <path> --response-output <path> --summary-output <path> --index-output <path> --sample-index-output <path> --tool-pack-index-output <path>";
const requiredArgs = [
  "manifest-output",
  "request-output",
  "response-output",
  "summary-output",
  "index-output",
  "sample-index-output",
  "tool-pack-index-output"
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

  return Object.fromEntries(
    requiredArgs.map((key) => [
      `${key.replaceAll("-", "_")}_path`,
      resolve(args.get(key))
    ])
  );
};

const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));

export const writeLocalRealSourceToolPackArtifactSet = ({
  manifest_output_path,
  request_output_path,
  response_output_path,
  summary_output_path,
  index_output_path,
  sample_index_output_path,
  tool_pack_index_output_path,
  variation
}) => {
  const manifestWriteResult = writeLocalJsonAgentToolManifestArtifact({
    manifest_output_path
  });
  const sampleWriteResult = writeLocalRealSourceSingleCommandSampleArtifactSet({
    request_output_path,
    response_output_path,
    summary_output_path,
    index_output_path,
    sample_index_output_path,
    variation
  });
  const manifestArtifact = readJson(manifest_output_path);
  const requestArtifact = readJson(request_output_path);
  const responseArtifact = readJson(response_output_path);
  const summaryArtifact = readJson(summary_output_path);
  const indexArtifact = readJson(index_output_path);
  const sampleIndexArtifact = readJson(sample_index_output_path);
  const receipt = responseArtifact.source_materialization_receipt ?? {};

  const toolPackIndex = {
    verification_result: "local_real_source_tool_pack_artifact_set_written",
    output_contract_ref: "local-real-source-tool-pack-artifact-set/v1",
    intended_consumer: "ai_agent",
    protocol_surface: "local_json_cli_file_boundary",
    recommended_start_command:
      "npm run tool:local-real-source-single-command-agent-tool-v0:run -- --request-output <path> --response-output <path> --summary-output <path> --index-output <path>",
    sample_writer_command:
      "npm run tool:local-real-source-single-command-sample:write -- --request-output <path> --response-output <path> --summary-output <path> --index-output <path> --sample-index-output <path>",
    verifier_command: "npm run tool:local-real-source-tool-pack:verify",
    artifact_paths: {
      manifest_output_path,
      request_output_path,
      response_output_path,
      summary_output_path,
      index_output_path,
      sample_index_output_path,
      tool_pack_index_output_path
    },
    artifact_contract_refs: {
      manifest: manifestWriteResult.output_contract_ref,
      request: requestArtifact.operation_version,
      response: responseArtifact.output_contract_ref,
      run_summary: summaryArtifact.output_contract_ref,
      run_index: indexArtifact.output_contract_ref,
      sample_index: sampleIndexArtifact.output_contract_ref,
      source_materialization_receipt: receipt.receipt_version,
      read_boundary: responseArtifact.read_boundary_ref,
      source_catalog: responseArtifact.source_catalog_ref
    },
    command_refs: manifestArtifact.commands.map((command) => command.command_ref),
    required_command_refs: [
      "tool:local-real-source-single-command-agent-tool-v0:run",
      "tool:local-real-source-single-command-sample:write",
      "tool:local-real-source-tool-pack:write"
    ],
    agent_context_request_id: sampleIndexArtifact.agent_context_request_id,
    request_task_signal: sampleIndexArtifact.request_task_signal,
    request_read_mode_hint: sampleIndexArtifact.request_read_mode_hint,
    request_depth_hint: sampleIndexArtifact.request_depth_hint,
    requested_scope_hints: sampleIndexArtifact.requested_scope_hints,
    selected_scope_ids: sampleIndexArtifact.selected_scope_ids,
    selected_source_refs: sampleIndexArtifact.selected_source_refs,
    selected_source_item_count: sampleIndexArtifact.selected_source_item_count,
    content_digests: sampleIndexArtifact.content_digests,
    source_materialization_receipt_id: sampleIndexArtifact.source_materialization_receipt_id,
    source_materialization_receipt_ref: sampleIndexArtifact.source_materialization_receipt_ref,
    provenance_envelope_ref: sampleIndexArtifact.provenance_envelope_ref,
    permission_envelope_ref: sampleIndexArtifact.permission_envelope_ref,
    audit_envelope_ref: sampleIndexArtifact.audit_envelope_ref,
    read_boundary_ref: responseArtifact.read_boundary_ref,
    source_catalog_ref: responseArtifact.source_catalog_ref,
    file_read_performed: true,
    file_write_performed: true,
    writes_only_explicit_real_source_tool_pack_artifact_paths: true,
    reads_only_authored_request_and_narrow_real_source_refs: true,
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
    runtime_permission_granted: sampleIndexArtifact.runtime_permission_granted,
    actual_contour_execution_allowed_now: sampleIndexArtifact.actual_contour_execution_allowed_now,
    failure_count: manifestWriteResult.failure_count + sampleWriteResult.failure_count,
    failures: [...manifestWriteResult.failures, ...sampleWriteResult.failures]
  };

  writeFileSync(tool_pack_index_output_path, stableJson(toolPackIndex), "utf8");

  return toolPackIndex;
};

const isDirectRun = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectRun) {
  try {
    const result = writeLocalRealSourceToolPackArtifactSet(parseArgs(process.argv.slice(2)));

    console.log(stableJson(result));
    process.exit(result.failure_count === 0 ? 0 : 1);
  } catch (error) {
    console.error(
      stableJson({
        verification_result: "local_real_source_tool_pack_artifact_set_failed",
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
