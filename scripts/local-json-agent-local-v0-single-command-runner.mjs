#!/usr/bin/env node

import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import {
  writeLocalJsonRequestFixture
} from "./local-json-request-fixture-authoring-cli.mjs";
import { runLocalJsonAgentRequestRunner } from "./local-json-agent-request-runner-cli.mjs";

const stableJson = (value) => `${JSON.stringify(value, null, 2)}\n`;
const usage =
  "Usage: node scripts/local-json-agent-local-v0-single-command-runner.mjs --request <path> --response <path> --summary <path> [--task-signal <text>] [--read-mode <mode>] [--depth <hint>] [--scope-hints <scope:a,scope:b>]";

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

  const request = args.get("request");
  const response = args.get("response");
  const summary = args.get("summary");

  if (!request || !response || !summary) {
    throw new Error("The --request, --response, and --summary paths are required.");
  }

  return {
    request_path: resolve(request),
    response_path: resolve(response),
    summary_path: resolve(summary),
    variation: {
      task_signal: args.get("task-signal"),
      read_mode_hint: args.get("read-mode"),
      depth_hint: args.get("depth"),
      requested_scope_hints: args
        .get("scope-hints")
        ?.split(",")
        .map((scopeHint) => scopeHint.trim())
        .filter(Boolean)
    }
  };
};

export const runLocalJsonAgentLocalV0SingleCommand = ({
  request_path,
  response_path,
  summary_path,
  variation
}) => {
  const authoringResult = writeLocalJsonRequestFixture({
    output_path: request_path,
    variation
  });

  if (authoringResult.failure_count !== 0) {
    return {
      verification_result: "local_json_agent_local_v0_single_command_run_denied",
      output_contract_ref: "local-json-agent-local-v0-single-command-run/v1",
      request_path,
      response_path,
      summary_path,
      request_fixture_written: authoringResult.file_write_performed,
      response_file_write_performed: false,
      summary_file_write_performed: false,
      writes_only_explicit_request_response_summary_paths: true,
      child_process_spawned: false,
      arbitrary_source_loading_allowed: false,
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
      failure_count: authoringResult.failure_count,
      failures: authoringResult.failures
    };
  }

  const runResult = runLocalJsonAgentRequestRunner({
    request_path,
    response_path,
    summary_path
  });

  return {
    verification_result:
      runResult.failure_count === 0
        ? "local_json_agent_local_v0_single_command_run_completed"
        : "local_json_agent_local_v0_single_command_run_denied",
    output_contract_ref: "local-json-agent-local-v0-single-command-run/v1",
    request_path,
    response_path,
    summary_path,
    agent_context_request_id: runResult.agent_context_request_id,
    runner_request_id: runResult.runner_request_id,
    runner_response_id: runResult.runner_response_id,
    bounded_context_response_id: runResult.bounded_context_response_id,
    bounded_context_package_id: runResult.bounded_context_package_id,
    protocol_adapter_shape_id: runResult.protocol_adapter_shape_id,
    agent_readable_contract: runResult.agent_readable_contract,
    agent_response_status: runResult.agent_response_status,
    response_status: runResult.response_status,
    selected_source_item_count: runResult.selected_source_item_count,
    selected_source_refs: runResult.selected_source_refs,
    selected_scope_ids: runResult.selected_scope_ids,
    safe_agent_use_hints: runResult.safe_agent_use_hints,
    denied_agent_action_hints: runResult.denied_agent_action_hints,
    request_variation_applied: authoringResult.variation_applied,
    request_task_signal: authoringResult.task_signal,
    request_read_mode_hint: authoringResult.read_mode_hint,
    request_depth_hint: authoringResult.depth_hint,
    request_scope_hints: authoringResult.requested_scope_hints,
    request_fixture_written: authoringResult.file_write_performed,
    request_fixture_read: runResult.file_read_performed,
    response_file_write_performed: runResult.response_file_write_performed,
    summary_file_write_performed: runResult.summary_file_write_performed,
    writes_only_explicit_request_response_summary_paths: true,
    child_process_spawned: false,
    arbitrary_source_loading_allowed: false,
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
    failure_count: runResult.failure_count,
    failures: runResult.failures
  };
};

const isDirectRun = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectRun) {
  try {
    const result = runLocalJsonAgentLocalV0SingleCommand(parseArgs(process.argv.slice(2)));

    console.log(stableJson(result));
    process.exit(result.failure_count === 0 ? 0 : 1);
  } catch (error) {
    console.error(
      stableJson({
        verification_result: "local_json_agent_local_v0_single_command_run_failed",
        output_contract_ref: "local-json-agent-local-v0-single-command-run/v1",
        message: error instanceof Error ? error.message : String(error),
        request_fixture_written: false,
        response_file_write_performed: false,
        summary_file_write_performed: false,
        runtime_permission_granted: false,
        actual_contour_execution_allowed_now: false,
        failure_count: 1
      })
    );
    process.exit(1);
  }
}
