#!/usr/bin/env node

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import {
  readSchemaAwareLocalJsonFixtureExamples
} from "./schema-aware-local-json-fixture-examples-cli.mjs";
import { runLocalJsonAgentRequestRunner } from "./local-json-agent-request-runner-cli.mjs";

const stableJson = (value) => `${JSON.stringify(value, null, 2)}\n`;
const usage =
  "Usage: node scripts/local-json-agent-request-runner-sample-cli.mjs --request-output <path> --response-output <path> --summary-output <path> --index-output <path>";

const requiredArgs = ["request-output", "response-output", "summary-output", "index-output"];

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

  const missing = requiredArgs.filter((key) => !args.has(key));

  if (missing.length > 0 || args.size !== requiredArgs.length) {
    throw new Error(usage);
  }

  return {
    request_output_path: resolve(args.get("request-output")),
    response_output_path: resolve(args.get("response-output")),
    summary_output_path: resolve(args.get("summary-output")),
    index_output_path: resolve(args.get("index-output"))
  };
};

const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));

export const writeLocalJsonAgentRequestRunnerSampleArtifactSet = ({
  request_output_path,
  response_output_path,
  summary_output_path,
  index_output_path
}) => {
  const examples = readSchemaAwareLocalJsonFixtureExamples();

  writeFileSync(request_output_path, stableJson(examples.example_request_json), "utf8");

  const runResult = runLocalJsonAgentRequestRunner({
    request_path: request_output_path,
    response_path: response_output_path,
    summary_path: summary_output_path
  });
  const responseArtifact = readJson(response_output_path);
  const runSummaryArtifact = readJson(summary_output_path);
  const responseObservationSummary = responseArtifact.response_observation_summary_json;
  const indexArtifact = {
    verification_result: "local_json_agent_request_runner_sample_artifact_set_written",
    output_contract_ref: "local-json-agent-request-runner-sample-artifact-set/v1",
    intended_consumer: "ai_agent",
    sample_command:
      "npm run tool:local-json-agent-request:run -- --request <request-output-path> --response <response-output-path> --summary <summary-output-path>",
    artifact_paths: {
      request_output_path,
      response_output_path,
      summary_output_path,
      index_output_path
    },
    artifact_contract_refs: {
      request: examples.example_request_json.operation_version,
      response_summary: responseObservationSummary.agent_readable_contract,
      run_summary: runSummaryArtifact.output_contract_ref
    },
    agent_context_request_id: runResult.agent_context_request_id,
    runner_response_id: runResult.runner_response_id,
    bounded_context_response_id: runResult.bounded_context_response_id,
    bounded_context_package_id: runResult.bounded_context_package_id,
    selected_source_refs: runResult.selected_source_refs,
    selected_scope_ids: runResult.selected_scope_ids,
    safe_agent_use_hints: runResult.safe_agent_use_hints,
    denied_agent_action_hints: runResult.denied_agent_action_hints,
    file_read_performed: true,
    file_write_performed: true,
    writes_only_explicit_sample_artifact_paths: true,
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

  writeFileSync(index_output_path, stableJson(indexArtifact), "utf8");

  return indexArtifact;
};

const isDirectRun = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectRun) {
  try {
    const result = writeLocalJsonAgentRequestRunnerSampleArtifactSet(parseArgs(process.argv.slice(2)));

    console.log(stableJson(result));
    process.exit(result.failure_count === 0 ? 0 : 1);
  } catch (error) {
    console.error(
      stableJson({
        verification_result: "local_json_agent_request_runner_sample_artifact_set_failed",
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
