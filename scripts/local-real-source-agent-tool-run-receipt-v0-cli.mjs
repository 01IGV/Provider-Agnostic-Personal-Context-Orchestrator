#!/usr/bin/env node

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const stableJson = (value) => `${JSON.stringify(value, null, 2)}\n`;
const usage =
  "Usage: node scripts/local-real-source-agent-tool-run-receipt-v0-cli.mjs --entrypoint-summary <path> --receipt-output <path>";

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

  if (
    args.size !== 2 ||
    !args.has("entrypoint-summary") ||
    !args.has("receipt-output")
  ) {
    throw new Error(usage);
  }

  return {
    entrypoint_summary_path: resolve(args.get("entrypoint-summary")),
    receipt_output_path: resolve(args.get("receipt-output"))
  };
};

const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));
const requiredArtifactPathKeys = [
  "request_output_path",
  "response_output_path",
  "summary_output_path",
  "index_output_path",
  "tool_pack_index_output_path",
  "consumption_summary_output_path",
  "run_consumption_index_output_path",
  "readiness_index_output_path",
  "entrypoint_summary_output_path"
];

const buildDeniedReceipt = ({
  entrypoint_summary_path,
  receipt_output_path,
  failure
}) => ({
  verification_result: "local_real_source_agent_tool_run_receipt_v0_denied",
  output_contract_ref: "local-real-source-agent-tool-run-receipt-v0/v1",
  entrypoint_summary_path,
  receipt_output_path,
  file_read_performed: true,
  file_write_performed: true,
  writes_only_explicit_run_receipt_output_path: true,
  reads_only_entrypoint_discovered_artifacts: false,
  direct_agent_repo_file_access_allowed_now: false,
  arbitrary_source_loading_allowed: false,
  runtime_permission_granted: false,
  actual_contour_execution_allowed_now: false,
  failure_count: 1,
  failures: [failure]
});

