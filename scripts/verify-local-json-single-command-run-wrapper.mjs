#!/usr/bin/env node

import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  createDeterministicLocalJsonRequestResponseRunnerShape
} from "../packages/system-assembly/dist/index.js";
import {
  runLocalJsonSingleCommand
} from "./local-json-single-command-runner.mjs";

const tempDir = mkdtempSync(join(tmpdir(), "local-json-single-command-run-"));
const requestPath = join(tempDir, "request.json");
const responsePath = join(tempDir, "response.json");
const expectedRunnerShape = createDeterministicLocalJsonRequestResponseRunnerShape();

const result = runLocalJsonSingleCommand({
  request_path: requestPath,
  response_path: responsePath
});

const requestJson = JSON.parse(readFileSync(requestPath, "utf8"));
const responseJson = JSON.parse(readFileSync(responsePath, "utf8"));

const assertions = {
  single_command_completed:
    result.verification_result === "local_json_single_command_run_completed" &&
    result.failure_count === 0,
  request_fixture_authored:
    result.request_path === requestPath &&
    result.request_fixture_written === true &&
    requestJson.agent_context_request_id === expectedRunnerShape.runner_request.request_json.agent_context_request_id &&
    requestJson.contract_only === true,
  response_fixture_written:
    result.response_path === responsePath &&
    result.request_fixture_read === true &&
    result.response_fixture_written === true &&
    responseJson.runner_response_id === expectedRunnerShape.runner_response.runner_response_id &&
    responseJson.refs.bounded_context_response_id === expectedRunnerShape.runner_response.refs.bounded_context_response_id,
  runtime_surfaces_remain_denied:
    result.child_process_spawned === false &&
    result.mcp_server_implemented === false &&
    result.mcp_tool_registered === false &&
    result.mcp_resource_registered === false &&
    result.api_route_registered === false &&
    result.api_controller_registered === false &&
    result.runtime_handler_bound === false &&
    result.provider_sdk_call_allowed_now === false &&
    result.transport_execution_allowed_now === false &&
    result.concrete_persistence_read_allowed_now === false &&
    result.concrete_persistence_write_allowed_now === false &&
    result.real_model_call_allowed_now === false &&
    result.real_storage_write_allowed_now === false &&
    result.runtime_permission_granted === false &&
    result.actual_contour_execution_allowed_now === false
};

const failed = Object.entries(assertions)
  .filter(([, passed]) => passed !== true)
  .map(([name]) => name);

const verification = {
  verification_result:
    failed.length === 0
      ? "local_json_single_command_run_wrapper_verified"
      : "local_json_single_command_run_wrapper_failed",
  request_path: requestPath,
  response_path: responsePath,
  agent_context_request_id: result.agent_context_request_id,
  runner_response_id: result.runner_response_id,
  request_fixture_written: result.request_fixture_written,
  request_fixture_read: result.request_fixture_read,
  response_fixture_written: result.response_fixture_written,
  runtime_permission_granted: result.runtime_permission_granted,
  actual_contour_execution_allowed_now: result.actual_contour_execution_allowed_now,
  failure_count: failed.length,
  failures: failed
};

console.log(JSON.stringify(verification, null, 2));

if (failed.length > 0) {
  process.exit(1);
}
