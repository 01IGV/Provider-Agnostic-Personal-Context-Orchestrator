#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import {
  runLocalJsonAgentLocalV0SingleCommand
} from "./local-json-agent-local-v0-single-command-runner.mjs";

const stableJson = (value) => `${JSON.stringify(value, null, 2)}\n`;
const usage =
  "Usage: node scripts/local-v0-source-catalog-guided-command.mjs --tool-pack-index <path> --request <path> --response <path> --summary <path> [--scope-hint <scope:id>] [--task-signal <text>] [--read-mode <mode>] [--depth <hint>]";

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

  const toolPackIndex = args.get("tool-pack-index");
  const request = args.get("request");
  const response = args.get("response");
  const summary = args.get("summary");

  if (!toolPackIndex || !request || !response || !summary) {
    throw new Error("The --tool-pack-index, --request, --response, and --summary paths are required.");
  }

  return {
    tool_pack_index_path: resolve(toolPackIndex),
    request_path: resolve(request),
    response_path: resolve(response),
    summary_path: resolve(summary),
    scope_hint: args.get("scope-hint"),
    task_signal: args.get("task-signal"),
    read_mode_hint: args.get("read-mode"),
    depth_hint: args.get("depth")
  };
};

const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));

export const runLocalV0SourceCatalogGuidedCommand = ({
  tool_pack_index_path,
  request_path,
  response_path,
  summary_path,
  scope_hint,
  task_signal,
  read_mode_hint,
  depth_hint
}) => {
  const toolPackIndex = readJson(tool_pack_index_path);
  const sourceCatalogPath = toolPackIndex.artifact_paths?.source_catalog_output_path;

  if (!sourceCatalogPath) {
    return {
      verification_result: "local_v0_source_catalog_guided_command_denied",
      output_contract_ref: "local-v0-source-catalog-guided-command/v1",
      tool_pack_index_path,
      request_path,
      response_path,
      summary_path,
      reason: "tool_pack_index_missing_source_catalog_output_path",
      request_fixture_written: false,
      response_file_write_performed: false,
      summary_file_write_performed: false,
      arbitrary_source_loading_allowed: false,
      runtime_permission_granted: false,
      actual_contour_execution_allowed_now: false,
      failure_count: 1,
      failures: ["tool_pack_index_missing_source_catalog_output_path"]
    };
  }

  const sourceCatalog = readJson(sourceCatalogPath);
  const requestedScope = scope_hint ?? sourceCatalog.supported_scope_ids?.[0];
  const selectedCatalogEntry = sourceCatalog.entries?.find(
    (entry) => entry.scope_id === requestedScope
  );

  if (!selectedCatalogEntry) {
    return {
      verification_result: "local_v0_source_catalog_guided_command_denied",
      output_contract_ref: "local-v0-source-catalog-guided-command/v1",
      tool_pack_index_path,
      source_catalog_output_path: sourceCatalogPath,
      request_path,
      response_path,
      summary_path,
      requested_scope_id: requestedScope,
      reason: "requested_scope_not_in_source_catalog",
      request_fixture_written: false,
      response_file_write_performed: false,
      summary_file_write_performed: false,
      arbitrary_source_loading_allowed: false,
      runtime_permission_granted: false,
      actual_contour_execution_allowed_now: false,
      failure_count: 1,
      failures: ["requested_scope_not_in_source_catalog"]
    };
  }

  const runResult = runLocalJsonAgentLocalV0SingleCommand({
    request_path,
    response_path,
    summary_path,
    variation: {
      task_signal:
        task_signal ?? "source catalog guided local v0 bounded planning request",
      read_mode_hint: read_mode_hint ?? "planning",
      depth_hint: depth_hint ?? "standard",
      requested_scope_hints: [selectedCatalogEntry.scope_id]
    }
  });

  const selectedSourceRefsMatchCatalog =
    runResult.selected_source_refs?.join("|") === selectedCatalogEntry.source_ref;
  const selectedScopeIdsMatchCatalog =
    runResult.selected_scope_ids?.join("|") === selectedCatalogEntry.scope_id;
  const sourceCatalogDefaultDeny =
    sourceCatalog.execution_posture?.runtime_permission_granted === false &&
    sourceCatalog.execution_posture?.actual_contour_execution_allowed_now === false;
  const failureReasons = [
    ...(runResult.failures ?? []),
    ...(selectedSourceRefsMatchCatalog ? [] : ["selected_source_refs_do_not_match_catalog"]),
    ...(selectedScopeIdsMatchCatalog ? [] : ["selected_scope_ids_do_not_match_catalog"]),
    ...(sourceCatalogDefaultDeny ? [] : ["source_catalog_default_deny_not_preserved"])
  ];

  return {
    verification_result:
      failureReasons.length === 0
        ? "local_v0_source_catalog_guided_command_completed"
        : "local_v0_source_catalog_guided_command_denied",
    output_contract_ref: "local-v0-source-catalog-guided-command/v1",
    tool_pack_index_path,
    source_catalog_output_path: sourceCatalogPath,
    request_path,
    response_path,
    summary_path,
    source_catalog_ref: sourceCatalog.catalog_version,
    selected_scope_id: selectedCatalogEntry.scope_id,
    selected_source_ref: selectedCatalogEntry.source_ref,
    guided_run_selected_scope_ids: runResult.selected_scope_ids,
    guided_run_selected_source_refs: runResult.selected_source_refs,
    request_fixture_written: runResult.request_fixture_written,
    request_fixture_read: runResult.request_fixture_read,
    response_file_write_performed: runResult.response_file_write_performed,
    summary_file_write_performed: runResult.summary_file_write_performed,
    writes_only_explicit_request_response_summary_paths:
      runResult.writes_only_explicit_request_response_summary_paths,
    reads_only_explicit_tool_pack_index_and_referenced_catalog: true,
    arbitrary_source_loading_allowed: false,
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
    runtime_permission_granted: runResult.runtime_permission_granted,
    actual_contour_execution_allowed_now: runResult.actual_contour_execution_allowed_now,
    failure_count: failureReasons.length,
    failures: failureReasons
  };
};

const isDirectRun = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectRun) {
  try {
    const result = runLocalV0SourceCatalogGuidedCommand(parseArgs(process.argv.slice(2)));

    console.log(stableJson(result));
    process.exit(result.failure_count === 0 ? 0 : 1);
  } catch (error) {
    console.error(
      stableJson({
        verification_result: "local_v0_source_catalog_guided_command_failed",
        output_contract_ref: "local-v0-source-catalog-guided-command/v1",
        message: error instanceof Error ? error.message : String(error),
        request_fixture_written: false,
        response_file_write_performed: false,
        summary_file_write_performed: false,
        runtime_permission_granted: false,
        actual_contour_execution_allowed_now: false,
        failure_count: 1
      })
    );
    process.exit(1);
  }
}
