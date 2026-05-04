#!/usr/bin/env node

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import {
  writeLocalRealSourceAgentToolReadinessIndex
} from "./local-real-source-agent-tool-readiness-index-cli.mjs";

const stableJson = (value) => `${JSON.stringify(value, null, 2)}\n`;
const usage =
  "Usage: node scripts/local-real-source-agent-tool-entrypoint-v0-cli.mjs --artifact-dir <path> [--task-signal <text>] [--read-mode <mode>] [--depth <hint>]";

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

  const allowedArgs = new Set(["artifact-dir", "task-signal", "read-mode", "depth"]);

  if (!args.has("artifact-dir") || [...args.keys()].some((key) => !allowedArgs.has(key))) {
    throw new Error(usage);
  }

  return {
    artifact_dir_path: resolve(args.get("artifact-dir")),
    variation: {
      task_signal: args.get("task-signal"),
      read_mode_hint: args.get("read-mode"),
      depth_hint: args.get("depth")
    }
  };
};

const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));
const fixedArtifactNames = {
  manifest_output_path: "local-json-agent-tool-manifest.json",
  request_output_path: "agent-context-request.real-source-entrypoint.sample.json",
  response_output_path: "local-real-source-entrypoint.sample.response.json",
  summary_output_path: "local-real-source-entrypoint.sample.summary.json",
  index_output_path: "local-real-source-entrypoint.sample.index.json",
  sample_index_output_path: "local-real-source-entrypoint.sample.artifact-set.index.json",
  tool_pack_index_output_path: "local-real-source-tool-pack.index.json",
  consumption_summary_output_path: "local-real-source-entrypoint.consumption.summary.json",
  run_consumption_index_output_path: "local-real-source-entrypoint.run-consumption.index.json",
  readiness_index_output_path: "local-real-source-agent-tool.readiness.index.json",
  entrypoint_summary_output_path: "local-real-source-agent-tool.entrypoint.summary.json"
};
const artifactPathKeys = Object.keys(fixedArtifactNames);

const buildArtifactPaths = (artifactDirPath) =>
  Object.fromEntries(
    artifactPathKeys.map((key) => [key, join(artifactDirPath, fixedArtifactNames[key])])
  );

const fixedArtifactPathsStayInDirectory = (artifactDirPath, artifactPaths) =>
  artifactPathKeys.every((key) => dirname(artifactPaths[key]) === artifactDirPath);

export const runLocalRealSourceAgentToolEntrypointV0 = ({ artifact_dir_path, variation }) => {
  const artifactPaths = buildArtifactPaths(artifact_dir_path);
  const fixedPathsConfined = fixedArtifactPathsStayInDirectory(artifact_dir_path, artifactPaths);

  if (!fixedPathsConfined) {
    return {
      verification_result: "local_real_source_agent_tool_entrypoint_v0_denied",
      output_contract_ref: "local-real-source-agent-tool-entrypoint-v0/v1",
      artifact_dir_path,
      artifact_paths: artifactPaths,
      fixed_artifact_paths_confined_to_artifact_dir: false,
      artifact_dir_created: false,
      file_read_performed: false,
      file_write_performed: false,
      writes_only_fixed_artifacts_under_explicit_artifact_dir: true,
      direct_agent_repo_file_access_allowed_now: false,
      arbitrary_source_loading_allowed: false,
      runtime_permission_granted: false,
      actual_contour_execution_allowed_now: false,
      failure_count: 1,
      failures: ["fixed_artifact_paths_not_confined_to_artifact_dir"]
    };
  }

  mkdirSync(artifact_dir_path, { recursive: true });

  const readinessResult = writeLocalRealSourceAgentToolReadinessIndex({
    ...artifactPaths,
    variation
  });
  const readinessIndexArtifact = readJson(artifactPaths.readiness_index_output_path);
  const failures = readinessResult.failures ?? [];
  const entrypointSummary = {
    verification_result:
      failures.length === 0
        ? "local_real_source_agent_tool_entrypoint_v0_completed"
        : "local_real_source_agent_tool_entrypoint_v0_denied",
    output_contract_ref: "local-real-source-agent-tool-entrypoint-v0/v1",
    intended_consumer: "ai_agent",
    artifact_dir_path,
    entrypoint_command_ref: "tool:local-real-source-agent-tool-entrypoint-v0:run",
    readiness_index_output_path: artifactPaths.readiness_index_output_path,
    readiness_index_contract_ref: readinessIndexArtifact.output_contract_ref,
    primary_command_ref: readinessIndexArtifact.primary_command_ref,
    request_task_signal: readinessIndexArtifact.request_task_signal,
    request_read_mode_hint: readinessIndexArtifact.request_read_mode_hint,
    request_depth_hint: readinessIndexArtifact.request_depth_hint,
    recommended_command: readinessIndexArtifact.recommended_command,
    verifier_commands: [
      "npm run tool:local-real-source-agent-tool-entrypoint-v0:verify",
      "npm run proof:local-real-source-agent-tool-readiness-acceptance:verify",
      ...readinessIndexArtifact.verifier_commands
    ],
    artifact_paths: artifactPaths,
    fixed_artifact_names: fixedArtifactNames,
    fixed_artifact_paths_confined_to_artifact_dir: true,
    artifact_contract_refs: {
      readiness_index: readinessIndexArtifact.output_contract_ref,
      entrypoint_summary: "local-real-source-agent-tool-entrypoint-v0/v1",
      ...readinessIndexArtifact.artifact_contract_refs
    },
    selected_scope_ids: readinessIndexArtifact.selected_scope_ids,
    selected_source_refs: readinessIndexArtifact.selected_source_refs,
    selected_source_item_count: readinessIndexArtifact.selected_source_item_count,
    source_materialization_receipt_ref: readinessIndexArtifact.source_materialization_receipt_ref,
    provenance_envelope_ref: readinessIndexArtifact.provenance_envelope_ref,
    permission_envelope_ref: readinessIndexArtifact.permission_envelope_ref,
    audit_envelope_ref: readinessIndexArtifact.audit_envelope_ref,
    readiness_posture: readinessIndexArtifact.readiness_posture,
    artifact_dir_created: true,
    file_read_performed: true,
    file_write_performed: true,
    writes_only_fixed_artifacts_under_explicit_artifact_dir: true,
    reads_only_authored_request_and_narrow_real_source_refs:
      readinessIndexArtifact.reads_only_authored_request_and_narrow_real_source_refs,
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
    runtime_permission_granted: readinessIndexArtifact.runtime_permission_granted,
    actual_contour_execution_allowed_now:
      readinessIndexArtifact.actual_contour_execution_allowed_now,
    failure_count: failures.length,
    failures
  };

  writeFileSync(artifactPaths.entrypoint_summary_output_path, stableJson(entrypointSummary), "utf8");

  return entrypointSummary;
};

const isDirectRun = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectRun) {
  try {
    const result = runLocalRealSourceAgentToolEntrypointV0(parseArgs(process.argv.slice(2)));

    console.log(stableJson(result));
    process.exit(result.failure_count === 0 ? 0 : 1);
  } catch (error) {
    console.error(
      stableJson({
        verification_result: "local_real_source_agent_tool_entrypoint_v0_failed",
        output_contract_ref: "local-real-source-agent-tool-entrypoint-v0/v1",
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
