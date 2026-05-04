#!/usr/bin/env node

import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import {
  runLocalRealSourceAdapterV0
} from "./local-real-source-adapter-v0-cli.mjs";

const stableJson = (value) => `${JSON.stringify(value, null, 2)}\n`;
const usage =
  "Usage: node scripts/local-real-source-agent-request-runner-v0-cli.mjs --request <path> --response-output <path> --summary-output <path> --index-output <path>";
const allowedScopeIds = new Set(["scope:repo-work-context"]);

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

  if (
    args.size !== 4 ||
    !args.has("request") ||
    !args.has("response-output") ||
    !args.has("summary-output") ||
    !args.has("index-output")
  ) {
    throw new Error(usage);
  }

  return {
    request_path: resolve(args.get("request")),
    response_output_path: resolve(args.get("response-output")),
    summary_output_path: resolve(args.get("summary-output")),
    index_output_path: resolve(args.get("index-output"))
  };
};

const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));

const readRequestedScopeHints = (requestJson) =>
  Array.isArray(requestJson?.intent?.requested_scope_hints)
    ? requestJson.intent.requested_scope_hints
    : [];

const requestAuthorityIsDefaultDeny = (requestJson) =>
  requestJson?.authority?.permission_grant_issued === false &&
  requestJson?.authority?.runtime_permission_granted === false &&
  requestJson?.authority?.mcp_route_permission_granted === false &&
  requestJson?.authority?.api_route_permission_granted === false;

const validateRequest = (requestJson) => {
  const requestedScopeHints = readRequestedScopeHints(requestJson);
  const unsupportedScopeHints = requestedScopeHints.filter(
    (scopeHint) => !allowedScopeIds.has(scopeHint)
  );

  if (!requestAuthorityIsDefaultDeny(requestJson)) {
    return {
      accepted: false,
      reason: "request_authority_not_default_deny",
      requested_scope_hints: requestedScopeHints
    };
  }

  if (requestedScopeHints.length === 0) {
    return {
      accepted: false,
      reason: "request_missing_scope_hints",
      requested_scope_hints: requestedScopeHints
    };
  }

  if (unsupportedScopeHints.length > 0) {
    return {
      accepted: false,
      reason: "request_scope_not_supported_by_local_real_source_runner_v0",
      requested_scope_hints: requestedScopeHints,
      unsupported_scope_hints: unsupportedScopeHints
    };
  }

  return {
    accepted: true,
    requested_scope_hints: requestedScopeHints
  };
};

const createDeniedArtifacts = ({
  request_path,
  response_output_path,
  summary_output_path,
  index_output_path,
  requestJson,
  validation
}) => {
  const responseArtifact = {
    verification_result: "local_real_source_agent_request_runner_v0_denied",
    output_contract_ref: "local-real-source-agent-request-runner-v0-response/v1",
    intended_consumer: "ai_agent",
    request_path,
    agent_context_request_id: requestJson?.agent_context_request_id,
    requested_scope_hints: validation.requested_scope_hints,
    denial_reason: validation.reason,
    unsupported_scope_hints: validation.unsupported_scope_hints ?? [],
    source_read_performed: false,
    live_source_read_performed: false,
    direct_agent_repo_file_access_allowed_now: false,
    arbitrary_file_read_allowed_now: false,
    runtime_permission_granted: false,
    actual_contour_execution_allowed_now: false,
    failure_count: 1,
    failures: [validation.reason]
  };
  const summaryArtifact = {
    verification_result: "local_real_source_agent_request_runner_v0_denied",
    output_contract_ref: "local-real-source-agent-request-runner-v0-summary/v1",
    request_path,
    response_output_path,
    summary_output_path,
    index_output_path,
    requested_scope_hints: validation.requested_scope_hints,
    denial_reason: validation.reason,
    source_read_performed: false,
    live_source_read_performed: false,
    writes_only_explicit_response_summary_index_paths: true,
    direct_agent_repo_file_access_allowed_now: false,
    arbitrary_file_read_allowed_now: false,
    runtime_permission_granted: false,
    actual_contour_execution_allowed_now: false,
    failure_count: 1,
    failures: [validation.reason]
  };
  const indexArtifact = {
    verification_result: "local_real_source_agent_request_runner_v0_denied",
    output_contract_ref: "local-real-source-agent-request-runner-v0-artifact-set/v1",
    request_path,
    artifact_paths: {
      response_output_path,
      summary_output_path,
      index_output_path
    },
    source_read_performed: false,
    live_source_read_performed: false,
    writes_only_explicit_response_summary_index_paths: true,
    direct_agent_repo_file_access_allowed_now: false,
    runtime_permission_granted: false,
    actual_contour_execution_allowed_now: false,
    failure_count: 1,
    failures: [validation.reason]
  };

  writeFileSync(response_output_path, stableJson(responseArtifact), "utf8");
  writeFileSync(summary_output_path, stableJson(summaryArtifact), "utf8");
  writeFileSync(index_output_path, stableJson(indexArtifact), "utf8");

  return summaryArtifact;
};

