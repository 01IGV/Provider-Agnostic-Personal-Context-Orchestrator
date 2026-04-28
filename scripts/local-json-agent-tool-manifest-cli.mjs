#!/usr/bin/env node

import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { readLocalJsonAgentContractSchema } from "./local-json-agent-contract-schema-cli.mjs";

const stableJson = (value) => `${JSON.stringify(value, null, 2)}\n`;
const usage =
  "Usage: node scripts/local-json-agent-tool-manifest-cli.mjs [--manifest-output <path>]";

const parseArgs = (argv) => {
  if (argv.length === 0) {
    return {};
  }

  if (argv.length !== 2 || argv[0] !== "--manifest-output" || !argv[1]) {
    throw new Error(usage);
  }

  return {
    manifest_output_path: resolve(argv[1])
  };
};

export const readLocalJsonAgentToolManifest = () => {
  const schemaResult = readLocalJsonAgentContractSchema();
  const schema = schemaResult.schema_json;

  return {
    verification_result: "local_json_agent_tool_manifest_ready",
    manifest_id: "local-json-agent-tool-manifest",
    manifest_version: "local-json-agent-tool-manifest/v1",
    intended_consumer: "ai_agent",
    protocol_surface: "local_json_cli_file_boundary",
    recommended_sequence: [
      "tool:agent-request-response-schema:print",
      "tool:schema-aware-local-json-examples:print",
      "tool:local-json-agent-tool-manifest:write",
      "tool:local-json-example-artifacts:write",
      "tool:local-json-agent-handoff-bundle:write",
      "proof:local-json-agent-handoff-bundle-round-trip:verify",
      "proof:local-json-example-artifact-round-trip:verify",
      "tool:local-json:run"
    ],
    commands: [
      {
        command_ref: "tool:agent-request-response-schema:print",
        command: "npm run tool:agent-request-response-schema:print",
        purpose: "Print the machine-readable request/response contract schema.",
        output_contract_ref: schema.contract_version,
        file_read_allowed: false,
        file_write_allowed: false
      },
      {
        command_ref: "tool:schema-aware-local-json-examples:print",
        command: "npm run tool:schema-aware-local-json-examples:print",
        purpose: "Print schema-aware request and expected response examples for AI agents.",
        output_contract_ref: "schema-aware-local-json-fixture-examples/v1",
        file_read_allowed: true,
        file_write_allowed: false
      },
      {
        command_ref: "tool:local-json-agent-tool-manifest:write",
        command:
          "npm run tool:local-json-agent-tool-manifest:write -- --manifest-output <path>",
        purpose: "Write this manifest to an explicitly provided local artifact path.",
        output_contract_ref: "local-json-agent-tool-manifest-artifact/v1",
        file_read_allowed: true,
        file_write_allowed: true
      },
      {
        command_ref: "tool:local-json-example-artifacts:write",
        command:
          "npm run tool:local-json-example-artifacts:write -- --request-output <path> --response-output <path> --summary-output <path>",
        purpose: "Write schema-aware example artifacts to explicitly provided local paths.",
        output_contract_ref: "schema-aware-local-json-fixture-example-artifacts/v1",
        file_read_allowed: true,
        file_write_allowed: true
      },
      {
        command_ref: "tool:local-json-agent-handoff-bundle:write",
        command:
          "npm run tool:local-json-agent-handoff-bundle:write -- --manifest-output <path> --schema-output <path> --request-output <path> --response-output <path> --examples-summary-output <path> --bundle-summary-output <path>",
        purpose:
          "Write manifest, schema, request example, response summary example, examples summary, and bundle summary artifacts to explicitly provided local paths.",
        output_contract_ref: "local-json-agent-handoff-bundle/v1",
        file_read_allowed: true,
        file_write_allowed: true
      },
      {
        command_ref: "proof:local-json-agent-handoff-bundle-round-trip:verify",
        command: "npm run proof:local-json-agent-handoff-bundle-round-trip:verify",
        purpose:
          "Verify a materialized handoff bundle request example round-trips through the bounded local JSON runner.",
        output_contract_ref: "local-json-agent-handoff-bundle-round-trip-proof/v1",
        file_read_allowed: true,
        file_write_allowed: true
      },
      {
        command_ref: "proof:local-json-example-artifact-round-trip:verify",
        command: "npm run proof:local-json-example-artifact-round-trip:verify",
        purpose:
          "Verify materialized request examples round-trip through the bounded local JSON runner.",
        output_contract_ref: "local-json-example-artifact-round-trip-proof/v1",
        file_read_allowed: true,
        file_write_allowed: true
      },
      {
        command_ref: "tool:local-json:run",
        command:
          "npm run tool:local-json:run -- --request <path> --response <path> [--task-signal <text>] [--read-mode <mode>] [--depth <hint>] [--scope-hints <scope:a,scope:b>]",
        purpose: "Run the bounded local JSON request/response path.",
        output_contract_ref: "agent-readable-local-json-response-observation/v1",
        file_read_allowed: true,
        file_write_allowed: true
      }
    ],
    schema_contract_ref: schema.contract_version,
    request_shape_ref: schema.request_contract.shape_ref,
    response_shape_ref: schema.response_contract.shape_ref,
    allowed_request_variation_paths: schema.path_policy.allowed_request_variation_paths,
    denied_request_variation_paths: schema.path_policy.denied_request_variation_paths,
    safe_agent_use_hints: schema.safe_agent_use_hints,
    denied_agent_action_hints: schema.denied_agent_action_hints,
    default_deny_execution_posture: schema.default_deny_execution_posture,
    local_io_policy: {
      reads_only_explicit_request_fixture: true,
      writes_only_explicit_response_fixture: true,
      writes_only_explicit_manifest_artifact_path: true,
      writes_only_explicit_example_artifact_paths: true,
      writes_only_explicit_handoff_bundle_artifact_paths: true,
      arbitrary_source_loading_allowed: false,
      multi_request_runner_implemented: false
    },
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
    notes: [
      "This manifest is tool discovery for AI agents, not an MCP/API runtime.",
      "Commands remain bounded local JSON file-boundary commands.",
      "The manifest does not grant permission, execute contours, call providers, or perform model calls."
    ],
    failure_count: 0,
    failures: []
  };
};

export const writeLocalJsonAgentToolManifestArtifact = ({ manifest_output_path }) => {
  const manifest = readLocalJsonAgentToolManifest();

  writeFileSync(manifest_output_path, stableJson(manifest), "utf8");

  return {
    verification_result: "local_json_agent_tool_manifest_artifact_written",
    manifest_id: manifest.manifest_id,
    manifest_version: manifest.manifest_version,
    output_contract_ref: "local-json-agent-tool-manifest-artifact/v1",
    manifest_output_path,
    manifest_artifact_written: true,
    file_read_performed: true,
    file_write_performed: true,
    child_process_spawned: false,
    runtime_permission_granted: manifest.runtime_permission_granted,
    actual_contour_execution_allowed_now: manifest.actual_contour_execution_allowed_now,
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
    failure_count: manifest.failure_count,
    failures: manifest.failures
  };
};

const isDirectRun = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectRun) {
  try {
    const args = parseArgs(process.argv.slice(2));
    const result =
      "manifest_output_path" in args
        ? writeLocalJsonAgentToolManifestArtifact(args)
        : readLocalJsonAgentToolManifest();

    console.log(stableJson(result));
    process.exit(result.failure_count === 0 ? 0 : 1);
  } catch (error) {
    console.error(
      stableJson({
        verification_result: "local_json_agent_tool_manifest_failed",
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
