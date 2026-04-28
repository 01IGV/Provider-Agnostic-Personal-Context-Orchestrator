#!/usr/bin/env node

import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { readLocalJsonAgentContractSchema } from "./local-json-agent-contract-schema-cli.mjs";
import { runLocalJsonSingleCommand } from "./local-json-single-command-runner.mjs";

const stableJson = (value) => `${JSON.stringify(value, null, 2)}\n`;
const usage =
  "Usage: node scripts/schema-aware-local-json-fixture-examples-cli.mjs [--request-output <path> --response-output <path> --summary-output <path>]";

const parseArgs = (argv) => {
  if (argv.length === 0) {
    return {};
  }

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

  if (!requestOutput || !responseOutput || !summaryOutput) {
    throw new Error("--request-output, --response-output, and --summary-output are required together.");
  }

  return {
    request_output_path: resolve(requestOutput),
    response_output_path: resolve(responseOutput),
    summary_output_path: resolve(summaryOutput)
  };
};

export const readSchemaAwareLocalJsonFixtureExamples = () => {
  const tempDir = mkdtempSync(join(tmpdir(), "schema-aware-local-json-fixture-examples-"));
  const requestPath = join(tempDir, "agent-context-request.example.json");
  const responsePath = join(tempDir, "verified-protocol-surface-adapter.example.json");
  const schemaResult = readLocalJsonAgentContractSchema();
  const runResult = runLocalJsonSingleCommand({
    request_path: requestPath,
    response_path: responsePath,
    variation: {
      task_signal: "schema-aware minimal local JSON fixture example",
      read_mode_hint: "planning",
      depth_hint: "standard",
      requested_scope_hints: ["scope:active-boundary-chain"]
    }
  });

  const exampleRequestJson = JSON.parse(readFileSync(requestPath, "utf8"));
  const exampleResponseJson = JSON.parse(readFileSync(responsePath, "utf8"));
  const responseObservationSummary = exampleResponseJson.response_observation_summary_json;

  return {
    verification_result: "schema_aware_local_json_fixture_examples_ready",
    schema_contract_version: schemaResult.schema_json.contract_version,
    intended_consumer: schemaResult.schema_json.intended_consumer,
    command_ref: schemaResult.schema_json.local_io.command_ref,
    example_command: [
      "npm",
      "run",
      "tool:local-json:run",
      "--",
      "--request",
      "agent-context-request.example.json",
      "--response",
      "verified-protocol-surface-adapter.example.json",
      "--task-signal",
      exampleRequestJson.intent.task_signal,
      "--read-mode",
      exampleRequestJson.intent.read_mode_hint,
      "--depth",
      exampleRequestJson.intent.depth_hint,
      "--scope-hints",
      exampleRequestJson.intent.requested_scope_hints.join(",")
    ],
    example_request_json: exampleRequestJson,
    expected_response_observation_summary_json: responseObservationSummary,
    safe_agent_use_hints: responseObservationSummary.safe_agent_use_hints,
    denied_agent_action_hints: responseObservationSummary.denied_agent_action_hints,
    runtime_permission_granted: runResult.runtime_permission_granted,
    actual_contour_execution_allowed_now: runResult.actual_contour_execution_allowed_now,
    mcp_server_implemented: false,
    mcp_tool_registered: false,
    mcp_resource_registered: false,
    api_route_registered: false,
    api_controller_registered: false,
    runtime_handler_bound: false,
    provider_sdk_call_allowed_now: false,
    concrete_persistence_read_allowed_now: false,
    concrete_persistence_write_allowed_now: false,
    real_model_call_allowed_now: false,
    real_storage_write_allowed_now: false,
    failure_count: runResult.failure_count,
    failures: runResult.failures
  };
};

export const writeSchemaAwareLocalJsonFixtureExampleArtifacts = ({
  request_output_path,
  response_output_path,
  summary_output_path
}) => {
  const examples = readSchemaAwareLocalJsonFixtureExamples();

  writeFileSync(request_output_path, stableJson(examples.example_request_json), "utf8");
  writeFileSync(response_output_path, stableJson(examples.expected_response_observation_summary_json), "utf8");
  writeFileSync(summary_output_path, stableJson(examples), "utf8");

  return {
    verification_result: "schema_aware_local_json_fixture_example_artifacts_written",
    schema_contract_version: examples.schema_contract_version,
    command_ref: examples.command_ref,
    request_output_path,
    response_output_path,
    summary_output_path,
    request_example_written: true,
    response_observation_summary_example_written: true,
    summary_example_written: true,
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
    concrete_persistence_read_allowed_now: false,
    concrete_persistence_write_allowed_now: false,
    real_model_call_allowed_now: false,
    real_storage_write_allowed_now: false,
    runtime_permission_granted: examples.runtime_permission_granted,
    actual_contour_execution_allowed_now: examples.actual_contour_execution_allowed_now,
    failure_count: examples.failure_count,
    failures: examples.failures
  };
};

const isDirectRun = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectRun) {
  try {
    const args = parseArgs(process.argv.slice(2));
    const result =
      "request_output_path" in args
        ? writeSchemaAwareLocalJsonFixtureExampleArtifacts(args)
        : readSchemaAwareLocalJsonFixtureExamples();

    console.log(stableJson(result));
    process.exit(result.failure_count === 0 ? 0 : 1);
  } catch (error) {
    console.error(
      stableJson({
        verification_result: "schema_aware_local_json_fixture_examples_failed",
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