export const writeLocalRealSourceAgentToolRunReceiptV0 = ({
  entrypoint_summary_path,
  receipt_output_path
}) => {
  const entrypointSummary = readJson(entrypoint_summary_path);
  const artifactPaths = entrypointSummary.artifact_paths ?? {};
  const artifactDirPath = entrypointSummary.artifact_dir_path;
  const receiptOutputConfined =
    typeof artifactDirPath === "string" && dirname(receipt_output_path) === artifactDirPath;

  if (!receiptOutputConfined) {
    const deniedReceipt = buildDeniedReceipt({
      entrypoint_summary_path,
      receipt_output_path,
      failure: "receipt_output_not_confined_to_entrypoint_artifact_dir"
    });

    writeFileSync(receipt_output_path, stableJson(deniedReceipt), "utf8");

    return deniedReceipt;
  }

  const missingArtifactPathKeys = requiredArtifactPathKeys.filter(
    (key) => typeof artifactPaths[key] !== "string"
  );

  if (missingArtifactPathKeys.length > 0) {
    const deniedReceipt = buildDeniedReceipt({
      entrypoint_summary_path,
      receipt_output_path,
      failure: `missing_artifact_paths:${missingArtifactPathKeys.join(",")}`
    });

    writeFileSync(receipt_output_path, stableJson(deniedReceipt), "utf8");

    return deniedReceipt;
  }

  const artifactPathsConfined = requiredArtifactPathKeys.every(
    (key) => dirname(artifactPaths[key]) === artifactDirPath
  );

  if (!artifactPathsConfined) {
    const deniedReceipt = buildDeniedReceipt({
      entrypoint_summary_path,
      receipt_output_path,
      failure: "entrypoint_artifact_paths_not_confined_to_artifact_dir"
    });

    writeFileSync(receipt_output_path, stableJson(deniedReceipt), "utf8");

    return deniedReceipt;
  }

  const requestArtifact = readJson(artifactPaths.request_output_path);
  const responseArtifact = readJson(artifactPaths.response_output_path);
  const runSummaryArtifact = readJson(artifactPaths.summary_output_path);
  const runIndexArtifact = readJson(artifactPaths.index_output_path);
  const toolPackIndexArtifact = readJson(artifactPaths.tool_pack_index_output_path);
  const consumptionSummaryArtifact = readJson(artifactPaths.consumption_summary_output_path);
  const runConsumptionIndexArtifact = readJson(artifactPaths.run_consumption_index_output_path);
  const readinessIndexArtifact = readJson(artifactPaths.readiness_index_output_path);

  const selectedSourceRefs = entrypointSummary.selected_source_refs ?? [];
  const contentDigests = runSummaryArtifact.content_digests ?? [];
  const failures = [];

  if (
    entrypointSummary.verification_result !==
      "local_real_source_agent_tool_entrypoint_v0_completed" ||
    entrypointSummary.output_contract_ref !== "local-real-source-agent-tool-entrypoint-v0/v1"
  ) {
    failures.push("entrypoint_summary_not_completed");
  }

  if (responseArtifact.output_contract_ref !== "local-real-source-adapter-v0-response/v1") {
    failures.push("unexpected_response_contract_ref");
  }

  if (
    runSummaryArtifact.output_contract_ref !==
    "local-real-source-agent-request-runner-v0-summary/v1"
  ) {
    failures.push("unexpected_run_summary_contract_ref");
  }

  if (
    consumptionSummaryArtifact.output_contract_ref !==
    "local-real-source-tool-pack-index-consumption/v1"
  ) {
    failures.push("unexpected_consumption_summary_contract_ref");
  }

  if (
    selectedSourceRefs.join("|") !==
    (responseArtifact.selected_source_refs ?? []).join("|")
  ) {
    failures.push("selected_source_refs_not_preserved");
  }

  const runReceipt = {
    verification_result:
      failures.length === 0
        ? "local_real_source_agent_tool_run_receipt_v0_written"
        : "local_real_source_agent_tool_run_receipt_v0_failed",
    output_contract_ref: "local-real-source-agent-tool-run-receipt-v0/v1",
    intended_consumer: "ai_agent",
    artifact_boundary: "agent_consumable_local_real_source_tool_run_receipt",
    entrypoint_summary_path,
    receipt_output_path,
    artifact_dir_path: artifactDirPath,
    entrypoint_command_ref: entrypointSummary.entrypoint_command_ref,
    primary_command_ref: entrypointSummary.primary_command_ref,
    request_task_signal: entrypointSummary.request_task_signal,
    request_read_mode_hint: entrypointSummary.request_read_mode_hint,
    request_depth_hint: entrypointSummary.request_depth_hint,
    agent_context_request_id: runSummaryArtifact.agent_context_request_id,
    request_operation_id: runSummaryArtifact.request_operation_id,
    request_operation_version: runSummaryArtifact.request_operation_version,
    request_artifact_path: artifactPaths.request_output_path,
    response_artifact_path: artifactPaths.response_output_path,
    run_summary_artifact_path: artifactPaths.summary_output_path,
    run_index_artifact_path: artifactPaths.index_output_path,
    tool_pack_index_artifact_path: artifactPaths.tool_pack_index_output_path,
    consumption_summary_artifact_path: artifactPaths.consumption_summary_output_path,
    run_consumption_index_artifact_path: artifactPaths.run_consumption_index_output_path,
    readiness_index_artifact_path: artifactPaths.readiness_index_output_path,
    artifact_contract_refs: {
      entrypoint_summary: entrypointSummary.output_contract_ref,
      readiness_index: readinessIndexArtifact.output_contract_ref,
      request: requestArtifact.operation_version,
      response: responseArtifact.output_contract_ref,
      run_summary: runSummaryArtifact.output_contract_ref,
      run_index: runIndexArtifact.output_contract_ref,
      tool_pack_index: toolPackIndexArtifact.output_contract_ref,
      consumption_summary: consumptionSummaryArtifact.output_contract_ref,
      run_consumption_index: runConsumptionIndexArtifact.output_contract_ref
    },
    selected_scope_ids: entrypointSummary.selected_scope_ids,
    selected_source_refs: selectedSourceRefs,
    selected_source_item_count: entrypointSummary.selected_source_item_count,
    content_digests: contentDigests,
    source_materialization_receipt_ref: entrypointSummary.source_materialization_receipt_ref,
    provenance_envelope_ref: entrypointSummary.provenance_envelope_ref,
    permission_envelope_ref: entrypointSummary.permission_envelope_ref,
    audit_envelope_ref: entrypointSummary.audit_envelope_ref,
    verifier_commands: entrypointSummary.verifier_commands,
    agent_next_read_hints: [
      "read_response_artifact_path_for_bounded_context",
      "read_run_summary_artifact_path_for_compact_execution_posture",
      "read_consumption_summary_artifact_path_for_tool_pack_validation"
    ],
    artifact_paths_confined_to_entrypoint_artifact_dir: true,
    receipt_output_confined_to_entrypoint_artifact_dir: true,
    file_read_performed: true,
    file_write_performed: true,
    reads_only_entrypoint_discovered_artifacts: true,
    writes_only_explicit_run_receipt_output_path: true,
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
    runtime_permission_granted: entrypointSummary.runtime_permission_granted,
    actual_contour_execution_allowed_now: entrypointSummary.actual_contour_execution_allowed_now,
    failure_count: failures.length,
    failures
  };

  writeFileSync(receipt_output_path, stableJson(runReceipt), "utf8");

  return runReceipt;
};

const isDirectRun = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectRun) {
  try {
    const result = writeLocalRealSourceAgentToolRunReceiptV0(parseArgs(process.argv.slice(2)));

    console.log(stableJson(result));
    process.exit(result.failure_count === 0 ? 0 : 1);
  } catch (error) {
    console.error(
      stableJson({
        verification_result: "local_real_source_agent_tool_run_receipt_v0_failed",
        output_contract_ref: "local-real-source-agent-tool-run-receipt-v0/v1",
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