export const runLocalRealSourceAgentRequestRunnerV0 = ({
  request_path,
  response_output_path,
  summary_output_path,
  index_output_path
}) => {
  const requestJson = readJson(request_path);
  const validation = validateRequest(requestJson);

  if (!validation.accepted) {
    return createDeniedArtifacts({
      request_path,
      response_output_path,
      summary_output_path,
      index_output_path,
      requestJson,
      validation
    });
  }

  const tempDir = mkdtempSync(join(tmpdir(), "local-real-source-agent-request-runner-v0-"));
  const adapterSummaryPath = join(tempDir, "local-real-source-adapter-v0.summary.json");
  const adapterIndexPath = join(tempDir, "local-real-source-adapter-v0.index.json");
  const adapterRunResult = runLocalRealSourceAdapterV0({
    response_output_path,
    summary_output_path: adapterSummaryPath,
    index_output_path: adapterIndexPath
  });
  const responseJson = readJson(response_output_path);
  const adapterSummary = readJson(adapterSummaryPath);
  const adapterIndex = readJson(adapterIndexPath);
  const summaryArtifact = {
    verification_result: "local_real_source_agent_request_runner_v0_completed",
    output_contract_ref: "local-real-source-agent-request-runner-v0-summary/v1",
    request_path,
    response_output_path,
    summary_output_path,
    index_output_path,
    agent_context_request_id: requestJson.agent_context_request_id,
    request_operation_id: requestJson.operation_id,
    request_operation_version: requestJson.operation_version,
    requested_scope_hints: validation.requested_scope_hints,
    adapter_output_contract_ref: adapterRunResult.output_contract_ref,
    response_contract_ref: responseJson.output_contract_ref,
    source_materialization_receipt_id:
      responseJson.source_materialization_receipt?.receipt_id,
    source_materialization_receipt_ref:
      responseJson.source_materialization_receipt?.receipt_version,
    read_boundary_ref: responseJson.read_boundary_ref,
    source_catalog_ref: responseJson.source_catalog_ref,
    selected_scope_ids: responseJson.selected_scope_ids,
    selected_source_refs: responseJson.selected_source_refs,
    selected_source_item_count: responseJson.source_items?.length ?? 0,
    content_digests: adapterSummary.content_digests,
    provenance_envelope_ref: responseJson.provenance_envelope_ref,
    permission_envelope_ref: responseJson.permission_envelope_ref,
    audit_envelope_ref: responseJson.audit_envelope_ref,
    request_file_read_performed: true,
    source_read_performed: true,
    live_source_read_performed: true,
    response_file_write_performed: true,
    summary_file_write_performed: true,
    index_file_write_performed: true,
    writes_only_explicit_response_summary_index_paths: true,
    reads_only_explicit_request_and_narrow_real_source_refs: true,
    child_process_spawned: false,
    direct_agent_repo_file_access_allowed_now: false,
    arbitrary_source_loading_allowed: false,
    arbitrary_file_read_allowed_now: false,
    user_selected_path_read_allowed_now: false,
    directory_traversal_allowed_now: false,
    directory_listing_allowed_now: false,
    repo_scanning_allowed_now: false,
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
    failure_count: adapterRunResult.failure_count,
    failures: adapterRunResult.failures
  };
  const indexArtifact = {
    verification_result: "local_real_source_agent_request_runner_v0_artifact_set_written",
    output_contract_ref: "local-real-source-agent-request-runner-v0-artifact-set/v1",
    intended_consumer: "ai_agent",
    sample_command:
      "npm run tool:local-real-source-agent-request-runner-v0:run -- --request <path> --response-output <path> --summary-output <path> --index-output <path>",
    request_path,
    artifact_paths: {
      response_output_path,
      summary_output_path,
      index_output_path
    },
    adapter_artifact_contract_refs: adapterIndex.artifact_contract_refs,
    runner_summary_contract_ref: summaryArtifact.output_contract_ref,
    selected_scope_ids: summaryArtifact.selected_scope_ids,
    selected_source_refs: summaryArtifact.selected_source_refs,
    content_digests: summaryArtifact.content_digests,
    request_file_read_performed: true,
    source_read_performed: true,
    live_source_read_performed: true,
    writes_only_explicit_response_summary_index_paths: true,
    reads_only_explicit_request_and_narrow_real_source_refs: true,
    direct_agent_repo_file_access_allowed_now: false,
    runtime_permission_granted: false,
    actual_contour_execution_allowed_now: false,
    failure_count: summaryArtifact.failure_count,
    failures: summaryArtifact.failures
  };

  writeFileSync(summary_output_path, stableJson(summaryArtifact), "utf8");
  writeFileSync(index_output_path, stableJson(indexArtifact), "utf8");

  return summaryArtifact;
};

const isDirectRun = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectRun) {
  try {
    const result = runLocalRealSourceAgentRequestRunnerV0(parseArgs(process.argv.slice(2)));

    console.log(stableJson(result));
    process.exit(result.failure_count === 0 ? 0 : 1);
  } catch (error) {
    console.error(
      stableJson({
        verification_result: "local_real_source_agent_request_runner_v0_failed",
        output_contract_ref: "local-real-source-agent-request-runner-v0-summary/v1",
        message: error instanceof Error ? error.message : String(error),
        request_file_read_performed: false,
        source_read_performed: false,
        response_file_write_performed: false,
        summary_file_write_performed: false,
        index_file_write_performed: false,
        runtime_permission_granted: false,
        actual_contour_execution_allowed_now: false,
        failure_count: 1
      })
    );
    process.exit(1);
  }
}
