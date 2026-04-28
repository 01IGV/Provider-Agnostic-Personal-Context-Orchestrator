#!/usr/bin/env node

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import {
  writeLocalJsonAgentLocalV0ToolPackArtifactSet
} from "./local-json-agent-local-v0-tool-pack-cli.mjs";
import {
  runLocalV0SourceCatalogGuidedCommand
} from "./local-v0-source-catalog-guided-command.mjs";

const stableJson = (value) => `${JSON.stringify(value, null, 2)}\n`;
const usage =
  "Usage: node scripts/local-v0-source-catalog-guided-command-sample-cli.mjs --manifest-output <path> --schema-output <path> --source-catalog-output <path> --tool-pack-sample-request-output <path> --tool-pack-sample-response-output <path> --tool-pack-sample-summary-output <path> --tool-pack-sample-index-output <path> --tool-pack-index-output <path> --guided-request-output <path> --guided-response-output <path> --guided-summary-output <path> --guided-index-output <path>";

const requiredArgs = [
  "manifest-output",
  "schema-output",
  "source-catalog-output",
  "tool-pack-sample-request-output",
  "tool-pack-sample-response-output",
  "tool-pack-sample-summary-output",
  "tool-pack-sample-index-output",
  "tool-pack-index-output",
  "guided-request-output",
  "guided-response-output",
  "guided-summary-output",
  "guided-index-output"
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

  return Object.fromEntries(
    requiredArgs.map((key) => [
      `${key.replaceAll("-", "_")}_path`,
      resolve(args.get(key))
    ])
  );
};

const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));

export const writeLocalV0SourceCatalogGuidedCommandSampleArtifactSet = ({
  manifest_output_path,
  schema_output_path,
  source_catalog_output_path,
  tool_pack_sample_request_output_path,
  tool_pack_sample_response_output_path,
  tool_pack_sample_summary_output_path,
  tool_pack_sample_index_output_path,
  tool_pack_index_output_path,
  guided_request_output_path,
  guided_response_output_path,
  guided_summary_output_path,
  guided_index_output_path,
  scope_id = "scope:active-boundary-chain",
  task_signal = "source catalog guided command sample bounded planning request",
  verification_result = "local_v0_source_catalog_guided_command_sample_artifact_set_written",
  output_contract_ref = "local-v0-source-catalog-guided-command-sample-artifact-set/v1"
}) => {
  const toolPackWriteResult = writeLocalJsonAgentLocalV0ToolPackArtifactSet({
    manifest_output_path,
    schema_output_path,
    source_catalog_output_path,
    sample_request_output_path: tool_pack_sample_request_output_path,
    sample_response_output_path: tool_pack_sample_response_output_path,
    sample_summary_output_path: tool_pack_sample_summary_output_path,
    sample_index_output_path: tool_pack_sample_index_output_path,
    tool_pack_index_output_path
  });
  const sourceCatalogArtifact = readJson(source_catalog_output_path);
  const selectedCatalogEntry = sourceCatalogArtifact.entries.find(
    (entry) => entry.scope_id === scope_id
  );

  if (!selectedCatalogEntry) {
    throw new Error(`source catalog missing ${scope_id} sample entry`);
  }

  const guidedCommandResult = runLocalV0SourceCatalogGuidedCommand({
    tool_pack_index_path: tool_pack_index_output_path,
    request_path: guided_request_output_path,
    response_path: guided_response_output_path,
    summary_path: guided_summary_output_path,
    scope_hint: selectedCatalogEntry?.scope_id,
    task_signal,
    read_mode_hint: "planning",
    depth_hint: "standard"
  });
  const guidedResponseArtifact = readJson(guided_response_output_path);
  const guidedSummaryArtifact = readJson(guided_summary_output_path);
  const guidedObservationSummary = guidedResponseArtifact.response_observation_summary_json;
  const guidedIndexArtifact = {
    verification_result,
    output_contract_ref,
    intended_consumer: "ai_agent",
    sample_command:
      "npm run tool:local-v0-source-catalog-guided:run -- --tool-pack-index <tool-pack-index-path> --request <guided-request-output-path> --response <guided-response-output-path> --summary <guided-summary-output-path> --scope-hint <scope:id>",
    artifact_paths: {
      manifest_output_path,
      schema_output_path,
      source_catalog_output_path,
      tool_pack_sample_request_output_path,
      tool_pack_sample_response_output_path,
      tool_pack_sample_summary_output_path,
      tool_pack_sample_index_output_path,
      tool_pack_index_output_path,
      guided_request_output_path,
      guided_response_output_path,
      guided_summary_output_path,
      guided_index_output_path
    },
    artifact_contract_refs: {
      tool_pack_index: toolPackWriteResult.output_contract_ref,
      source_catalog: sourceCatalogArtifact.catalog_version,
      guided_command: guidedCommandResult.output_contract_ref,
      guided_response_summary: guidedObservationSummary.agent_readable_contract,
      guided_run_summary: guidedSummaryArtifact.output_contract_ref
    },
    selected_scope_id: guidedCommandResult.selected_scope_id,
    selected_source_ref: guidedCommandResult.selected_source_ref,
    requested_sample_scope_id: selectedCatalogEntry.scope_id,
    guided_run_selected_scope_ids: guidedCommandResult.guided_run_selected_scope_ids,
    guided_run_selected_source_refs: guidedCommandResult.guided_run_selected_source_refs,
    safe_agent_use_hints: guidedSummaryArtifact.safe_agent_use_hints,
    denied_agent_action_hints: guidedSummaryArtifact.denied_agent_action_hints,
    file_read_performed: true,
    file_write_performed: true,
    writes_only_explicit_sample_artifact_paths: true,
    reads_only_explicit_tool_pack_index_and_referenced_catalog: true,
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
    runtime_permission_granted: guidedCommandResult.runtime_permission_granted,
    actual_contour_execution_allowed_now:
      guidedCommandResult.actual_contour_execution_allowed_now,
    failure_count: toolPackWriteResult.failure_count + guidedCommandResult.failure_count,
    failures: [...toolPackWriteResult.failures, ...guidedCommandResult.failures]
  };

  writeFileSync(guided_index_output_path, stableJson(guidedIndexArtifact), "utf8");

  return guidedIndexArtifact;
};

const isDirectRun = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectRun) {
  try {
    const result = writeLocalV0SourceCatalogGuidedCommandSampleArtifactSet(
      parseArgs(process.argv.slice(2))
    );

    console.log(stableJson(result));
    process.exit(result.failure_count === 0 ? 0 : 1);
  } catch (error) {
    console.error(
      stableJson({
        verification_result:
          "local_v0_source_catalog_guided_command_sample_artifact_set_failed",
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
