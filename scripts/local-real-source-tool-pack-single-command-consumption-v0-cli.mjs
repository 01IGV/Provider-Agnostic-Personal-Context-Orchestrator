#!/usr/bin/env node

import { dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { writeLocalRealSourceToolPackArtifactSet } from "./local-real-source-tool-pack-cli.mjs";
import {
  runLocalRealSourceToolPackIndexConsumption
} from "./local-real-source-tool-pack-index-consumption-cli.mjs";

const stableJson = (value) => `${JSON.stringify(value, null, 2)}\n`;
const usage =
  "Usage: node scripts/local-real-source-tool-pack-single-command-consumption-v0-cli.mjs --manifest-output <path> --request-output <path> --response-output <path> --summary-output <path> --index-output <path> --sample-index-output <path> --tool-pack-index-output <path> --consumption-summary-output <path>";
const requiredArgs = [
  "manifest-output",
  "request-output",
  "response-output",
  "summary-output",
  "index-output",
  "sample-index-output",
  "tool-pack-index-output",
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

  return Object.fromEntries(
    requiredArgs.map((key) => [
      `${key.replaceAll("-", "_")}_path`,
      resolve(args.get(key))
    ])
  );
};

const artifactPathKeys = [
  "manifest_output_path",
  "request_output_path",
  "response_output_path",
  "summary_output_path",
  "index_output_path",
  "sample_index_output_path",
  "tool_pack_index_output_path",
  "consumption_summary_output_path"
];

const outputPathsShareToolPackDirectory = (args) => {
  const toolPackDirectory = dirname(args.tool_pack_index_output_path);

  return artifactPathKeys.every((key) => dirname(args[key]) === toolPackDirectory);
};

export const runLocalRealSourceToolPackSingleCommandConsumptionV0 = (args) => {
  if (!outputPathsShareToolPackDirectory(args)) {
    return {
      verification_result: "local_real_source_tool_pack_single_command_consumption_v0_denied",
      output_contract_ref: "local-real-source-tool-pack-single-command-consumption-v0/v1",
      ...Object.fromEntries(artifactPathKeys.map((key) => [key, args[key]])),
      output_paths_confined_to_tool_pack_directory: false,
      tool_pack_written: false,
      index_consumption_completed: false,
      writes_only_explicit_real_source_tool_pack_and_consumption_paths: true,
      direct_agent_repo_file_access_allowed_now: false,
      arbitrary_source_loading_allowed: false,
      user_selected_path_read_allowed_now: false,
      directory_traversal_allowed_now: false,
      directory_listing_allowed_now: false,
      repo_scanning_allowed_now: false,
      runtime_permission_granted: false,
      actual_contour_execution_allowed_now: false,
      failure_count: 1,
      failures: ["output_paths_not_confined_to_tool_pack_directory"]
    };
  }

  const toolPackWriteResult = writeLocalRealSourceToolPackArtifactSet({
    manifest_output_path: args.manifest_output_path,
    request_output_path: args.request_output_path,
    response_output_path: args.response_output_path,
    summary_output_path: args.summary_output_path,
    index_output_path: args.index_output_path,
    sample_index_output_path: args.sample_index_output_path,
    tool_pack_index_output_path: args.tool_pack_index_output_path
  });

  if (toolPackWriteResult.failure_count !== 0) {
    return {
      verification_result: "local_real_source_tool_pack_single_command_consumption_v0_denied",
      output_contract_ref: "local-real-source-tool-pack-single-command-consumption-v0/v1",
      ...Object.fromEntries(artifactPathKeys.map((key) => [key, args[key]])),
      output_paths_confined_to_tool_pack_directory: true,
      tool_pack_written: false,
      index_consumption_completed: false,
      tool_pack_contract_ref: toolPackWriteResult.output_contract_ref,
      writes_only_explicit_real_source_tool_pack_and_consumption_paths: true,
      direct_agent_repo_file_access_allowed_now: false,
      arbitrary_source_loading_allowed: false,
      runtime_permission_granted: false,
      actual_contour_execution_allowed_now: false,
      failure_count: toolPackWriteResult.failure_count,
      failures: toolPackWriteResult.failures
    };
  }

  const indexConsumptionResult = runLocalRealSourceToolPackIndexConsumption({
    tool_pack_index_path: args.tool_pack_index_output_path,
    consumption_summary_output_path: args.consumption_summary_output_path
  });
  const failures = indexConsumptionResult.failures ?? [];

  return {
    verification_result:
      failures.length === 0
        ? "local_real_source_tool_pack_single_command_consumption_v0_completed"
        : "local_real_source_tool_pack_single_command_consumption_v0_denied",
    output_contract_ref: "local-real-source-tool-pack-single-command-consumption-v0/v1",
    tool_pack_contract_ref: toolPackWriteResult.output_contract_ref,
    index_consumption_contract_ref: indexConsumptionResult.output_contract_ref,
    underlying_consumption_contract_ref:
      indexConsumptionResult.underlying_consumption_contract_ref,
    ...Object.fromEntries(artifactPathKeys.map((key) => [key, args[key]])),
    output_paths_confined_to_tool_pack_directory: true,
    tool_pack_written: true,
    index_consumption_completed: failures.length === 0,
    agent_context_request_id: indexConsumptionResult.agent_context_request_id,
    selected_scope_ids: indexConsumptionResult.selected_scope_ids,
    selected_source_refs: indexConsumptionResult.selected_source_refs,
    source_materialization_receipt_ref:
      indexConsumptionResult.source_materialization_receipt_ref,
    content_digests: indexConsumptionResult.content_digests,
    provenance_envelope_ref: indexConsumptionResult.provenance_envelope_ref,
    permission_envelope_ref: indexConsumptionResult.permission_envelope_ref,
    audit_envelope_ref: indexConsumptionResult.audit_envelope_ref,
    input_mode: indexConsumptionResult.input_mode,
    discovered_artifact_paths_from_tool_pack_index:
      indexConsumptionResult.discovered_artifact_paths_from_tool_pack_index,
    artifact_paths_confined_to_tool_pack_directory:
      indexConsumptionResult.artifact_paths_confined_to_tool_pack_directory,
    file_read_performed: true,
    file_write_performed: true,
    writes_only_explicit_real_source_tool_pack_and_consumption_paths: true,
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
    runtime_permission_granted: indexConsumptionResult.runtime_permission_granted,
    actual_contour_execution_allowed_now:
      indexConsumptionResult.actual_contour_execution_allowed_now,
    failure_count: failures.length,
    failures
  };
};

const isDirectRun = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectRun) {
  try {
    const result = runLocalRealSourceToolPackSingleCommandConsumptionV0(
      parseArgs(process.argv.slice(2))
    );

    console.log(stableJson(result));
    process.exit(result.failure_count === 0 ? 0 : 1);
  } catch (error) {
    console.error(
      stableJson({
        verification_result: "local_real_source_tool_pack_single_command_consumption_v0_failed",
        output_contract_ref: "local-real-source-tool-pack-single-command-consumption-v0/v1",
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
