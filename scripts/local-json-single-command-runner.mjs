#!/usr/bin/env node

import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import {
  runLocalJsonFixtureRunnerCli
} from "./local-json-fixture-runner-cli.mjs";
import {
  writeLocalJsonRequestFixture
} from "./local-json-request-fixture-authoring-cli.mjs";

const usage =
  "Usage: node scripts/local-json-single-command-runner.mjs --request <path> --response <path> [--task-signal <text>] [--read-mode <mode>] [--depth <hint>] [--scope-hints <scope:a,scope:b>]";

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

  if (!request || !response) {
    throw new Error("Both --request and --response are required.");
  }

  return {
    request_path: resolve(request),
    response_path: resolve(response),
    variation: {
      task_signal: args.get("task-signal"),
      read_mode_hint: args.get("read-mode"),
      depth_hint: args.get("depth"),
      requested_scope_hints: args.get("scope-hints")?.split(",").map((scopeHint) => scopeHint.trim()).filter(Boolean)
    }
  };
};

const stableJson = (value) => `${JSON.stringify(value, null, 2)}\n`;

export const runLocalJsonSingleCommand = ({ request_path, response_path, variation }) => {
  const authoringResult = writeLocalJsonRequestFixture({
    output_path: request_path,
    variation
  });

  if (authoringResult.failure_count !== 0) {
    return {
      verification_result: "local_json_single_command_run_denied",
      request_path,
      response_path,
      request_fixture_written: authoringResult.file_write_performed,
      response_fixture_written: false,
      runtime_permission_granted: false,
      actual_contour_execution_allowed_now: false,
      failure_count: authoringResult.failure_count,
      failures: authoringResult.failures
    };
  }

  const runnerResult = runLocalJsonFixtureRunnerCli({
    input_path: request_path,
    output_path: response_path
  });

  return {
    verification_result:
      runnerResult.failure_count === 0
        ? "local_json_single_command_run_completed"
        : "local_json_single_command_run_denied",
    request_path,
    response_path,
    agent_context_request_id: authoringResult.agent_context_request_id,
    runner_request_id: runnerResult.runner_request_id,
    runner_response_id: runnerResult.runner_response_id,
    bounded_context_response_id: runnerResult.bounded_context_response_id,
    bounded_context_package_id: runnerResult.bounded_context_package_id,
    protocol_adapter_shape_id: runnerResult.protocol_adapter_shape_id,
    request_variation_applied: authoringResult.variation_applied,
    request_task_signal: authoringResult.task_signal,
    request_read_mode_hint: authoringResult.read_mode_hint,
    request_depth_hint: authoringResult.depth_hint,
    request_scope_hints: authoringResult.requested_scope_hints,
    request_fixture_written: authoringResult.file_write_performed,
    request_fixture_read: runnerResult.file_read_performed,
    response_fixture_written: runnerResult.file_write_performed,
    child_process_spawned: false,
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
    failure_count: runnerResult.failure_count,
    failures: runnerResult.failures
  };
};

const isDirectRun = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectRun) {
  try {
    const result = runLocalJsonSingleCommand(parseArgs(process.argv.slice(2)));
    console.log(stableJson(result));
    process.exit(result.failure_count === 0 ? 0 : 1);
  } catch (error) {
    console.error(
      stableJson({
        verification_result: "local_json_single_command_run_failed",
        message: error instanceof Error ? error.message : String(error),
        request_fixture_written: false,
        response_fixture_written: false,
        runtime_permission_granted: false,
        actual_contour_execution_allowed_now: false,
        failure_count: 1
      })
    );
    process.exit(1);
  }
}
