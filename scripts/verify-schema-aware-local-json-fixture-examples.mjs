#!/usr/bin/env node

import { readLocalJsonAgentContractSchema } from "./local-json-agent-contract-schema-cli.mjs";
import { readSchemaAwareLocalJsonFixtureExamples } from "./schema-aware-local-json-fixture-examples-cli.mjs";

const schemaResult = readLocalJsonAgentContractSchema();
const schema = schemaResult.schema_json;
const examples = readSchemaAwareLocalJsonFixtureExamples();
const exampleRequest = examples.example_request_json;
const observationSummary = examples.expected_response_observation_summary_json;

const requestFieldPaths = schema.request_contract.required_fields.map((field) => field.path);
const responseFieldPaths = schema.response_contract.required_fields.map((field) => field.path);

const assertions = {
  examples_ready:
    examples.verification_result === "schema_aware_local_json_fixture_examples_ready" &&
    examples.failure_count === 0 &&
    examples.schema_contract_version === "local-json-agent-request-response-contract-schema/v1" &&
    examples.intended_consumer === "ai_agent",
  examples_use_exported_schema_contract:
    examples.schema_contract_version === schema.contract_version &&
    examples.command_ref === schema.local_io.command_ref &&
    schema.local_io.command_ref === "tool:local-json:run",
  example_request_matches_schema:
    requestFieldPaths.includes("operation_id") &&
    requestFieldPaths.includes("intent.task_signal") &&
    exampleRequest.operation_id === "agent_context_request_boundary" &&
    exampleRequest.operation_version === "agent-context-request-boundary/v1" &&
    exampleRequest.intent.task_signal === "schema-aware minimal local JSON fixture example" &&
    exampleRequest.intent.read_mode_hint === "planning" &&
    exampleRequest.intent.depth_hint === "standard" &&
    exampleRequest.intent.requested_scope_hints[0] === "scope:active-boundary-chain",
  example_response_matches_schema:
    responseFieldPaths.includes("response_observation_summary_json.agent_readable_contract") &&
    responseFieldPaths.includes("response_observation_summary_json.safe_agent_use_hints") &&
    observationSummary.agent_readable_contract === "agent-readable-local-json-response-observation/v1" &&
    observationSummary.agent_response_status === "bounded_context_ready_for_agent_use" &&
    observationSummary.selected_source_refs[0] === "local://deterministic/context/active-boundary-chain" &&
    observationSummary.selected_scope_ids[0] === "scope:active-boundary-chain",
  example_hints_match_schema:
    schema.safe_agent_use_hints.every((hint) => examples.safe_agent_use_hints.includes(hint)) &&
    schema.denied_agent_action_hints.every((hint) => examples.denied_agent_action_hints.includes(hint)),
  example_command_is_bounded_local_json:
    examples.example_command.includes("tool:local-json:run") &&
    examples.example_command.includes("--request") &&
    examples.example_command.includes("--response") &&
    examples.example_command.includes("--scope-hints"),
  default_deny_posture_preserved:
    examples.runtime_permission_granted === false &&
    examples.actual_contour_execution_allowed_now === false &&
    observationSummary.runtime_permission_granted === false &&
    observationSummary.actual_contour_execution_allowed_now === false,
  runtime_surfaces_remain_closed:
    examples.mcp_server_implemented === false &&
    examples.mcp_tool_registered === false &&
    examples.mcp_resource_registered === false &&
    examples.api_route_registered === false &&
    examples.api_controller_registered === false &&
    examples.runtime_handler_bound === false &&
    examples.provider_sdk_call_allowed_now === false &&
    examples.concrete_persistence_read_allowed_now === false &&
    examples.concrete_persistence_write_allowed_now === false &&
    examples.real_model_call_allowed_now === false &&
    examples.real_storage_write_allowed_now === false
};

const failed = Object.entries(assertions)
  .filter(([, passed]) => passed !== true)
  .map(([name]) => name);

const verification = {
  verification_result:
    failed.length === 0
      ? "schema_aware_local_json_fixture_examples_verified"
      : "schema_aware_local_json_fixture_examples_failed",
  schema_contract_version: examples.schema_contract_version,
  command_ref: examples.command_ref,
  example_request_operation_id: exampleRequest.operation_id,
  example_scope_hints: exampleRequest.intent.requested_scope_hints,
  selected_source_refs: observationSummary.selected_source_refs,
  runtime_permission_granted: examples.runtime_permission_granted,
  actual_contour_execution_allowed_now: examples.actual_contour_execution_allowed_now,
  failure_count: failed.length,
  failures: failed
};

console.log(JSON.stringify(verification, null, 2));

if (failed.length > 0) {
  process.exit(1);
}
