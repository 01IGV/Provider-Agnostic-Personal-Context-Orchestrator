#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { runLocalJsonFixtureRunnerCli } from "./local-json-fixture-runner-cli.mjs";

const stableJson = (value) => `${JSON.stringify(value, null, 2)}\n`;
const usage =
  "Usage: node scripts/local-json-agent-handoff-bundle-consumption-cli.mjs --bundle-summary <path> --manifest <path> --schema <path> --request <path> --expected-response <path> --examples-summary <path> --actual-response <path>";

const requiredArgs = [
  "bundle-summary",
  "manifest",
  "schema",
  "request",
  "expected-response",
  "examples-summary",
  "actual-response"
];

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
    bundle_summary_path: resolve(args.get("bundle-summary")),
    manifest_path: resolve(args.get("manifest")),
    schema_path: resolve(args.get("schema")),
    request_path: resolve(args.get("request")),
    expected_response_path: resolve(args.get("expected-response")),
    examples_summary_path: resolve(args.get("examples-summary")),
    actual_response_path: resolve(args.get("actual-response"))
  };
};

const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));

const sameArray = (left, right) =>
  Array.isArray(left) &&
  Array.isArray(right) &&
  left.length === right.length &&
  left.every((item, index) => item === right[index]);

const compareObservationSummaries = (actual, expected) =>
  actual?.agent_readable_contract === expected?.agent_readable_contract &&
  actual?.agent_response_status === expected?.agent_response_status &&
  actual?.response_status === expected?.response_status &&
  actual?.selected_source_item_count === expected?.selected_source_item_count &&
  actual?.package_item_count === expected?.package_item_count &&
  sameArray(actual?.selected_source_refs, expected?.selected_source_refs) &&
  sameArray(actual?.selected_scope_ids, expected?.selected_scope_ids) &&
  sameArray(actual?.safe_agent_use_hints, expected?.safe_agent_use_hints) &&
  sameArray(actual?.denied_agent_action_hints, expected?.denied_agent_action_hints) &&
  actual?.runtime_permission_granted === expected?.runtime_permission_granted &&
  actual?.actual_contour_execution_allowed_now === expected?.actual_contour_execution_allowed_now;

