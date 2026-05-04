#!/usr/bin/env node

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import {
  runLocalRealSourceSingleCommandAgentToolV0
} from "./local-real-source-single-command-agent-tool-v0-cli.mjs";

const stableJson = (value) => `${JSON.stringify(value, null, 2)}\n`;
const usage =
  "Usage: node scripts/local-real-source-single-command-sample-cli.mjs --request-output <path> --response-output <path> --summary-output <path> --index-output <path> --sample-index-output <path>";
const requiredArgs = [
  "request-output",
  "response-output",
  "summary-output",
  "index-output",
  "sample-index-output"
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

export const writeLocalRealSourceSingleCommandSampleArtifactSet = ({
  request_output_path,
  response_output_path,
  summary_output_path,
  index_output_path,
  sample_index_output_path
}) => {
  const runResult = runLocalRealSourceSingleCommandAgentToolV0({
    request_output_path,
    response_output_path,
    summary_output_path,
    index_output_path,
    variation: {
      task_signal: "sample real-source single-command repo-work context request",
      read_mode_hint: "planning",
      depth_hint: "standard"
    }
  });
  const requestArtifact = readJson(request_output_path);
  const responseArtifact = readJson(response_output_path);
  const summaryArtifact = readJson(summary_output_path);
  const indexArtifact = readJson(index_output_path);
  const receipt = responseArtifact.source_materialization_receipt ?? {};
  const sampleIndexArtifact = {
    verification_result: "local_real_source_single_command_sample_artifact_set_written",
    output_contract_ref: "local-real-source-single-command-sample-artifact-set/v1",
    intended_consumer: "ai_agent",
    sample_command:
      "npm run tool:local-real-source-single-command-agent-tool-v0:run -- --request-output <path> --response-output <path> --summary-output <path> --index-output <path>",
    artifact_paths: {
      request_output_path,
      response_output_path,
      summary_output_path,
      index_output_path,
      sample_index_output_path
    },
    artifact_contract_refs: {
      request: requestArtifact.operation_version,
      response: responseArtifact.output_contract_ref,
      run_summary: summaryArtifact.output_contract_ref,
      run_index: indexArtifact.output_contract_ref,
      source_materialization_receipt: receipt.receipt_version,
      read_boundary: responseArtifact.read_boundary_ref,
      source_catalog: responseArtifact.source_catalog_ref
    },
    agent_context_request_id: runResult.agent_context_request_id,
    requested_scope_hints: runResult.requested_scope_hints,
    selected_scope_ids: runResult.selected_scope_ids,
    selected_source_refs: runResult.selected_source_refs,
    selected_source_item_count: runResult.selected_source_item_count,
    content_digests: runResult.content_digests,
    source_materialization_receipt_id: receipt.receipt_id,
    source_materialization_receipt_ref: receipt.receipt_version,
    provenance_envelope_ref: runResult.provenance_envelope_ref,
    permission_envelope_ref: runResult.permission_envelope_ref,
    audit_envelope_ref: runResult.audit_envelope_ref,
    file_read_performed: true,
    file_write_performed: true,
    writes_only_explicit_sample_artifact_paths: true,
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
    runtime_permission_granted: runResult.runtime_permission_granted,
    actual_contour_execution_allowed_now: runResult.actual_contour_execution_allowed_now,
    failure_count: runResult.failure_count,
    failures: runResult.failures
  };

  writeFileSync(sample_index_output_path, stableJson(sampleIndexArtifact), "utf8");

  return sampleIndexArtifact;
};

const isDirectRun = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectRun) {
  try {
    const result = writeLocalRealSourceSingleCommandSampleArtifactSet(
      parseArgs(process.argv.slice(2))
    );

    console.log(stableJson(result));
    process.exit(result.failure_count === 0 ? 0 : 1);
  } catch (error) {
    console.error(
      stableJson({
        verification_result: "local_real_source_single_command_sample_artifact_set_failed",
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
