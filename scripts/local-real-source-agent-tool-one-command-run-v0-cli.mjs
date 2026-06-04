#!/usr/bin/env node

import { writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import {
  runLocalRealSourceAgentToolEntrypointV0
} from "./local-real-source-agent-tool-entrypoint-v0-cli.mjs";
import {
  writeLocalRealSourceAgentToolRunReceiptV0
} from "./local-real-source-agent-tool-run-receipt-v0-cli.mjs";

const stableJson = (value) => `${JSON.stringify(value, null, 2)}\n`;
const usage =
  "Usage: node scripts/local-real-source-agent-tool-one-command-run-v0-cli.mjs --artifact-dir <path> [--task-signal <text>] [--read-mode <mode>] [--depth <hint>]";

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

const buildOneCommandPaths = (artifactDirPath) => ({
  run_receipt_output_path: join(artifactDirPath, "local-real-source-agent-tool.run-receipt.json"),
  one_command_summary_output_path: join(
    artifactDirPath,
    "local-real-source-agent-tool.one-command-run.summary.json"
  )
});

const oneCommandPathsStayInDirectory = (artifactDirPath, paths) =>
  Object.values(paths).every((path) => dirname(path) === artifactDirPath);

export const runLocalRealSourceAgentToolOneCommandRunV0 = ({
  artifact_dir_path,
  variation
}) => {
  const oneCommandPaths = buildOneCommandPaths(artifact_dir_path);
  const oneCommandPathsConfined = oneCommandPathsStayInDirectory(
    artifact_dir_path,
    oneCommandPaths
  );

  if (!oneCommandPathsConfined) {
    return {
      verification_result: "local_real_source_agent_tool_one_command_run_v0_denied",
      output_contract_ref: "local-real-source-agent-tool-one-command-run-v0/v1",
      artifact_dir_path,
      ...oneCommandPaths,
      one_command_paths_confined_to_artifact_dir: false,
      run_receipt_written: false,
      file_read_performed: false,
      file_write_performed: false,
      writes_only_fixed_artifacts_under_explicit_artifact_dir: true,
      child_process_spawned: false,
      direct_agent_repo_file_access_allowed_now: false,
      arbitrary_source_loading_allowed: false,
      runtime_permission_granted: false,
      actual_contour_execution_allowed_now: false,
      failure_count: 1,
      failures: ["one_command_paths_not_confined_to_artifact_dir"]
    };
  }

  const entrypointResult = runLocalRealSourceAgentToolEntrypointV0({
    artifact_dir_path,
    variation
  });
  const receiptResult = writeLocalRealSourceAgentToolRunReceiptV0({
    entrypoint_summary_path: entrypointResult.artifact_paths.entrypoint_summary_output_path,
    receipt_output_path: oneCommandPaths.run_receipt_output_path
  });
  const failures = [
    ...(entrypointResult.failures ?? []),
    ...(receiptResult.failures ?? [])
  ];

  if (
    entrypointResult.verification_result !==
    "local_real_source_agent_tool_entrypoint_v0_completed"
  ) {
    failures.push("entrypoint_not_completed");
  }

  if (
    receiptResult.verification_result !==
    "local_real_source_agent_tool_run_receipt_v0_written"
  ) {
    failures.push("run_receipt_not_written");
  }

  const oneCommandSummary = {
    verification_result:
      failures.length === 0
        ? "local_real_source_agent_tool_one_command_run_v0_completed"
        : "local_real_source_agent_tool_one_command_run_v0_failed",
    output_contract_ref: "local-real-source-agent-tool-one-command-run-v0/v1",
    intended_consumer: "ai_agent",
    artifact_boundary: "agent_consumable_local_real_source_tool_one_command_run",
    artifact_dir_path,
    one_command_run_command_ref: "tool:local-real-source-agent-tool-one-command-run-v0:run",
    entrypoint_command_ref: entrypointResult.entrypoint_command_ref,
    receipt_writer_command_ref: "tool:local-real-source-agent-tool-run-receipt-v0:write",
    primary_agent_output_path: oneCommandPaths.run_receipt_output_path,
    primary_agent_output_contract_ref: receiptResult.output_contract_ref,
    primary_agent_output_kind: "run_receipt",
    run_receipt_output_path: oneCommandPaths.run_receipt_output_path,
    one_command_summary_output_path: oneCommandPaths.one_command_summary_output_path,
    entrypoint_summary_output_path: entrypointResult.artifact_paths.entrypoint_summary_output_path,
    readiness_index_output_path: entrypointResult.readiness_index_output_path,
    response_artifact_path: receiptResult.response_artifact_path,
    run_summary_artifact_path: receiptResult.run_summary_artifact_path,
    request_task_signal: receiptResult.request_task_signal,
    request_read_mode_hint: receiptResult.request_read_mode_hint,
    request_depth_hint: receiptResult.request_depth_hint,
    selected_scope_ids: receiptResult.selected_scope_ids,
    selected_source_refs: receiptResult.selected_source_refs,
    selected_source_item_count: receiptResult.selected_source_item_count,
    content_digests: receiptResult.content_digests,
    source_materialization_receipt_ref: receiptResult.source_materialization_receipt_ref,
    provenance_envelope_ref: receiptResult.provenance_envelope_ref,
    permission_envelope_ref: receiptResult.permission_envelope_ref,
    audit_envelope_ref: receiptResult.audit_envelope_ref,
    agent_next_read_hints: [
      "start_from_primary_agent_output_path",
      "read_run_receipt_before_following_receipt_declared_artifacts"
    ],
    verifier_commands: [
      "npm run tool:local-real-source-agent-tool-one-command-run-v0:verify",
      "npm run proof:local-real-source-agent-tool-run-receipt-acceptance:verify"
    ],
    one_command_paths_confined_to_artifact_dir: true,
    receipt_output_confined_to_entrypoint_artifact_dir:
      receiptResult.receipt_output_confined_to_entrypoint_artifact_dir,
    file_read_performed: true,
    file_write_performed: true,
    writes_only_fixed_artifacts_under_explicit_artifact_dir: true,
    reads_only_entrypoint_discovered_artifacts:
      receiptResult.reads_only_entrypoint_discovered_artifacts,
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
    runtime_permission_granted: receiptResult.runtime_permission_granted,
    actual_contour_execution_allowed_now: receiptResult.actual_contour_execution_allowed_now,
    failure_count: failures.length,
    failures
  };

  writeFileSync(
    oneCommandPaths.one_command_summary_output_path,
    stableJson(oneCommandSummary),
    "utf8"
  );

  return oneCommandSummary;
};

const isDirectRun = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectRun) {
  try {
    const result = runLocalRealSourceAgentToolOneCommandRunV0(parseArgs(process.argv.slice(2)));

    console.log(stableJson(result));
    process.exit(result.failure_count === 0 ? 0 : 1);
  } catch (error) {
    console.error(
      stableJson({
        verification_result: "local_real_source_agent_tool_one_command_run_v0_failed",
        output_contract_ref: "local-real-source-agent-tool-one-command-run-v0/v1",
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
