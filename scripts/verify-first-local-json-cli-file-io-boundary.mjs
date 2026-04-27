#!/usr/bin/env node

import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  createDeterministicLocalJsonRequestResponseRunnerShape
} from "../packages/system-assembly/dist/index.js";
import {
  runLocalJsonFixtureRunnerCli
} from "./local-json-fixture-runner-cli.mjs";

const stableJson = (value) => `${JSON.stringify(value, null, 2)}\n`;

const tempDir = mkdtempSync(join(tmpdir(), "local-json-cli-file-io-boundary-"));
const inputPath = join(tempDir, "agent-context-request.input.json");
const outputPath = join(tempDir, "verified-protocol-surface-adapter.output.json");
const expectedRunnerShape = createDeterministicLocalJsonRequestResponseRunnerShape();

writeFileSync(inputPath, stableJson(expectedRunnerShape.runner_request.request_json), "utf8");

const result = runLocalJsonFixtureRunnerCli({
  input_path: inputPath,
  output_path: outputPath
});

const outputJson = JSON.parse(readFileSync(outputPath, "utf8"));

const assertions = {
  cli_file_io_boundary_completed:
    result.verification_result === "local_json_cli_file_io_boundary_completed" &&
    result.failure_count === 0,
  file_io_scoped_to_fixture_paths:
    result.input_path === inputPath &&
    result.output_path === outputPath &&
    result.file_read_performed === true &&
    result.file_write_performed === true,
  output_fixture_matches_verified_runner_response:
    outputJson.runner_response_id === expectedRunnerShape.runner_response.runner_response_id &&
    outputJson.runner_request_id === expectedRunnerShape.runner_response.runner_request_id &&
    outputJson.refs.bounded_context_response_id === expectedRunnerShape.runner_response.refs.bounded_context_response_id &&
    outputJson.refs.bounded_context_package_id === expectedRunnerShape.runner_response.refs.bounded_context_package_id &&
    outputJson.refs.protocol_adapter_shape_id === expectedRunnerShape.runner_response.refs.protocol_adapter_shape_id,
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
      ? "first_local_json_cli_file_io_boundary_verified"
      : "first_local_json_cli_file_io_boundary_failed",
  input_path: inputPath,
  output_path: outputPath,
  runner_request_id: result.runner_request_id,
  runner_response_id: result.runner_response_id,
  bounded_context_response_id: result.bounded_context_response_id,
  bounded_context_package_id: result.bounded_context_package_id,
  protocol_adapter_shape_id: result.protocol_adapter_shape_id,
  file_read_performed: result.file_read_performed,
  file_write_performed: result.file_write_performed,
  child_process_spawned: result.child_process_spawned,
  runtime_permission_granted: result.runtime_permission_granted,
  actual_contour_execution_allowed_now: result.actual_contour_execution_allowed_now,
  failure_count: failed.length,
  failures: failed
};

console.log(JSON.stringify(verification, null, 2));

if (failed.length > 0) {
  process.exit(1);
}