export const runLocalJsonAgentHandoffBundleConsumption = ({
  bundle_summary_path,
  manifest_path,
  schema_path,
  request_path,
  expected_response_path,
  examples_summary_path,
  actual_response_path
}) => {
  const bundleSummary = readJson(bundle_summary_path);
  const manifest = readJson(manifest_path);
  const schema = readJson(schema_path);
  const request = readJson(request_path);
  const expectedResponseSummary = readJson(expected_response_path);
  const examplesSummary = readJson(examples_summary_path);
  const manifestCommandRefs = manifest.commands?.map((command) => command.command_ref) ?? [];

  const pathFailures = [];

  if (bundleSummary?.artifact_paths?.bundle_summary_output_path !== bundle_summary_path) {
    pathFailures.push("bundle_summary_path_mismatch");
  }

  if (bundleSummary?.artifact_paths?.manifest_output_path !== manifest_path) {
    pathFailures.push("manifest_path_mismatch");
  }

  if (bundleSummary?.artifact_paths?.schema_output_path !== schema_path) {
    pathFailures.push("schema_path_mismatch");
  }

  if (bundleSummary?.artifact_paths?.request_output_path !== request_path) {
    pathFailures.push("request_path_mismatch");
  }

  if (bundleSummary?.artifact_paths?.response_output_path !== expected_response_path) {
    pathFailures.push("expected_response_path_mismatch");
  }

  if (bundleSummary?.artifact_paths?.examples_summary_output_path !== examples_summary_path) {
    pathFailures.push("examples_summary_path_mismatch");
  }

  const contractFailures = [];

  if (bundleSummary?.bundle_contract_ref !== "local-json-agent-handoff-bundle/v1") {
    contractFailures.push("bundle_contract_ref_mismatch");
  }

  if (manifest?.manifest_version !== "local-json-agent-tool-manifest/v1") {
    contractFailures.push("manifest_version_mismatch");
  }

  if (!manifestCommandRefs.includes("tool:local-json-agent-handoff-bundle:consume")) {
    contractFailures.push("manifest_missing_handoff_bundle_consume_command");
  }

  if (schema?.contract_version !== "local-json-agent-request-response-contract-schema/v1") {
    contractFailures.push("schema_contract_version_mismatch");
  }

  if (request?.operation_version !== "agent-context-request-boundary/v1") {
    contractFailures.push("request_operation_version_mismatch");
  }

  if (
    expectedResponseSummary?.agent_readable_contract !==
    "agent-readable-local-json-response-observation/v1"
  ) {
    contractFailures.push("expected_response_contract_mismatch");
  }

  if (examplesSummary?.example_request_json?.operation_id !== request?.operation_id) {
    contractFailures.push("examples_summary_request_link_mismatch");
  }

  if (
    examplesSummary?.expected_response_observation_summary_json?.agent_readable_contract !==
    expectedResponseSummary?.agent_readable_contract
  ) {
    contractFailures.push("examples_summary_response_link_mismatch");
  }

  const preflightFailures = [...pathFailures, ...contractFailures];

  if (preflightFailures.length > 0) {
    return {
      verification_result: "local_json_agent_handoff_bundle_consumption_denied",
      bundle_contract_ref: bundleSummary?.bundle_contract_ref,
      bundle_summary_path,
      manifest_path,
      schema_path,
      request_path,
      expected_response_path,
      examples_summary_path,
      actual_response_path,
      file_read_performed: true,
      file_write_performed: false,
      child_process_spawned: false,
      runtime_permission_granted: false,
      actual_contour_execution_allowed_now: false,
      failure_count: preflightFailures.length,
      failures: preflightFailures
    };
  }

  const runnerResult = runLocalJsonFixtureRunnerCli({
    input_path: request_path,
    output_path: actual_response_path
  });

  if (runnerResult.failure_count > 0) {
    return {
      verification_result: "local_json_agent_handoff_bundle_consumption_denied",
      output_contract_ref: "local-json-agent-handoff-bundle-consumption/v1",
      bundle_contract_ref: bundleSummary.bundle_contract_ref,
      bundle_summary_path,
      manifest_path,
      schema_path,
      request_path,
      expected_response_path,
      examples_summary_path,
      actual_response_path,
      file_read_performed: true,
      file_write_performed: runnerResult.file_write_performed,
      writes_only_explicit_actual_response_path: true,
      child_process_spawned: false,
      arbitrary_source_loading_allowed: false,
      runtime_permission_granted: false,
      actual_contour_execution_allowed_now: false,
      failure_count: runnerResult.failure_count,
      failures: runnerResult.failures
    };
  }

  const actualRunnerResponse = readJson(actual_response_path);
  const actualResponseSummary = actualRunnerResponse.response_observation_summary_json;
  const summaryMatchesExpected = compareObservationSummaries(
    actualResponseSummary,
    expectedResponseSummary
  );
  const failures = [
    ...runnerResult.failures,
    ...(summaryMatchesExpected ? [] : ["actual_response_summary_mismatch"])
  ];

  return {
    verification_result:
      failures.length === 0
        ? "local_json_agent_handoff_bundle_consumption_completed"
        : "local_json_agent_handoff_bundle_consumption_failed",
    output_contract_ref: "local-json-agent-handoff-bundle-consumption/v1",
    bundle_contract_ref: bundleSummary.bundle_contract_ref,
    manifest_version: manifest.manifest_version,
    schema_contract_ref: schema.contract_version,
    request_operation_id: request.operation_id,
    request_operation_version: request.operation_version,
    bundle_summary_path,
    manifest_path,
    schema_path,
    request_path,
    expected_response_path,
    examples_summary_path,
    actual_response_path,
    runner_response_id: runnerResult.runner_response_id,
    bounded_context_response_id: runnerResult.bounded_context_response_id,
    bounded_context_package_id: runnerResult.bounded_context_package_id,
    protocol_adapter_shape_id: runnerResult.protocol_adapter_shape_id,
    agent_readable_contract: actualResponseSummary.agent_readable_contract,
    agent_response_status: actualResponseSummary.agent_response_status,
    selected_source_item_count: actualResponseSummary.selected_source_item_count,
    selected_source_refs: actualResponseSummary.selected_source_refs,
    selected_scope_ids: actualResponseSummary.selected_scope_ids,
    safe_agent_use_hints: actualResponseSummary.safe_agent_use_hints,
    denied_agent_action_hints: actualResponseSummary.denied_agent_action_hints,
    actual_summary_matches_expected_summary: summaryMatchesExpected,
    file_read_performed: true,
    file_write_performed: true,
    writes_only_explicit_actual_response_path: true,
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
    failure_count: failures.length,
    failures
  };
};

const isDirectRun = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectRun) {
  try {
    const result = runLocalJsonAgentHandoffBundleConsumption(parseArgs(process.argv.slice(2)));

    console.log(stableJson(result));
    process.exit(result.failure_count === 0 ? 0 : 1);
  } catch (error) {
    console.error(
      stableJson({
        verification_result: "local_json_agent_handoff_bundle_consumption_failed",
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
