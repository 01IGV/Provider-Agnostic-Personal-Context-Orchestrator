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
      "tool:local-json-agent-handoff-bundle:consume",
      "tool:local-json-agent-request:run",
      "tool:local-json-agent-request-runner-sample:write",
      "tool:local-json-agent-local-v0-tool-pack:write",
      "tool:local-v0-source-catalog-guided:run",
      "tool:local-v0-source-catalog-guided-sample:write",
      "tool:local-v0-repo-work-context-guided-sample:write",
      "tool:bounded-real-source-adapter-contract-sample:write",
      "tool:local-real-source-adapter-v0:run",
      "tool:local-real-source-agent-request-runner-v0:run",
      "tool:local-real-source-single-command-agent-tool-v0:run",
      "tool:local-real-source-single-command-sample:write",
      "tool:local-real-source-tool-pack:write",
      "proof:local-real-source-tool-pack-acceptance:verify",
      "tool:local-real-source-tool-pack:consume",
      "tool:local-real-source-tool-pack:index-consume",
      "tool:local-real-source-tool-pack:run-consume-v0",
      "tool:local-real-source-tool-pack-run-consume-sample:write",
      "tool:local-real-source-agent-tool-readiness-index:write",
      "proof:local-real-source-agent-tool-readiness-acceptance:verify",
      "tool:local-real-source-agent-tool-entrypoint-v0:run",
      "tool:local-json-agent-local-v0:run",
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
        command_ref: "tool:local-json-agent-handoff-bundle:consume",
        command:
          "npm run tool:local-json-agent-handoff-bundle:consume -- --bundle-summary <path> --manifest <path> --schema <path> --request <path> --expected-response <path> --examples-summary <path> --actual-response <path>",
        purpose:
          "Consume an explicitly provided handoff bundle artifact set through the bounded local JSON runner and write one explicitly provided actual response artifact.",
        output_contract_ref: "local-json-agent-handoff-bundle-consumption/v1",
        file_read_allowed: true,
        file_write_allowed: true
      },
      {
        command_ref: "tool:local-json-agent-request:run",
        command:
          "npm run tool:local-json-agent-request:run -- --request <path> --response <path> --summary <path>",
        purpose:
          "Run one explicitly provided agent request artifact through the bounded local JSON runner and write explicit response and run summary artifacts.",
        output_contract_ref: "local-json-agent-request-run-summary/v1",
        file_read_allowed: true,
        file_write_allowed: true
      },
      {
        command_ref: "tool:local-json-agent-request-runner-sample:write",
        command:
          "npm run tool:local-json-agent-request-runner-sample:write -- --request-output <path> --response-output <path> --summary-output <path> --index-output <path>",
        purpose:
          "Write a deterministic sample request, response, run summary, and sample index artifact set for the direct local JSON agent request runner.",
        output_contract_ref: "local-json-agent-request-runner-sample-artifact-set/v1",
        file_read_allowed: true,
        file_write_allowed: true
      },
      {
        command_ref: "tool:local-json-agent-local-v0-tool-pack:write",
        command:
          "npm run tool:local-json-agent-local-v0-tool-pack:write -- --manifest-output <path> --schema-output <path> --source-catalog-output <path> --sample-request-output <path> --sample-response-output <path> --sample-summary-output <path> --sample-index-output <path> --tool-pack-index-output <path>",
        purpose:
          "Write a complete local v0 tool-pack artifact set, including the allowlisted source catalog, for AI-agent inspection.",
        output_contract_ref: "local-json-agent-local-v0-tool-pack-artifact-set/v1",
        file_read_allowed: true,
        file_write_allowed: true
      },
      {
        command_ref: "tool:local-json-agent-local-v0:run",
        command:
          "npm run tool:local-json-agent-local-v0:run -- --request <path> --response <path> --summary <path> [--task-signal <text>] [--read-mode <mode>] [--depth <hint>] [--scope-hints <scope:a,scope:b>]",
        purpose:
          "Author one constrained local v0 agent request artifact, run it through the bounded local JSON agent request runner, and write explicit response and summary artifacts.",
        output_contract_ref: "local-json-agent-local-v0-single-command-run/v1",
        file_read_allowed: true,
        file_write_allowed: true
      },
      {
        command_ref: "tool:local-v0-source-catalog-guided:run",
        command:
          "npm run tool:local-v0-source-catalog-guided:run -- --tool-pack-index <path> --request <path> --response <path> --summary <path> [--scope-hint <scope:id>] [--task-signal <text>] [--read-mode <mode>] [--depth <hint>]",
        purpose:
          "Run one catalog-guided local v0 request from an explicit tool-pack index path and write explicit request, response, and summary artifacts.",
        output_contract_ref: "local-v0-source-catalog-guided-command/v1",
        file_read_allowed: true,
        file_write_allowed: true
      },
      {
        command_ref: "tool:local-v0-source-catalog-guided-sample:write",
        command:
          "npm run tool:local-v0-source-catalog-guided-sample:write -- --manifest-output <path> --schema-output <path> --source-catalog-output <path> --tool-pack-sample-request-output <path> --tool-pack-sample-response-output <path> --tool-pack-sample-summary-output <path> --tool-pack-sample-index-output <path> --tool-pack-index-output <path> --guided-request-output <path> --guided-response-output <path> --guided-summary-output <path> --guided-index-output <path>",
        purpose:
          "Write a complete source-catalog-guided local v0 command sample artifact set for AI-agent inspection.",
        output_contract_ref: "local-v0-source-catalog-guided-command-sample-artifact-set/v1",
        file_read_allowed: true,
        file_write_allowed: true
      },
      {
        command_ref: "tool:local-v0-repo-work-context-guided-sample:write",
        command:
          "npm run tool:local-v0-repo-work-context-guided-sample:write -- --manifest-output <path> --schema-output <path> --source-catalog-output <path> --tool-pack-sample-request-output <path> --tool-pack-sample-response-output <path> --tool-pack-sample-summary-output <path> --tool-pack-sample-index-output <path> --tool-pack-index-output <path> --guided-request-output <path> --guided-response-output <path> --guided-summary-output <path> --guided-index-output <path>",
        purpose:
          "Write a complete repo-work-context guided local v0 sample artifact set for AI-agent inspection without direct repo file access.",
        output_contract_ref: "local-v0-repo-work-context-guided-sample-artifact-set/v1",
        file_read_allowed: true,
        file_write_allowed: true
      },
      {
        command_ref: "tool:bounded-real-source-adapter-contract-sample:write",
        command:
          "npm run tool:bounded-real-source-adapter-contract-sample:write -- --contract-output <path> --index-output <path>",
        purpose:
          "Write a deterministic bounded real-source adapter contract sample artifact and index for AI-agent inspection before live source reads exist.",
        output_contract_ref: "bounded-real-source-adapter-contract-sample-artifact-set/v1",
        file_read_allowed: false,
        file_write_allowed: true
      },
      {
        command_ref: "tool:local-real-source-adapter-v0:run",
        command:
          "npm run tool:local-real-source-adapter-v0:run -- --response-output <path> --summary-output <path> --index-output <path> [--source-ref <repo-file://...>]",
        purpose:
          "Read only narrow allowlisted repo-work context refs through the local real-source boundary and write bounded context response, summary, and index artifacts for AI-agent inspection.",
        output_contract_ref: "local-real-source-adapter-v0-artifact-set/v1",
        file_read_allowed: true,
        file_write_allowed: true
      },
      {
        command_ref: "tool:local-real-source-agent-request-runner-v0:run",
        command:
          "npm run tool:local-real-source-agent-request-runner-v0:run -- --request <path> --response-output <path> --summary-output <path> --index-output <path>",
        purpose:
          "Run one explicit AI-agent request artifact through the bounded local real-source adapter v0 for repo-work context and write response, summary, and index artifacts.",
        output_contract_ref: "local-real-source-agent-request-runner-v0-summary/v1",
        file_read_allowed: true,
        file_write_allowed: true
      },
      {
        command_ref: "tool:local-real-source-single-command-agent-tool-v0:run",
        command:
          "npm run tool:local-real-source-single-command-agent-tool-v0:run -- --request-output <path> --response-output <path> --summary-output <path> --index-output <path> [--task-signal <text>] [--read-mode <mode>] [--depth <hint>]",
        purpose:
          "Author one constrained repo-work context request and run it through the bounded local real-source agent request runner v0 in a single command.",
        output_contract_ref: "local-real-source-single-command-agent-tool-v0-summary/v1",
        file_read_allowed: true,
        file_write_allowed: true
      },
      {
        command_ref: "tool:local-real-source-single-command-sample:write",
        command:
          "npm run tool:local-real-source-single-command-sample:write -- --request-output <path> --response-output <path> --summary-output <path> --index-output <path> --sample-index-output <path>",
        purpose:
          "Write a deterministic sample artifact set for the local real-source single-command agent tool v0.",
        output_contract_ref: "local-real-source-single-command-sample-artifact-set/v1",
        file_read_allowed: true,
        file_write_allowed: true
      },
      {
        command_ref: "tool:local-real-source-tool-pack:write",
        command:
          "npm run tool:local-real-source-tool-pack:write -- --manifest-output <path> --request-output <path> --response-output <path> --summary-output <path> --index-output <path> --sample-index-output <path> --tool-pack-index-output <path>",
        purpose:
          "Write a local real-source tool-pack artifact set that packages the manifest and single-command sample artifacts behind one top-level index for AI-agent inspection.",
        output_contract_ref: "local-real-source-tool-pack-artifact-set/v1",
        file_read_allowed: true,
        file_write_allowed: true
      },
      {
        command_ref: "proof:local-real-source-tool-pack-acceptance:verify",
        command: "npm run proof:local-real-source-tool-pack-acceptance:verify",
        purpose:
          "Verify an AI agent can start from the local real-source tool-pack index and validate the bounded real-source usage path without direct repo file access.",
        output_contract_ref: "local-real-source-tool-pack-acceptance-proof/v1",
        file_read_allowed: true,
        file_write_allowed: true
      },
      {
        command_ref: "tool:local-real-source-tool-pack:consume",
        command:
          "npm run tool:local-real-source-tool-pack:consume -- --tool-pack-index <path> --manifest <path> --request <path> --response <path> --summary <path> --index <path> --sample-index <path> --consumption-summary-output <path>",
        purpose:
          "Consume an explicitly provided local real-source tool-pack artifact set and write one bounded consumption summary artifact.",
        output_contract_ref: "local-real-source-tool-pack-consumption/v1",
        file_read_allowed: true,
        file_write_allowed: true
      },
      {
        command_ref: "tool:local-real-source-tool-pack:index-consume",
        command:
          "npm run tool:local-real-source-tool-pack:index-consume -- --tool-pack-index <path> --consumption-summary-output <path>",
        purpose:
          "Consume a local real-source tool-pack from one explicit top-level index path and write one bounded consumption summary artifact.",
        output_contract_ref: "local-real-source-tool-pack-index-consumption/v1",
        file_read_allowed: true,
        file_write_allowed: true
      },
      {
        command_ref: "tool:local-real-source-tool-pack:run-consume-v0",
        command:
          "npm run tool:local-real-source-tool-pack:run-consume-v0 -- --manifest-output <path> --request-output <path> --response-output <path> --summary-output <path> --index-output <path> --sample-index-output <path> --tool-pack-index-output <path> --consumption-summary-output <path>",
        purpose:
          "Run one local real-source tool-pack flow: write bounded tool-pack artifacts, consume them from the top-level index, and write one consumption summary.",
        output_contract_ref: "local-real-source-tool-pack-single-command-consumption-v0/v1",
        file_read_allowed: true,
        file_write_allowed: true
      },
      {
        command_ref: "tool:local-real-source-tool-pack-run-consume-sample:write",
        command:
          "npm run tool:local-real-source-tool-pack-run-consume-sample:write -- --manifest-output <path> --request-output <path> --response-output <path> --summary-output <path> --index-output <path> --sample-index-output <path> --tool-pack-index-output <path> --consumption-summary-output <path> --run-consumption-index-output <path>",
        purpose:
          "Write a sample artifact set for the local real-source tool-pack single-command consumption flow.",
        output_contract_ref:
          "local-real-source-tool-pack-single-command-consumption-sample-artifact-set/v1",
        file_read_allowed: true,
        file_write_allowed: true
      },
      {
        command_ref: "tool:local-real-source-agent-tool-readiness-index:write",
        command:
          "npm run tool:local-real-source-agent-tool-readiness-index:write -- --manifest-output <path> --request-output <path> --response-output <path> --summary-output <path> --index-output <path> --sample-index-output <path> --tool-pack-index-output <path> --consumption-summary-output <path> --run-consumption-index-output <path> --readiness-index-output <path>",
        purpose:
          "Write the top-level local real-source agent tool readiness index for AI-agent discovery.",
        output_contract_ref: "local-real-source-agent-tool-readiness-index/v1",
        file_read_allowed: true,
        file_write_allowed: true
      },
      {
        command_ref: "proof:local-real-source-agent-tool-readiness-acceptance:verify",
        command: "npm run proof:local-real-source-agent-tool-readiness-acceptance:verify",
        purpose:
          "Verify an AI agent can start from the local real-source agent tool readiness index and validate the tool path without direct repo file access.",
        output_contract_ref: "local-real-source-agent-tool-readiness-acceptance-proof/v1",
        file_read_allowed: true,
        file_write_allowed: true
      },
      {
        command_ref: "tool:local-real-source-agent-tool-entrypoint-v0:run",
        command:
          "npm run tool:local-real-source-agent-tool-entrypoint-v0:run -- --artifact-dir <path>",
        purpose:
          "Run the local real-source agent tool entrypoint from one explicit artifact directory and write fixed agent-discovery artifacts.",
        output_contract_ref: "local-real-source-agent-tool-entrypoint-v0/v1",
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
      writes_only_explicit_handoff_bundle_consumption_output_path: true,
      writes_only_explicit_agent_request_run_output_paths: true,
      writes_only_explicit_agent_request_runner_sample_artifact_paths: true,
      writes_only_explicit_local_v0_tool_pack_artifact_paths: true,
      writes_only_explicit_local_v0_single_command_paths: true,
      writes_only_explicit_local_v0_guided_sample_artifact_paths: true,
      writes_only_explicit_local_v0_repo_work_guided_sample_artifact_paths: true,
      writes_only_explicit_bounded_real_source_adapter_contract_sample_paths: true,
      writes_only_explicit_local_real_source_adapter_v0_paths: true,
      writes_only_explicit_local_real_source_agent_request_runner_v0_paths: true,
      writes_only_explicit_local_real_source_single_command_agent_tool_v0_paths: true,
      writes_only_explicit_local_real_source_single_command_sample_artifact_paths: true,
      writes_only_explicit_local_real_source_tool_pack_artifact_paths: true,
      writes_only_explicit_local_real_source_tool_pack_consumption_summary_path: true,
      writes_only_explicit_local_real_source_tool_pack_index_consumption_summary_path: true,
      writes_only_explicit_local_real_source_tool_pack_single_command_consumption_paths: true,
      writes_only_explicit_local_real_source_tool_pack_single_command_consumption_sample_paths: true,
      writes_only_explicit_local_real_source_agent_tool_readiness_index_paths: true,
      reads_only_narrow_local_real_source_boundary_refs: true,
      reads_only_explicit_request_and_narrow_real_source_refs: true,
      reads_only_authored_request_and_narrow_real_source_refs: true,
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
