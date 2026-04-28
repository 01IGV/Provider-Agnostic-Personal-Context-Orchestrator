#!/usr/bin/env node

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { runLocalJsonFixtureRunnerCli } from "./local-json-fixture-runner-cli.mjs";

const stableJson = (value) => `${JSON.stringify(value, null, 2)}\n`;
const usage =
  "Usage: node scripts/local-json-agent-request-runner-cli.mjs --request <path> --response <path> --summary <path>";

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

  if (args.size !== 3 || !args.has("request") || !args.has("response") || !args.has("summary")) {
    throw new Error(usage);
  }

  return {
    request_path: resolve(args.get("request")),
    response_path: resolve(args.get("response")),
    summary_path: resolve(args.get("summary"))
  };
};

const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));

const createDeniedSummary = ({
  request_path,
  response_path,
  summary_path,
  runnerResult,
  requestJson
}) => ({
  verification_result: "local_json_agent_request_run_denied",
  output_contract_ref: "local-json-agent-request-run-summary/v1",
  request_path,
  response_path,
  summary_path,
  request_operation_id: requestJson?.operation_id,
  request_operation_version: requestJson?.operation_version,
  agent_context_request_id: requestJson?.agent_context_request_id,
  file_read_performed: true,
  response_file_write_performed: runnerResult.file_write_performed,
  summary_file_write_performed: true,
  writes_only_explicit_response_and_summary_paths: true,
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
  failure_count: runnerResult.failure_count,
  failures: runnerResult.failures
});

export const runLocalJsonAgentRequestRunner = ({
  request_path,
  response_path,
  summary_path
}) => {
  const requestJson = readJson(request_path);
  const runnerResult = runLocalJsonFixtureRunnerCli({
    input_path: request_path,
    output_path: response_path
  });

  if (runnerResult.failure_count > 0) {
    const deniedSummary = createDeniedSummary({
      request_path,
      response_path,
      summary_path,
      runnerResult,
      requestJson
    });

    writeFileSync(summary_path, stableJson(deniedSummary), "utf8");
    return deniedSummary;
  }

  const responseJson = readJson(response_path);
  const observationSummary = responseJson.response_observation_summary_json;
  const summary = {
    verification_result: "local_json_agent_request_run_completed",
    output_contract_ref: "local-json-agent-request-run-summary/v1",
    request_path,
    response_path,
    summary_path,
    request_operation_id: requestJson.operation_id,
    request_operation_version: requestJson.operation_version,
    agent_context_request_id: requestJson.agent_context_request_id,
    runner_request_id: runnerResult.runner_request_id,
    runner_response_id: runnerResult.runner_response_id,
    bounded_context_response_id: runnerResult.bounded_context_response_id,
    bounded_context_package_id: runnerResult.bounded_context_package_id,
    protocol_adapter_shape_id: runnerResult.protocol_adapter_shape_id,
    agent_readable_contract: observationSummary.agent_readable_contract,
    agent_response_status: observationSummary.agent_response_status,
    response_status: observationSummary.response_status,
    selected_source_item_count: observationSummary.selected_source_item_count,
    selected_source_refs: observationSummary.selected_source_refs,
    selected_scope_ids: observationSummary.selected_scope_ids,
    safe_agent_use_hints: observationSummary.safe_agent_use_hints,
    denied_agent_action_hints: observationSummary.denied_agent_action_hints,
    provenance_ref: responseJson.refs.bounded_context_package_id,
    permission_ref: requestJson.authority?.permission_scope_ref,
    audit_ref: responseJson.refs.protocol_adapter_shape_id,
    file_read_performed: true,
    response_file_write_performed: true,
    summary_file_write_performed: true,
    writes_only_explicit_response_and_summary_paths: true,
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
    failure_count: 0,
    failures: []
  };

  writeFileSync(summary_path, stableJson(summary), "utf8");
  return summary;
};

const isDirectRun = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectRun) {
  try {
    const result = runLocalJsonAgentRequestRunner(parseArgs(process.argv.slice(2)));

    console.log(stableJson(result));
    process.exit(result.failure_count === 0 ? 0 : 1);
  } catch (error) {
    console.error(
      stableJson({
        verification_result: "local_json_agent_request_run_failed",
        message: error instanceof Error ? error.message : String(error),
        file_read_performed: false,
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
