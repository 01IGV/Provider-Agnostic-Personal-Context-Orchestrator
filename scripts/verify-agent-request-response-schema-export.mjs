#!/usr/bin/env node

import { readLocalJsonAgentContractSchema } from "./local-json-agent-contract-schema-cli.mjs";
import { runLocalJsonSingleCommand } from "./local-json-single-command-runner.mjs";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const schemaResult = readLocalJsonAgentContractSchema();
const schema = schemaResult.schema_json;

const tempDir = mkdtempSync(join(tmpdir(), "agent-request-response-schema-export-"));
const requestPath = join(tempDir, "agent-context-request.input.json");
const responsePath = join(tempDir, "verified-protocol-surface-adapter.output.json");

const runResult = runLocalJsonSingleCommand({
  request_path: requestPath,
  response_path: responsePath,
  variation: {
    task_signal: "agent request response schema export smoke",
    read_mode_hint: "planning",
    depth_hint: "standard",
    requested_scope_hints: ["scope:active-boundary-chain"]
  }
});

const runnerOutput = JSON.parse(readFileSync(responsePath, "utf8"));
const requestJson = JSON.parse(readFileSync(requestPath, "utf8"));
const observationSummary = runnerOutput.response_observation_summary_json;

const fieldPaths = (section) => section.required_fields.map((field) => field.path);
const requestPaths = fieldPaths(schema.request_contract);
const responsePaths = fieldPaths(schema.response_contract);

const assertions = {
  schema_export_ready:
    schemaResult.verification_result === "local_json_agent_request_response_contract_schema_ready" &&
    schema.contract_id === "local-json-agent-request-response-contract-schema" &&
    schema.contract_version === "local-json-agent-request-response-contract-schema/v1" &&
    schema.agent_readable === true &&
    schema.intended_consumer === "ai_agent",
  request_schema_names_core_agent_fields:
    schema.request_contract.shape_ref === "AgentContextRequestBoundaryShape" &&
    requestPaths.includes("operation_id") &&
    requestPaths.includes("operation_version") &&
    requestPaths.includes("intent.task_signal") &&
    requestPaths.includes("intent.requested_scope_hints") &&
    requestPaths.includes("authority.permission_grant_issued") &&
    requestPaths.includes("execution_posture.actual_contour_execution_allowed_now"),
  response_schema_names_agent_summary_fields:
    schema.response_contract.shape_ref === "LocalJsonRequestResponseRunnerResponseEnvelopeShape" &&
    responsePaths.includes("response_observation_summary_json.agent_readable_contract") &&
    responsePaths.includes("response_observation_summary_json.agent_response_status") &&
    responsePaths.includes("response_observation_summary_json.selected_source_refs") &&
    responsePaths.includes("response_observation_summary_json.safe_agent_use_hints") &&
    responsePaths.includes("response_observation_summary_json.denied_agent_action_hints"),
  schema_path_policy_is_bounded:
    schema.path_policy.allowed_request_variation_paths.includes("intent.task_signal") &&
    schema.path_policy.allowed_request_variation_paths.includes("intent.requested_scope_hints") &&
    schema.path_policy.denied_request_variation_paths.includes("authority.*") &&
    schema.path_policy.denied_request_variation_paths.includes("execution_posture.*"),
  schema_local_io_is_single_bounded_command:
    schema.local_io.command_ref === "tool:local-json:run" &&
    schema.local_io.reads_only_explicit_request_fixture === true &&
    schema.local_io.writes_only_explicit_response_fixture === true &&
    schema.local_io.arbitrary_source_loading_allowed === false &&
    schema.local_io.multi_request_runner_implemented === false,
  schema_matches_actual_request_response:
    requestJson.operation_id === "agent_context_request_boundary" &&
    requestJson.operation_version === "agent-context-request-boundary/v1" &&
    observationSummary.agent_readable_contract === "agent-readable-local-json-response-observation/v1" &&
    observationSummary.agent_response_status === "bounded_context_ready_for_agent_use" &&
    observationSummary.selected_source_refs[0] === "local://deterministic/context/active-boundary-chain",
  safe_and_denied_hints_match_response:
    schema.safe_agent_use_hints.every((hint) => observationSummary.safe_agent_use_hints.includes(hint)) &&
    schema.denied_agent_action_hints.every((hint) => observationSummary.denied_agent_action_hints.includes(hint)),
  default_deny_posture_preserved:
    schema.default_deny_execution_posture.runtime_permission_granted === false &&
    schema.default_deny_execution_posture.actual_contour_execution_allowed_now === false &&
    schema.default_deny_execution_posture.mcp_server_implemented === false &&
    schema.default_deny_execution_posture.provider_sdk_call_allowed_now === false &&
    schemaResult.runtime_permission_granted === false &&
    schemaResult.actual_contour_execution_allowed_now === false &&
    runResult.runtime_permission_granted === false &&
    runResult.actual_contour_execution_allowed_now === false,
  runtime_surfaces_remain_closed:
    schemaResult.mcp_server_implemented === false &&
    schemaResult.mcp_tool_registered === false &&
    schemaResult.mcp_resource_registered === false &&
    schemaResult.api_route_registered === false &&
    schemaResult.api_controller_registered === false &&
    schemaResult.runtime_handler_bound === false &&
    schemaResult.provider_sdk_call_allowed_now === false &&
    schemaResult.concrete_persistence_read_allowed_now === false &&
    schemaResult.concrete_persistence_write_allowed_now === false &&
    schemaResult.real_model_call_allowed_now === false &&
    schemaResult.real_storage_write_allowed_now === false
};

const failed = Object.entries(assertions)
  .filter(([, passed]) => passed !== true)
  .map(([name]) => name);

const verification = {
  verification_result:
    failed.length === 0
      ? "agent_request_response_schema_export_verified"
      : "agent_request_response_schema_export_failed",
  contract_id: schema.contract_id,
  contract_version: schema.contract_version,
  intended_consumer: schema.intended_consumer,
  request_shape_ref: schema.request_contract.shape_ref,
  response_shape_ref: schema.response_contract.shape_ref,
  allowed_request_variation_paths: schema.path_policy.allowed_request_variation_paths,
  command_ref: schema.local_io.command_ref,
  selected_source_refs: observationSummary.selected_source_refs,
  runtime_permission_granted: schema.default_deny_execution_posture.runtime_permission_granted,
  actual_contour_execution_allowed_now:
    schema.default_deny_execution_posture.actual_contour_execution_allowed_now,
  failure_count: failed.length,
  failures: failed
};

console.log(JSON.stringify(verification, null, 2));

if (failed.length > 0) {
  process.exit(1);
}
