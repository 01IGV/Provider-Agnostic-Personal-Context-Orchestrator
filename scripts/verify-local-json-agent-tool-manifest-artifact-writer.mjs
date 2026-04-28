#!/usr/bin/env node

import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { writeLocalJsonAgentToolManifestArtifact } from "./local-json-agent-tool-manifest-cli.mjs";

const tempDir = mkdtempSync(join(tmpdir(), "local-json-agent-tool-manifest-artifact-writer-"));
const manifestOutputPath = join(tempDir, "local-json-agent-tool-manifest.json");

const writeResult = writeLocalJsonAgentToolManifestArtifact({
  manifest_output_path: manifestOutputPath
});
const manifestArtifact = JSON.parse(readFileSync(manifestOutputPath, "utf8"));
const commandRefs = manifestArtifact.commands.map((command) => command.command_ref);

const assertions = {
  artifact_written:
    writeResult.verification_result === "local_json_agent_tool_manifest_artifact_written" &&
    writeResult.failure_count === 0 &&
    writeResult.manifest_artifact_written === true &&
    writeResult.manifest_output_path === manifestOutputPath,
  artifact_is_agent_manifest:
    manifestArtifact.verification_result === "local_json_agent_tool_manifest_ready" &&
    manifestArtifact.manifest_id === "local-json-agent-tool-manifest" &&
    manifestArtifact.manifest_version === "local-json-agent-tool-manifest/v1" &&
    manifestArtifact.intended_consumer === "ai_agent",
  artifact_lists_manifest_writer:
    manifestArtifact.recommended_sequence.includes("tool:local-json-agent-tool-manifest:write") &&
    commandRefs.includes("tool:local-json-agent-tool-manifest:write"),
  artifact_preserves_schema_and_runner_refs:
    commandRefs.includes("tool:agent-request-response-schema:print") &&
    commandRefs.includes("tool:schema-aware-local-json-examples:print") &&
    commandRefs.includes("tool:local-json-example-artifacts:write") &&
    commandRefs.includes("proof:local-json-example-artifact-round-trip:verify") &&
    commandRefs.includes("tool:local-json:run") &&
    manifestArtifact.schema_contract_ref === "local-json-agent-request-response-contract-schema/v1",
  artifact_local_io_policy_is_bounded:
    manifestArtifact.local_io_policy.reads_only_explicit_request_fixture === true &&
    manifestArtifact.local_io_policy.writes_only_explicit_response_fixture === true &&
    manifestArtifact.local_io_policy.writes_only_explicit_manifest_artifact_path === true &&
    manifestArtifact.local_io_policy.writes_only_explicit_example_artifact_paths === true &&
    manifestArtifact.local_io_policy.arbitrary_source_loading_allowed === false &&
    manifestArtifact.local_io_policy.multi_request_runner_implemented === false,
  default_deny_posture_preserved:
    writeResult.runtime_permission_granted === false &&
    writeResult.actual_contour_execution_allowed_now === false &&
    manifestArtifact.runtime_permission_granted === false &&
    manifestArtifact.actual_contour_execution_allowed_now === false,
  runtime_surfaces_remain_closed:
    writeResult.child_process_spawned === false &&
    writeResult.mcp_server_implemented === false &&
    writeResult.mcp_tool_registered === false &&
    writeResult.mcp_resource_registered === false &&
    writeResult.api_route_registered === false &&
    writeResult.api_controller_registered === false &&
    writeResult.runtime_handler_bound === false &&
    writeResult.provider_sdk_call_allowed_now === false &&
    writeResult.concrete_persistence_read_allowed_now === false &&
    writeResult.concrete_persistence_write_allowed_now === false &&
    writeResult.real_model_call_allowed_now === false &&
    writeResult.real_storage_write_allowed_now === false
};

const failed = Object.entries(assertions)
  .filter(([, passed]) => passed !== true)
  .map(([name]) => name);

const verification = {
  verification_result:
    failed.length === 0
      ? "local_json_agent_tool_manifest_artifact_writer_verified"
      : "local_json_agent_tool_manifest_artifact_writer_failed",
  manifest_output_path: manifestOutputPath,
  manifest_id: manifestArtifact.manifest_id,
  manifest_version: manifestArtifact.manifest_version,
  output_contract_ref: writeResult.output_contract_ref,
  command_refs: commandRefs,
  runtime_permission_granted: writeResult.runtime_permission_granted,
  actual_contour_execution_allowed_now: writeResult.actual_contour_execution_allowed_now,
  failure_count: failed.length,
  failures: failed
};

console.log(JSON.stringify(verification, null, 2));

if (failed.length > 0) {
  process.exit(1);
}
