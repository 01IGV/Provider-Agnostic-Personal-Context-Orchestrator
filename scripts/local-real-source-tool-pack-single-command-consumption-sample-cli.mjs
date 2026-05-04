#!/usr/bin/env node

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import {
  runLocalRealSourceToolPackSingleCommandConsumptionV0
} from "./local-real-source-tool-pack-single-command-consumption-v0-cli.mjs";

const stableJson = (value) => `${JSON.stringify(value, null, 2)}\n`;
const usage =
  "Usage: node scripts/local-real-source-tool-pack-single-command-consumption-sample-cli.mjs --manifest-output <path> --request-output <path> --response-output <path> --summary-output <path> --index-output <path> --sample-index-output <path> --tool-pack-index-output <path> --consumption-summary-output <path> --run-consumption-index-output <path>";
const requiredArgs = [
  "manifest-output",
  "request-output",
  "response-output",
  "summary-output",
  "index-output",
  "sample-index-output",
  "tool-pack-index-output",
  "consumption-summary-output",
  "run-consumption-index-output"
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
const artifactPathKeys = [
  "manifest_output_path",
  "request_output_path",
  "response_output_path",
  "summary_output_path",
  "index_output_path",
  "sample_index_output_path",
  "tool_pack_index_output_path",
  "consumption_summary_output_path",
  "run_consumption_index_output_path"
];

const outputPathsShareToolPackDirectory = (args) => {
  const toolPackDirectory = dirname(args.tool_pack_index_output_path);

  return artifactPathKeys.every((key) => dirname(args[key]) === toolPackDirectory);
};

export const writeLocalRealSourceToolPackSingleCommandConsumptionSample = (args) => {
  if (!outputPathsShareToolPackDirectory(args)) {
    const deniedIndex = {
      verification_result:
        "local_real_source_tool_pack_single_command_consumption_sample_denied",
      output_contract_ref:
        "local-real-source-tool-pack-single-command-consumption-sample-artifact-set/v1",
      artifact_paths: Object.fromEntries(artifactPathKeys.map((key) => [key, args[key]])),
      output_paths_confined_to_tool_pack_directory: false,
      file_write_performed: true,
      writes_only_explicit_sample_artifact_paths: true,
      direct_agent_repo_file_access_allowed_now: false,
      arbitrary_source_loading_allowed: false,
      runtime_permission_granted: false,
      actual_contour_execution_allowed_now: false,
      failure_count: 1,
      failures: ["output_paths_not_confined_to_tool_pack_directory"]
    };

    writeFileSync(args.run_consumption_index_output_path, stableJson(deniedIndex), "utf8");

    return deniedIndex;
  }

  const runResult = runLocalRealSourceToolPackSingleCommandConsumptionV0({
    manifest_output_path: args.manifest_output_path,
    request_output_path: args.request_output_path,
    response_output_path: args.response_output_path,
    summary_output_path: args.summary_output_path,
    index_output_path: args.index_output_path,
    sample_index_output_path: args.sample_index_output_path,
    tool_pack_index_output_path: args.tool_pack_index_output_path,
    consumption_summary_output_path: args.consumption_summary_output_path,
    variation: args.variation
  });
  const manifestArtifact = readJson(args.manifest_output_path);
  const requestArtifact = readJson(args.request_output_path);
  const responseArtifact = readJson(args.response_output_path);
  const summaryArtifact = readJson(args.summary_output_path);
  const indexArtifact = readJson(args.index_output_path);
  const sampleIndexArtifact = readJson(args.sample_index_output_path);
  const toolPackIndexArtifact = readJson(args.tool_pack_index_output_path);
  const consumptionSummaryArtifact = readJson(args.consumption_summary_output_path);
  const receipt = responseArtifact.source_materialization_receipt ?? {};

  const runConsumptionIndex = {
    verification_result:
      runResult.failure_count === 0
        ? "local_real_source_tool_pack_single_command_consumption_sample_written"
        : "local_real_source_tool_pack_single_command_consumption_sample_failed",
    output_contract_ref:
      "local-real-source-tool-pack-single-command-consumption-sample-artifact-set/v1",
    intended_consumer: "ai_agent",
    sample_command:
      "npm run tool:local-real-source-tool-pack:run-consume-v0 -- --manifest-output <path> --request-output <path> --response-output <path> --summary-output <path> --index-output <path> --sample-index-output <path> --tool-pack-index-output <path> --consumption-summary-output <path>",
    artifact_paths: Object.fromEntries(artifactPathKeys.map((key) => [key, args[key]])),
    artifact_contract_refs: {
      manifest: manifestArtifact.manifest_version,
      request: requestArtifact.operation_version,
      response: responseArtifact.output_contract_ref,
      run_summary: summaryArtifact.output_contract_ref,
      run_index: indexArtifact.output_contract_ref,
      sample_index: sampleIndexArtifact.output_contract_ref,
      tool_pack_index: toolPackIndexArtifact.output_contract_ref,
      consumption_summary: consumptionSummaryArtifact.output_contract_ref,
      source_materialization_receipt: receipt.receipt_version,
      read_boundary: responseArtifact.read_boundary_ref,
      source_catalog: responseArtifact.source_catalog_ref
    },
    agent_context_request_id: runResult.agent_context_request_id,
    request_task_signal: runResult.request_task_signal,
    request_read_mode_hint: runResult.request_read_mode_hint,
    request_depth_hint: runResult.request_depth_hint,
    selected_scope_ids: runResult.selected_scope_ids,
    selected_source_refs: runResult.selected_source_refs,
    selected_source_item_count: toolPackIndexArtifact.selected_source_item_count,
    content_digests: runResult.content_digests,
    source_materialization_receipt_ref: runResult.source_materialization_receipt_ref,
    provenance_envelope_ref: runResult.provenance_envelope_ref,
    permission_envelope_ref: runResult.permission_envelope_ref,
    audit_envelope_ref: runResult.audit_envelope_ref,
    tool_pack_contract_ref: runResult.tool_pack_contract_ref,
    single_command_consumption_contract_ref: runResult.output_contract_ref,
    index_consumption_contract_ref: runResult.index_consumption_contract_ref,
    underlying_consumption_contract_ref: runResult.underlying_consumption_contract_ref,
    output_paths_confined_to_tool_pack_directory: runResult.output_paths_confined_to_tool_pack_directory,
    tool_pack_written: runResult.tool_pack_written,
    index_consumption_completed: runResult.index_consumption_completed,
    file_read_performed: true,
    file_write_performed: true,
    writes_only_explicit_sample_artifact_paths: true,
    writes_only_explicit_real_source_tool_pack_and_consumption_paths:
      runResult.writes_only_explicit_real_source_tool_pack_and_consumption_paths,
    reads_only_authored_request_and_narrow_real_source_refs:
      runResult.reads_only_authored_request_and_narrow_real_source_refs,
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
    runtime_permission_granted: runResult.runtime_permission_granted,
    actual_contour_execution_allowed_now: runResult.actual_contour_execution_allowed_now,
    failure_count: runResult.failure_count,
    failures: runResult.failures
  };

  writeFileSync(args.run_consumption_index_output_path, stableJson(runConsumptionIndex), "utf8");

  return runConsumptionIndex;
};

const isDirectRun = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectRun) {
  try {
    const result = writeLocalRealSourceToolPackSingleCommandConsumptionSample(
      parseArgs(process.argv.slice(2))
    );

    console.log(stableJson(result));
    process.exit(result.failure_count === 0 ? 0 : 1);
  } catch (error) {
    console.error(
      stableJson({
        verification_result:
          "local_real_source_tool_pack_single_command_consumption_sample_failed",
        output_contract_ref:
          "local-real-source-tool-pack-single-command-consumption-sample-artifact-set/v1",
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
