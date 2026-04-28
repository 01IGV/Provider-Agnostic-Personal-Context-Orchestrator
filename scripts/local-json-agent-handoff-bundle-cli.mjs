#!/usr/bin/env node

import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { readLocalJsonAgentContractSchema } from "./local-json-agent-contract-schema-cli.mjs";
import { writeLocalJsonAgentToolManifestArtifact } from "./local-json-agent-tool-manifest-cli.mjs";
import { writeSchemaAwareLocalJsonFixtureExampleArtifacts } from "./schema-aware-local-json-fixture-examples-cli.mjs";

const stableJson = (value) => `${JSON.stringify(value, null, 2)}\n`;
const usage =
  "Usage: node scripts/local-json-agent-handoff-bundle-cli.mjs --manifest-output <path> --schema-output <path> --request-output <path> --response-output <path> --examples-summary-output <path> --bundle-summary-output <path>";

const requiredArgs = [
  "manifest-output",
  "schema-output",
  "request-output",
  "response-output",
  "examples-summary-output",
  "bundle-summary-output"
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
    manifest_output_path: resolve(args.get("manifest-output")),
    schema_output_path: resolve(args.get("schema-output")),
    request_output_path: resolve(args.get("request-output")),
    response_output_path: resolve(args.get("response-output")),
    examples_summary_output_path: resolve(args.get("examples-summary-output")),
    bundle_summary_output_path: resolve(args.get("bundle-summary-output"))
  };
};

export const writeLocalJsonAgentHandoffBundle = ({
  manifest_output_path,
  schema_output_path,
  request_output_path,
  response_output_path,
  examples_summary_output_path,
  bundle_summary_output_path
}) => {
  const schemaResult = readLocalJsonAgentContractSchema();
  const manifestWriteResult = writeLocalJsonAgentToolManifestArtifact({
    manifest_output_path
  });
  const examplesWriteResult = writeSchemaAwareLocalJsonFixtureExampleArtifacts({
    request_output_path,
    response_output_path,
    summary_output_path: examples_summary_output_path
  });

  writeFileSync(schema_output_path, stableJson(schemaResult.schema_json), "utf8");

  const summary = {
    verification_result: "local_json_agent_handoff_bundle_written",
    bundle_contract_ref: "local-json-agent-handoff-bundle/v1",
    intended_consumer: "ai_agent",
    protocol_surface: "local_json_cli_file_boundary",
    artifact_paths: {
      manifest_output_path,
      schema_output_path,
      request_output_path,
      response_output_path,
      examples_summary_output_path,
      bundle_summary_output_path
    },
    artifact_contract_refs: {
      manifest: manifestWriteResult.output_contract_ref,
      schema: schemaResult.schema_json.contract_version,
      request_example: "agent-context-request-boundary/v1",
      response_observation_summary: "agent-readable-local-json-response-observation/v1",
      examples_summary: "schema-aware-local-json-fixture-examples/v1"
    },
    recommended_next_command:
      "npm run tool:local-json-agent-handoff-bundle:consume -- --bundle-summary <bundle-summary-path> --manifest <manifest-path> --schema <schema-path> --request <request-path> --expected-response <expected-response-path> --examples-summary <examples-summary-path> --actual-response <actual-response-path>",
    file_read_performed: true,
    file_write_performed: true,
    writes_only_explicit_bundle_artifact_paths: true,
    child_process_spawned: false,
    arbitrary_source_loading_allowed: false,
    runtime_permission_granted: false,
    actual_contour_execution_allowed_now: false,
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
    failure_count: schemaResult.failure_count + manifestWriteResult.failure_count + examplesWriteResult.failure_count,
    failures: [
      ...schemaResult.failures,
      ...manifestWriteResult.failures,
      ...examplesWriteResult.failures
    ]
  };

  writeFileSync(bundle_summary_output_path, stableJson(summary), "utf8");

  return summary;
};

const isDirectRun = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectRun) {
  try {
    const result = writeLocalJsonAgentHandoffBundle(parseArgs(process.argv.slice(2)));

    console.log(stableJson(result));
    process.exit(result.failure_count === 0 ? 0 : 1);
  } catch (error) {
    console.error(
      stableJson({
        verification_result: "local_json_agent_handoff_bundle_failed",
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
