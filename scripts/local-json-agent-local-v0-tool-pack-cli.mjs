#!/usr/bin/env node

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { readLocalJsonAgentContractSchema } from "./local-json-agent-contract-schema-cli.mjs";
import { writeLocalJsonAgentToolManifestArtifact } from "./local-json-agent-tool-manifest-cli.mjs";
import {
  writeLocalJsonAgentRequestRunnerSampleArtifactSet
} from "./local-json-agent-request-runner-sample-cli.mjs";
import { createLocalV0SourceCatalog } from "../packages/system-assembly/dist/index.js";

const stableJson = (value) => `${JSON.stringify(value, null, 2)}\n`;
const usage =
  "Usage: node scripts/local-json-agent-local-v0-tool-pack-cli.mjs --manifest-output <path> --schema-output <path> --source-catalog-output <path> --sample-request-output <path> --sample-response-output <path> --sample-summary-output <path> --sample-index-output <path> --tool-pack-index-output <path>";

const requiredArgs = [
  "manifest-output",
  "schema-output",
  "source-catalog-output",
  "sample-request-output",
  "sample-response-output",
  "sample-summary-output",
  "sample-index-output",
  "tool-pack-index-output"
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
    source_catalog_output_path: resolve(args.get("source-catalog-output")),
    sample_request_output_path: resolve(args.get("sample-request-output")),
    sample_response_output_path: resolve(args.get("sample-response-output")),
    sample_summary_output_path: resolve(args.get("sample-summary-output")),
    sample_index_output_path: resolve(args.get("sample-index-output")),
    tool_pack_index_output_path: resolve(args.get("tool-pack-index-output"))
  };
};

const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));

export const writeLocalJsonAgentLocalV0ToolPackArtifactSet = ({
  manifest_output_path,
  schema_output_path,
  source_catalog_output_path,
  sample_request_output_path,
  sample_response_output_path,
  sample_summary_output_path,
  sample_index_output_path,
  tool_pack_index_output_path
}) => {
  const schemaResult = readLocalJsonAgentContractSchema();
  const manifestWriteResult = writeLocalJsonAgentToolManifestArtifact({
    manifest_output_path
  });

  writeFileSync(schema_output_path, stableJson(schemaResult.schema_json), "utf8");

  const sampleWriteResult = writeLocalJsonAgentRequestRunnerSampleArtifactSet({
    request_output_path: sample_request_output_path,
    response_output_path: sample_response_output_path,
    summary_output_path: sample_summary_output_path,
    index_output_path: sample_index_output_path
  });
  const manifestArtifact = readJson(manifest_output_path);
  const sampleIndexArtifact = readJson(sample_index_output_path);
  const sampleSummaryArtifact = readJson(sample_summary_output_path);
  const sourceCatalogArtifact = createLocalV0SourceCatalog(
    sampleSummaryArtifact.agent_context_request_id
  );

  writeFileSync(source_catalog_output_path, stableJson(sourceCatalogArtifact), "utf8");

  const toolPackIndex = {
    verification_result: "local_json_agent_local_v0_tool_pack_artifact_set_written",
    output_contract_ref: "local-json-agent-local-v0-tool-pack-artifact-set/v1",
    intended_consumer: "ai_agent",
    protocol_surface: "local_json_cli_file_boundary",
    recommended_start_command:
      "npm run tool:local-json-agent-request-runner-sample:write -- --request-output <path> --response-output <path> --summary-output <path> --index-output <path>",
    direct_request_run_command:
      "npm run tool:local-json-agent-request:run -- --request <path> --response <path> --summary <path>",
    artifact_paths: {
      manifest_output_path,
      schema_output_path,
      source_catalog_output_path,
      sample_request_output_path,
      sample_response_output_path,
      sample_summary_output_path,
      sample_index_output_path,
      tool_pack_index_output_path
    },
    artifact_contract_refs: {
      manifest: manifestWriteResult.output_contract_ref,
      schema: schemaResult.schema_json.contract_version,
      source_catalog: sourceCatalogArtifact.catalog_version,
      sample_request: sampleIndexArtifact.artifact_contract_refs.request,
      sample_response_summary: sampleIndexArtifact.artifact_contract_refs.response_summary,
      sample_run_summary: sampleIndexArtifact.artifact_contract_refs.run_summary,
      sample_index: sampleWriteResult.output_contract_ref
    },
    command_refs: manifestArtifact.commands.map((command) => command.command_ref),
    schema_contract_ref: schemaResult.schema_json.contract_version,
    source_catalog_ref: sourceCatalogArtifact.catalog_version,
    source_catalog_supported_scope_ids: sourceCatalogArtifact.supported_scope_ids,
    source_catalog_entry_count: sourceCatalogArtifact.entry_count,
    source_catalog_selection_policy: sourceCatalogArtifact.selection_policy,
    agent_context_request_id: sampleSummaryArtifact.agent_context_request_id,
    runner_response_id: sampleSummaryArtifact.runner_response_id,
    bounded_context_response_id: sampleSummaryArtifact.bounded_context_response_id,
    bounded_context_package_id: sampleSummaryArtifact.bounded_context_package_id,
    selected_source_refs: sampleSummaryArtifact.selected_source_refs,
    selected_scope_ids: sampleSummaryArtifact.selected_scope_ids,
    safe_agent_use_hints: sampleSummaryArtifact.safe_agent_use_hints,
    denied_agent_action_hints: sampleSummaryArtifact.denied_agent_action_hints,
    file_read_performed: true,
    file_write_performed: true,
    writes_only_explicit_tool_pack_artifact_paths: true,
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
    failure_count:
      schemaResult.failure_count +
      manifestWriteResult.failure_count +
      sampleWriteResult.failure_count,
    failures: [
      ...schemaResult.failures,
      ...manifestWriteResult.failures,
      ...sampleWriteResult.failures
    ]
  };

  writeFileSync(tool_pack_index_output_path, stableJson(toolPackIndex), "utf8");

  return toolPackIndex;
};

const isDirectRun = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectRun) {
  try {
    const result = writeLocalJsonAgentLocalV0ToolPackArtifactSet(parseArgs(process.argv.slice(2)));

    console.log(stableJson(result));
    process.exit(result.failure_count === 0 ? 0 : 1);
  } catch (error) {
    console.error(
      stableJson({
        verification_result: "local_json_agent_local_v0_tool_pack_artifact_set_failed",
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
