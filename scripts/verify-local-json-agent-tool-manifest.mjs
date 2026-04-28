#!/usr/bin/env node

import { readLocalJsonAgentToolManifest } from "./local-json-agent-tool-manifest-cli.mjs";

const manifest = readLocalJsonAgentToolManifest();
const commandRefs = manifest.commands.map((command) => command.command_ref);

const assertions = {
  manifest_ready:
    manifest.verification_result === "local_json_agent_tool_manifest_ready" &&
    manifest.manifest_id === "local-json-agent-tool-manifest" &&
    manifest.manifest_version === "local-json-agent-tool-manifest/v1" &&
    manifest.intended_consumer === "ai_agent",
  manifest_lists_agent_tool_sequence:
    manifest.recommended_sequence[0] === "tool:agent-request-response-schema:print" &&
    manifest.recommended_sequence.includes("tool:local-json-agent-tool-manifest:write") &&
    manifest.recommended_sequence.includes("tool:local-json-example-artifacts:write") &&
    manifest.recommended_sequence.includes("tool:local-json-agent-handoff-bundle:write") &&
    manifest.recommended_sequence.includes("proof:local-json-agent-handoff-bundle-round-trip:verify") &&
    manifest.recommended_sequence.includes("tool:local-json-agent-handoff-bundle:consume") &&
    manifest.recommended_sequence.includes("tool:local-json-agent-request:run") &&
    manifest.recommended_sequence.includes("tool:local-json-agent-request-runner-sample:write") &&
    manifest.recommended_sequence.includes("tool:local-json-agent-local-v0-tool-pack:write") &&
    manifest.recommended_sequence.includes("tool:local-v0-source-catalog-guided:run") &&
    manifest.recommended_sequence.includes("tool:local-v0-source-catalog-guided-sample:write") &&
    manifest.recommended_sequence.includes("tool:local-v0-repo-work-context-guided-sample:write") &&
    manifest.recommended_sequence.includes("tool:local-json-agent-local-v0:run") &&
    manifest.recommended_sequence.includes("proof:local-json-example-artifact-round-trip:verify") &&
    manifest.recommended_sequence.includes("tool:local-json:run"),
  manifest_lists_required_commands:
    commandRefs.includes("tool:agent-request-response-schema:print") &&
    commandRefs.includes("tool:schema-aware-local-json-examples:print") &&
    commandRefs.includes("tool:local-json-agent-tool-manifest:write") &&
    commandRefs.includes("tool:local-json-example-artifacts:write") &&
    commandRefs.includes("tool:local-json-agent-handoff-bundle:write") &&
    commandRefs.includes("proof:local-json-agent-handoff-bundle-round-trip:verify") &&
    commandRefs.includes("tool:local-json-agent-handoff-bundle:consume") &&
    commandRefs.includes("tool:local-json-agent-request:run") &&
    commandRefs.includes("tool:local-json-agent-request-runner-sample:write") &&
    commandRefs.includes("tool:local-json-agent-local-v0-tool-pack:write") &&
    commandRefs.includes("tool:local-v0-source-catalog-guided:run") &&
    commandRefs.includes("tool:local-v0-source-catalog-guided-sample:write") &&
    commandRefs.includes("tool:local-v0-repo-work-context-guided-sample:write") &&
    commandRefs.includes("tool:local-json-agent-local-v0:run") &&
    commandRefs.includes("proof:local-json-example-artifact-round-trip:verify") &&
    commandRefs.includes("tool:local-json:run"),
  manifest_exposes_source_catalog_tool_pack_output:
    manifest.commands.find(
      (command) => command.command_ref === "tool:local-json-agent-local-v0-tool-pack:write"
    )?.command.includes("--source-catalog-output <path>") === true,
  manifest_exposes_guided_source_catalog_command:
    manifest.commands.find(
      (command) => command.command_ref === "tool:local-v0-source-catalog-guided:run"
    )?.command.includes("--tool-pack-index <path>") === true,
  manifest_exposes_guided_source_catalog_sample_writer:
    manifest.commands.find(
      (command) => command.command_ref === "tool:local-v0-source-catalog-guided-sample:write"
    )?.command.includes("--guided-index-output <path>") === true,
  manifest_exposes_repo_work_context_guided_sample_writer:
    manifest.commands.find(
      (command) => command.command_ref === "tool:local-v0-repo-work-context-guided-sample:write"
    )?.command.includes("--guided-index-output <path>") === true,
  manifest_points_to_schema_contract:
    manifest.schema_contract_ref === "local-json-agent-request-response-contract-schema/v1" &&
    manifest.request_shape_ref === "AgentContextRequestBoundaryShape" &&
    manifest.response_shape_ref === "LocalJsonRequestResponseRunnerResponseEnvelopeShape",
  manifest_preserves_path_policy:
    manifest.allowed_request_variation_paths.includes("intent.task_signal") &&
    manifest.allowed_request_variation_paths.includes("intent.requested_scope_hints") &&
    manifest.denied_request_variation_paths.includes("authority.*") &&
    manifest.denied_request_variation_paths.includes("execution_posture.*"),
  manifest_exposes_safe_and_denied_hints:
    manifest.safe_agent_use_hints.includes("read_selected_bounded_context") &&
    manifest.safe_agent_use_hints.includes("use_selected_source_refs_for_grounding") &&
    manifest.denied_agent_action_hints.includes("do_not_execute_runtime_handlers") &&
    manifest.denied_agent_action_hints.includes("do_not_call_provider_sdks") &&
    manifest.denied_agent_action_hints.includes("do_not_invoke_contours"),
  manifest_local_io_policy_is_bounded:
    manifest.local_io_policy.reads_only_explicit_request_fixture === true &&
    manifest.local_io_policy.writes_only_explicit_response_fixture === true &&
    manifest.local_io_policy.writes_only_explicit_manifest_artifact_path === true &&
    manifest.local_io_policy.writes_only_explicit_example_artifact_paths === true &&
    manifest.local_io_policy.writes_only_explicit_handoff_bundle_artifact_paths === true &&
    manifest.local_io_policy.writes_only_explicit_handoff_bundle_consumption_output_path === true &&
    manifest.local_io_policy.writes_only_explicit_agent_request_run_output_paths === true &&
    manifest.local_io_policy.writes_only_explicit_agent_request_runner_sample_artifact_paths === true &&
    manifest.local_io_policy.writes_only_explicit_local_v0_tool_pack_artifact_paths === true &&
    manifest.local_io_policy.writes_only_explicit_local_v0_single_command_paths === true &&
    manifest.local_io_policy.writes_only_explicit_local_v0_guided_sample_artifact_paths === true &&
    manifest.local_io_policy.writes_only_explicit_local_v0_repo_work_guided_sample_artifact_paths === true &&
    manifest.local_io_policy.arbitrary_source_loading_allowed === false &&
    manifest.local_io_policy.multi_request_runner_implemented === false,
  default_deny_posture_preserved:
    manifest.runtime_permission_granted === false &&
    manifest.actual_contour_execution_allowed_now === false &&
    manifest.default_deny_execution_posture.runtime_permission_granted === false &&
    manifest.default_deny_execution_posture.actual_contour_execution_allowed_now === false,
  runtime_surfaces_remain_closed:
    manifest.mcp_server_implemented === false &&
    manifest.mcp_tool_registered === false &&
    manifest.mcp_resource_registered === false &&
    manifest.api_route_registered === false &&
    manifest.api_controller_registered === false &&
    manifest.runtime_handler_bound === false &&
    manifest.provider_sdk_call_allowed_now === false &&
    manifest.concrete_persistence_read_allowed_now === false &&
    manifest.concrete_persistence_write_allowed_now === false &&
    manifest.real_model_call_allowed_now === false &&
    manifest.real_storage_write_allowed_now === false
};

const failed = Object.entries(assertions)
  .filter(([, passed]) => passed !== true)
  .map(([name]) => name);

const verification = {
  verification_result:
    failed.length === 0
      ? "local_json_agent_tool_manifest_verified"
      : "local_json_agent_tool_manifest_failed",
  manifest_id: manifest.manifest_id,
  manifest_version: manifest.manifest_version,
  command_refs: commandRefs,
  schema_contract_ref: manifest.schema_contract_ref,
  runtime_permission_granted: manifest.runtime_permission_granted,
  actual_contour_execution_allowed_now: manifest.actual_contour_execution_allowed_now,
  failure_count: failed.length,
  failures: failed
};

console.log(JSON.stringify(verification, null, 2));

if (failed.length > 0) {
  process.exit(1);
}
