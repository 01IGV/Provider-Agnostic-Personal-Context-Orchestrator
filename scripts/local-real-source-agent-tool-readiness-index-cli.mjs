#!/usr/bin/env node

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import {
  writeLocalRealSourceToolPackSingleCommandConsumptionSample
} from "./local-real-source-tool-pack-single-command-consumption-sample-cli.mjs";

const stableJson = (value) => `${JSON.stringify(value, null, 2)}\n`;
const usage =
  "Usage: node scripts/local-real-source-agent-tool-readiness-index-cli.mjs --manifest-output <path> --request-output <path> --response-output <path> --summary-output <path> --index-output <path> --sample-index-output <path> --tool-pack-index-output <path> --consumption-summary-output <path> --run-consumption-index-output <path> --readiness-index-output <path>";
const requiredArgs = [
  "manifest-output",
  "request-output",
  "response-output",
  "summary-output",
  "index-output",
  "sample-index-output",
  "tool-pack-index-output",
  "consumption-summary-output",
  "run-consumption-index-output",
  "readiness-index-output"
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
  "run_consumption_index_output_path",
  "readiness_index_output_path"
];

const outputPathsShareToolPackDirectory = (args) => {
  const toolPackDirectory = dirname(args.tool_pack_index_output_path);

  return artifactPathKeys.every((key) => dirname(args[key]) === toolPackDirectory);
};

export const writeLocalRealSourceAgentToolReadinessIndex = (args) => {
  if (!outputPathsShareToolPackDirectory(args)) {
    const deniedIndex = {
      verification_result: "local_real_source_agent_tool_readiness_index_denied",
      output_contract_ref: "local-real-source-agent-tool-readiness-index/v1",
      artifact_paths: Object.fromEntries(artifactPathKeys.map((key) => [key, args[key]])),
      output_paths_confined_to_tool_pack_directory: false,
      file_write_performed: true,
      writes_only_explicit_readiness_artifact_paths: true,
      direct_agent_repo_file_access_allowed_now: false,
      arbitrary_source_loading_allowed: false,
      runtime_permission_granted: false,
      actual_contour_execution_allowed_now: false,
      failure_count: 1,
      failures: ["output_paths_not_confined_to_tool_pack_directory"]
    };

    writeFileSync(args.readiness_index_output_path, stableJson(deniedIndex), "utf8");

    return deniedIndex;
  }

  const sampleResult = writeLocalRealSourceToolPackSingleCommandConsumptionSample({
    manifest_output_path: args.manifest_output_path,
    request_output_path: args.request_output_path,
    response_output_path: args.response_output_path,
    summary_output_path: args.summary_output_path,
    index_output_path: args.index_output_path,
    sample_index_output_path: args.sample_index_output_path,
    tool_pack_index_output_path: args.tool_pack_index_output_path,
    consumption_summary_output_path: args.consumption_summary_output_path,
    run_consumption_index_output_path: args.run_consumption_index_output_path
  });
  const manifestArtifact = readJson(args.manifest_output_path);
  const toolPackIndexArtifact = readJson(args.tool_pack_index_output_path);
  const consumptionSummaryArtifact = readJson(args.consumption_summary_output_path);
  const runConsumptionIndexArtifact = readJson(args.run_consumption_index_output_path);
  const commandRefs = manifestArtifact.commands.map((command) => command.command_ref);
  const failures = sampleResult.failures ?? [];

  const readinessIndex = {
    verification_result:
      failures.length === 0
        ? "local_real_source_agent_tool_readiness_index_written"
        : "local_real_source_agent_tool_readiness_index_failed",
    output_contract_ref: "local-real-source-agent-tool-readiness-index/v1",
    intended_consumer: "ai_agent",
    primary_command_ref: "tool:local-real-source-tool-pack:run-consume-v0",
    sample_writer_command_ref: "tool:local-real-source-tool-pack-run-consume-sample:write",
    readiness_writer_command_ref: "tool:local-real-source-agent-tool-readiness-index:write",
    recommended_command:
      "npm run tool:local-real-source-tool-pack:run-consume-v0 -- --manifest-output <path> --request-output <path> --response-output <path> --summary-output <path> --index-output <path> --sample-index-output <path> --tool-pack-index-output <path> --consumption-summary-output <path>",
    verifier_commands: [
      "npm run tool:local-real-source-agent-tool-readiness-index:verify",
      "npm run tool:local-real-source-tool-pack-run-consume-sample:verify",
      "npm run tool:local-real-source-tool-pack-run-consume-v0:verify",
      "npm run proof:authority-boundary-denial:verify"
    ],
    artifact_paths: Object.fromEntries(artifactPathKeys.map((key) => [key, args[key]])),
    artifact_contract_refs: {
      manifest: manifestArtifact.manifest_version,
      tool_pack_index: toolPackIndexArtifact.output_contract_ref,
      consumption_summary: consumptionSummaryArtifact.output_contract_ref,
      run_consumption_index: runConsumptionIndexArtifact.output_contract_ref,
      readiness_index: "local-real-source-agent-tool-readiness-index/v1"
    },
    command_refs: commandRefs,
    required_command_refs: [
      "tool:local-real-source-tool-pack:run-consume-v0",
      "tool:local-real-source-tool-pack-run-consume-sample:write",
      "tool:local-real-source-agent-tool-readiness-index:write"
    ],
    agent_context_request_id: sampleResult.agent_context_request_id,
    selected_scope_ids: sampleResult.selected_scope_ids,
    selected_source_refs: sampleResult.selected_source_refs,
    selected_source_item_count: sampleResult.selected_source_item_count,
    content_digests: sampleResult.content_digests,
    source_materialization_receipt_ref: sampleResult.source_materialization_receipt_ref,
    provenance_envelope_ref: sampleResult.provenance_envelope_ref,
    permission_envelope_ref: sampleResult.permission_envelope_ref,
    audit_envelope_ref: sampleResult.audit_envelope_ref,
    readiness_posture: "local_agent_tool_ready_without_transport_runtime",
    output_paths_confined_to_tool_pack_directory: true,
    file_read_performed: true,
    file_write_performed: true,
    writes_only_explicit_readiness_artifact_paths: true,
    reads_only_authored_request_and_narrow_real_source_refs:
      sampleResult.reads_only_authored_request_and_narrow_real_source_refs,
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
    runtime_permission_granted: sampleResult.runtime_permission_granted,
    actual_contour_execution_allowed_now: sampleResult.actual_contour_execution_allowed_now,
    failure_count: failures.length,
    failures
  };

  writeFileSync(args.readiness_index_output_path, stableJson(readinessIndex), "utf8");

  return readinessIndex;
};

const isDirectRun = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectRun) {
  try {
    const result = writeLocalRealSourceAgentToolReadinessIndex(parseArgs(process.argv.slice(2)));

    console.log(stableJson(result));
    process.exit(result.failure_count === 0 ? 0 : 1);
  } catch (error) {
    console.error(
      stableJson({
        verification_result: "local_real_source_agent_tool_readiness_index_failed",
        output_contract_ref: "local-real-source-agent-tool-readiness-index/v1",
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
