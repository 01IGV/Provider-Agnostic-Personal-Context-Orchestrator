#!/usr/bin/env node

import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  createDeterministicLocalJsonRequestResponseRunnerShape
} from "../packages/system-assembly/dist/index.js";
import {
  runLocalJsonFixtureRunnerCli
} from "./local-json-fixture-runner-cli.mjs";
import {
  writeLocalJsonRequestFixture
} from "./local-json-request-fixture-authoring-cli.mjs";

const tempDir = mkdtempSync(join(tmpdir(), "local-json-request-fixture-authoring-"));
const inputPath = join(tempDir, "agent-context-request.input.json");
const outputPath = join(tempDir, "verified-protocol-surface-adapter.output.json");
const expectedRunnerShape = createDeterministicLocalJsonRequestResponseRunnerShape();

const authoringResult = writeLocalJsonRequestFixture({
  output_path: inputPath
});
const authoredRequest = JSON.parse(readFileSync(inputPath, "utf8"));
const runnerResult = runLocalJsonFixtureRunnerCli({
  input_path: inputPath,
  output_path: outputPath
});
const runnerOutput = JSON.parse(readFileSync(outputPath, "utf8"));

const assertions = {
  request_fixture_authored:
    authoringResult.verification_result === "local_json_request_fixture_authored" &&
    authoringResult.file_write_performed === true &&
    authoringResult.file_read_performed === false &&
    authoringResult.failure_count === 0,
  authored_request_matches_expected_boundary:
    authoredRequest.operation_id === "agent_context_request_boundary" &&
    authoredRequest.agent_context_request_id === expectedRunnerShape.runner_request.request_json.agent_context_request_id &&
    authoredRequest.contract_only === true &&
    authoredRequest.authority.runtime_permission_granted === false &&
    authoredRequest.execution_posture.actual_contour_execution_allowed_now === false,
  authored_fixture_runs_through_local_cli:
    runnerResult.verification_result === "local_json_cli_file_io_boundary_completed" &&
    runnerResult.input_path === inputPath &&
    runnerResult.output_path === outputPath &&
    runnerResult.file_read_performed === true &&
    runnerResult.file_write_performed === true &&
    runnerResult.failure_count === 0,
  output_fixture_matches_verified_response:
    runnerOutput.runner_response_id === expectedRunnerShape.runner_response.runner_response_id &&
    runnerOutput.refs.bounded_context_response_id === expectedRunnerShape.runner_response.refs.bounded_context_response_id &&
    runnerOutput.refs.bounded_context_package_id === expectedRunnerShape.runner_response.refs.bounded_context_package_id &&
    runnerOutput.refs.protocol_adapter_shape_id === expectedRunnerShape.runner_response.refs.protocol_adapter_shape_id,
  runtime_surfaces_remain_denied:
    authoringResult.child_process_spawned === false &&
    authoringResult.mcp_server_implemented === false &&
    authoringResult.mcp_tool_registered === false &&
    authoringResult.mcp_resource_registered === false &&
    authoringResult.api_route_registered === false &&
    authoringResult.api_controller_registered === false &&
    authoringResult.runtime_handler_bound === false &&
    authoringResult.provider_sdk_call_allowed_now === false &&
    authoringResult.transport_execution_allowed_now === false &&
    authoringResult.concrete_persistence_read_allowed_now === false &&
    authoringResult.concrete_persistence_write_allowed_now === false &&
    authoringResult.real_model_call_allowed_now === false &&
    authoringResult.real_storage_write_allowed_now === false &&
    authoringResult.runtime_permission_granted === false &&
    authoringResult.actual_contour_execution_allowed_now === false &&
    runnerResult.runtime_permission_granted === false &&
    runnerResult.actual_contour_execution_allowed_now === false
};

const failed = Object.entries(assertions)
  .filter(([, passed]) => passed !== true)
  .map(([name]) => name);

const verification = {
  verification_result:
    failed.length === 0
      ? "local_json_request_fixture_authoring_helper_verified"
      : "local_json_request_fixture_authoring_helper_failed",
  input_path: inputPath,
  output_path: outputPath,
  agent_context_request_id: authoredRequest.agent_context_request_id,
  runner_response_id: runnerOutput.runner_response_id,
  file_write_performed: authoringResult.file_write_performed,
  file_read_performed: runnerResult.file_read_performed,
  runtime_permission_granted: runnerResult.runtime_permission_granted,
  actual_contour_execution_allowed_now: runnerResult.actual_contour_execution_allowed_now,
  failure_count: failed.length,
  failures: failed
};

console.log(JSON.stringify(verification, null, 2));

if (failed.length > 0) {
  process.exit(1);
}
