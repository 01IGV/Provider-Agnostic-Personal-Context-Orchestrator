#!/usr/bin/env node

import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  runLocalJsonSingleCommand
} from "./local-json-single-command-runner.mjs";

const tempDir = mkdtempSync(join(tmpdir(), "agent-readable-response-use-guidance-"));
const requestPath = join(tempDir, "agent-context-request.input.json");
const responsePath = join(tempDir, "verified-protocol-surface-adapter.output.json");

const runResult = runLocalJsonSingleCommand({
  request_path: requestPath,
  response_path: responsePath,
  variation: {
    task_signal: "agent-readable response use guidance smoke",
    read_mode_hint: "planning",
    depth_hint: "standard",
    requested_scope_hints: ["scope:active-boundary-chain"]
  }
});

const runnerOutput = JSON.parse(readFileSync(responsePath, "utf8"));
const observationSummary = runnerOutput.response_observation_summary_json;

const assertions = {
  run_completed:
    runResult.verification_result === "local_json_single_command_run_completed" &&
    runResult.failure_count === 0,
  agent_contract_present:
    observationSummary.agent_readable_contract === "agent-readable-local-json-response-observation/v1" &&
    observationSummary.agent_response_status === "bounded_context_ready_for_agent_use" &&
    runResult.agent_readable_contract === observationSummary.agent_readable_contract &&
    runResult.agent_response_status === observationSummary.agent_response_status,
  selected_context_still_visible:
    observationSummary.selected_source_item_count === 1 &&
    observationSummary.selected_source_refs[0] === "local://deterministic/context/active-boundary-chain" &&
    observationSummary.selected_scope_ids[0] === "scope:active-boundary-chain",
  safe_use_guidance_present:
    runResult.safe_agent_use_hints.includes("read_selected_bounded_context") &&
    observationSummary.safe_agent_use_hints.includes("read_selected_bounded_context") &&
    observationSummary.safe_agent_use_hints.includes("use_selected_source_refs_for_grounding") &&
    observationSummary.safe_agent_use_hints.includes("preserve_authority_provenance_permission_audit_refs") &&
    observationSummary.safe_agent_use_hints.includes("treat_response_as_non_executing_context"),
  denied_action_guidance_present:
    runResult.denied_agent_action_hints.includes("do_not_invoke_contours") &&
    observationSummary.denied_agent_action_hints.includes("do_not_execute_runtime_handlers") &&
    observationSummary.denied_agent_action_hints.includes("do_not_call_provider_sdks") &&
    observationSummary.denied_agent_action_hints.includes("do_not_read_or_write_concrete_persistence") &&
    observationSummary.denied_agent_action_hints.includes("do_not_issue_permission_grants") &&
    observationSummary.denied_agent_action_hints.includes("do_not_perform_model_calls") &&
    observationSummary.denied_agent_action_hints.includes("do_not_perform_storage_writes") &&
    observationSummary.denied_agent_action_hints.includes("do_not_invoke_contours"),
  posture_remains_default_deny:
    observationSummary.runtime_permission_granted === false &&
    observationSummary.actual_contour_execution_allowed_now === false &&
    runResult.runtime_permission_granted === false &&
    runResult.actual_contour_execution_allowed_now === false,
  runtime_surfaces_remain_closed:
    runResult.child_process_spawned === false &&
    runResult.mcp_server_implemented === false &&
    runResult.mcp_tool_registered === false &&
    runResult.mcp_resource_registered === false &&
    runResult.api_route_registered === false &&
    runResult.api_controller_registered === false &&
    runResult.runtime_handler_bound === false &&
    runResult.provider_sdk_call_allowed_now === false &&
    runResult.transport_execution_allowed_now === false &&
    runResult.concrete_persistence_read_allowed_now === false &&
    runResult.concrete_persistence_write_allowed_now === false &&
    runResult.real_model_call_allowed_now === false &&
    runResult.real_storage_write_allowed_now === false
};

const failed = Object.entries(assertions)
  .filter(([, passed]) => passed !== true)
  .map(([name]) => name);

const verification = {
  verification_result:
    failed.length === 0
      ? "agent_readable_response_use_guidance_verified"
      : "agent_readable_response_use_guidance_failed",
  request_path: requestPath,
  response_path: responsePath,
  agent_readable_contract: observationSummary.agent_readable_contract,
  agent_response_status: observationSummary.agent_response_status,
  selected_source_refs: observationSummary.selected_source_refs,
  safe_agent_use_hints: observationSummary.safe_agent_use_hints,
  denied_agent_action_hints: observationSummary.denied_agent_action_hints,
  runtime_permission_granted: observationSummary.runtime_permission_granted,
  actual_contour_execution_allowed_now: observationSummary.actual_contour_execution_allowed_now,
  failure_count: failed.length,
  failures: failed
};

console.log(JSON.stringify(verification, null, 2));

if (failed.length > 0) {
  process.exit(1);
}
