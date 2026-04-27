#!/usr/bin/env node

import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import {
  createDeterministicLocalJsonRequestResponseRunnerShape
} from "../packages/system-assembly/dist/index.js";

const parseArgs = (argv) => {
  const args = new Map();

  for (let index = 0; index < argv.length; index += 2) {
    const key = argv[index];
    const value = argv[index + 1];

    if (!key?.startsWith("--") || !value) {
      throw new Error("Usage: node scripts/local-json-request-fixture-authoring-cli.mjs --output <path>");
    }

    args.set(key.slice(2), value);
  }

  const output = args.get("output");

  if (!output) {
    throw new Error("--output is required.");
  }

  return {
    output_path: resolve(output)
  };
};

const stableJson = (value) => `${JSON.stringify(value, null, 2)}\n`;

export const writeLocalJsonRequestFixture = ({ output_path }) => {
  const runnerShape = createDeterministicLocalJsonRequestResponseRunnerShape();

  writeFileSync(output_path, stableJson(runnerShape.runner_request.request_json), "utf8");

  return {
    verification_result: "local_json_request_fixture_authored",
    output_path,
    agent_context_request_id: runnerShape.runner_request.request_json.agent_context_request_id,
    operation_id: runnerShape.runner_request.request_json.operation_id,
    request_kind: runnerShape.runner_request.request_json.intent.request_kind,
    file_write_performed: true,
    file_read_performed: false,
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
    const result = writeLocalJsonRequestFixture(parseArgs(process.argv.slice(2)));
    console.log(stableJson(result));
    process.exit(0);
  } catch (error) {
    console.error(
      stableJson({
        verification_result: "local_json_request_fixture_authoring_failed",
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
