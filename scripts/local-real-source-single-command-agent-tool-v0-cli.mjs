#!/usr/bin/env node

import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import {
  writeLocalJsonRequestFixture
} from "./local-json-request-fixture-authoring-cli.mjs";
import {
  runLocalRealSourceAgentRequestRunnerV0
} from "./local-real-source-agent-request-runner-v0-cli.mjs";

const stableJson = (value) => `${JSON.stringify(value, null, 2)}\n`;
const usage =
  "Usage: node scripts/local-real-source-single-command-agent-tool-v0-cli.mjs --request-output <path> --response-output <path> --summary-output <path> --index-output <path> [--task-signal <text>] [--read-mode <mode>] [--depth <hint>]";

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

  const requestOutput = args.get("request-output");
  const responseOutput = args.get("response-output");
  const summaryOutput = args.get("summary-output");
  const indexOutput = args.get("index-output");

  if (!requestOutput || !responseOutput || !summaryOutput || !indexOutput) {
    throw new Error(
      "The --request-output, --response-output, --summary-output, and --index-output paths are required."
    );
  }

  return {
    request_output_path: resolve(requestOutput),
    response_output_path: resolve(responseOutput),
    summary_output_path: resolve(summaryOutput),
    index_output_path: resolve(indexOutput),
    variation: {
      task_signal: args.get("task-signal"),
      read_mode_hint: args.get("read-mode"),
      depth_hint: args.get("depth")
    }
  };
};

export const runLocalRealSourceSingleCommandAgentToolV0 = ({
  request_output_path,
  response_output_path,
  summary_output_path,
  index_output_path,
  variation
}) => {
  const requestWriteResult = writeLocalJsonRequestFixture({
    output_path: request_output_path,
    variation: {
      task_signal:
        variation?.task_signal ?? "local real-source repo-work context request",
      read_mode_hint: variation?.read_mode_hint ?? "planning",
      depth_hint: variation?.depth_hint ?? "standard",
      requested_scope_hints: ["scope:repo-work-context"]
    }
  });

  if (requestWriteResult.failure_count !== 0) {
    return {
      verification_result: "local_real_source_single_command_agent_tool_v0_denied",
      output_contract_ref: "local-real-source-single-command-agent-tool-v0-summary/v1",
      request_output_path,
      response_output_path,
      summary_output_path,
      index_output_path,
      request_fixture_written: requestWriteResult.file_write_performed,
      response_file_write_performed: false,
      summary_file_write_performed: false,
      index_file_write_performed: false,
      writes_only_explicit_request_response_summary_index_paths: true,
      direct_agent_repo_file_access_allowed_now: false,
      runtime_permission_granted: false,
      actual_contour_execution_allowed_now: false,
      failure_count: requestWriteResult.failure_count,
      failures: requestWriteResult.failures
    };
  }

  const runResult = runLocalRealSourceAgentRequestRunnerV0({
    request_path: request_output_path,
    response_output_path,
    summary_output_path,
    index_output_path
  });

  return {
    verification_result:
      runResult.failure_count === 0
        ? "local_real_source_single_command_agent_tool_v0_completed"
        : "local_real_source_single_command_agent_tool_v0_denied",
    output_contract_ref: "local-real-source-single-command-agent-tool-v0-summary/v1",
    request_output_path,
    response_output_path,
    summary_output_path,
    index_output_path,
    agent_context_request_id: runResult.agent_context_request_id,
    request_operation_id: runResult.request_operation_id,
    request_operation_version: runResult.request_operation_version,
    request_task_signal: requestWriteResult.task_signal,
    request_read_mode_hint: requestWriteResult.read_mode_hint,
    request_depth_hint: requestWriteResult.depth_hint,
    requested_scope_hints: requestWriteResult.requested_scope_hints,
    selected_scope_ids: runResult.selected_scope_ids,
    selected_source_refs: runResult.selected_source_refs,
    selected_source_item_count: runResult.selected_source_item_count,
    content_digests: runResult.content_digests,
    source_materialization_receipt_id: runResult.source_materialization_receipt_id,
    source_materialization_receipt_ref: runResult.source_materialization_receipt_ref,
    read_boundary_ref: runResult.read_boundary_ref,
    source_catalog_ref: runResult.source_catalog_ref,
    provenance_envelope_ref: runResult.provenance_envelope_ref,
    permission_envelope_ref: runResult.permission_envelope_ref,
    audit_envelope_ref: runResult.audit_envelope_ref,
    request_fixture_written: requestWriteResult.file_write_performed,
    request_fixture_read: runResult.request_file_read_performed,
    source_read_performed: runResult.source_read_performed,
    live_source_read_performed: runResult.live_source_read_performed,
    response_file_write_performed: runResult.response_file_write_performed,
    summary_file_write_performed: runResult.summary_file_write_performed,
    index_file_write_performed: runResult.index_file_write_performed,
    writes_only_explicit_request_response_summary_index_paths: true,
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
};

const isDirectRun = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectRun) {
  try {
    const result = runLocalRealSourceSingleCommandAgentToolV0(
      parseArgs(process.argv.slice(2))
    );

    console.log(stableJson(result));
    process.exit(result.failure_count === 0 ? 0 : 1);
  } catch (error) {
    console.error(
      stableJson({
        verification_result: "local_real_source_single_command_agent_tool_v0_failed",
        output_contract_ref: "local-real-source-single-command-agent-tool-v0-summary/v1",
        message: error instanceof Error ? error.message : String(error),
        request_fixture_written: false,
        response_file_write_performed: false,
        summary_file_write_performed: false,
        index_file_write_performed: false,
        runtime_permission_granted: false,
        actual_contour_execution_allowed_now: false,
        failure_count: 1
      })
    );
    process.exit(1);
  }
}
