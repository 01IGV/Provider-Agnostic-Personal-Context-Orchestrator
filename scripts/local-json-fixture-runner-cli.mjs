#!/usr/bin/env node

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import {
  createDeterministicLocalContextSourceAdapterContracts,
  createDeterministicLocalJsonRequestResponseRunnerShape
} from "../packages/system-assembly/dist/index.js";

const parseArgs = (argv) => {
  const args = new Map();

  for (let index = 0; index < argv.length; index += 2) {
    const key = argv[index];
    const value = argv[index + 1];

    if (!key?.startsWith("--") || !value) {
      throw new Error("Usage: node scripts/local-json-fixture-runner-cli.mjs --input <path> --output <path>");
    }

    args.set(key.slice(2), value);
  }

  const input = args.get("input");
  const output = args.get("output");

  if (!input || !output) {
    throw new Error("Both --input and --output are required.");
  }

  return {
    input_path: resolve(input),
    output_path: resolve(output)
  };
};

const stableJson = (value) => `${JSON.stringify(value, null, 2)}\n`;

const validateRequestFixture = (inputJson, expectedRequest) => {
  const failures = [];

  if (inputJson?.operation_id !== "agent_context_request_boundary") {
    failures.push("operation_id_mismatch");
  }

  if (inputJson?.agent_context_request_id !== expectedRequest.agent_context_request_id) {
    failures.push("agent_context_request_id_mismatch");
  }

  if (inputJson?.contract_only !== true) {
    failures.push("request_contract_only_not_true");
  }

  if (inputJson?.authority?.runtime_permission_granted !== false) {
    failures.push("runtime_permission_granted_not_false");
  }

  if (inputJson?.execution_posture?.actual_contour_execution_allowed_now !== false) {
    failures.push("actual_contour_execution_allowed_now_not_false");
  }

  return failures;
};

export const runLocalJsonFixtureRunnerCli = ({ input_path, output_path }) => {
  const expectedRunnerShape = createDeterministicLocalJsonRequestResponseRunnerShape();
  const inputText = readFileSync(input_path, "utf8");
  const inputJson = JSON.parse(inputText);
  const failures = validateRequestFixture(inputJson, expectedRunnerShape.runner_request.request_json);

  if (failures.length > 0) {
    return {
      verification_result: "local_json_cli_file_io_boundary_denied",
      input_path,
      output_path,
      file_read_performed: true,
      file_write_performed: false,
      runtime_permission_granted: false,
      actual_contour_execution_allowed_now: false,
      failure_count: failures.length,
      failures
    };
  }

  const localContextResult = createDeterministicLocalContextSourceAdapterContracts({
    request: inputJson
  });
  const runnerShape = createDeterministicLocalJsonRequestResponseRunnerShape({
    local_context_result: localContextResult
  });

  writeFileSync(output_path, stableJson(runnerShape.runner_response), "utf8");
  const observationSummary = runnerShape.runner_response.response_observation_summary_json;

  return {
    verification_result: "local_json_cli_file_io_boundary_completed",
    input_path,
    output_path,
    runner_request_id: runnerShape.runner_request.runner_request_id,
    runner_response_id: runnerShape.runner_response.runner_response_id,
    bounded_context_response_id: runnerShape.runner_response.refs.bounded_context_response_id,
    bounded_context_package_id: runnerShape.runner_response.refs.bounded_context_package_id,
    protocol_adapter_shape_id: runnerShape.runner_response.refs.protocol_adapter_shape_id,
    response_observation_summary_result: observationSummary.observation_result,
    agent_readable_contract: observationSummary.agent_readable_contract,
    agent_response_status: observationSummary.agent_response_status,
    selected_source_item_count: observationSummary.selected_source_item_count,
    selected_source_refs: observationSummary.selected_source_refs,
    selected_scope_ids: observationSummary.selected_scope_ids,
    safe_agent_use_hints: observationSummary.safe_agent_use_hints,
    denied_agent_action_hints: observationSummary.denied_agent_action_hints,
    file_read_performed: true,
    file_write_performed: true,
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
    failure_count: 0,
    failures: []
  };
};

const isDirectRun = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectRun) {
  try {
    const result = runLocalJsonFixtureRunnerCli(parseArgs(process.argv.slice(2)));
    console.log(stableJson(result));
    process.exit(result.failure_count === 0 ? 0 : 1);
  } catch (error) {
    console.error(
      stableJson({
        verification_result: "local_json_cli_file_io_boundary_failed",
        message: error instanceof Error ? error.message : String(error),
        file_read_performed: false,
        file_write_performed: false,
        runtime_permission_granted: false,
        actual_contour_execution_allowed_now: false,
        failure_count: 1
      })
    );
    process.exit(1);
  }
}
