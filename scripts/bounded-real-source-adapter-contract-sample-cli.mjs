#!/usr/bin/env node

import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import {
  createDeterministicBoundedRealSourceAdapterContract
} from "../packages/system-assembly/dist/index.js";

const stableJson = (value) => `${JSON.stringify(value, null, 2)}\n`;
const usage =
  "Usage: node scripts/bounded-real-source-adapter-contract-sample-cli.mjs --contract-output <path> --index-output <path>";

const requiredArgs = ["contract-output", "index-output"];

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

  return {
    contract_output_path: resolve(args.get("contract-output")),
    index_output_path: resolve(args.get("index-output"))
  };
};

export const writeBoundedRealSourceAdapterContractSampleArtifactSet = ({
  contract_output_path,
  index_output_path
}) => {
  const result = createDeterministicBoundedRealSourceAdapterContract();
  const { request, bounded_real_source_adapter_contract: contract } = result;
  const capability = contract.capability_declaration;
  const materializationContract = contract.materialization_contract;
  const posture = contract.execution_posture;
  const contractArtifact = {
    verification_result: "bounded_real_source_adapter_contract_sample_artifact_ready",
    output_contract_ref: "bounded-real-source-adapter-contract-sample-artifact/v1",
    intended_consumer: "ai_agent",
    artifact_boundary: "agent_inspectable_contract_sample_artifact",
    contract_json: contract,
    agent_inspection_hints: {
      inspect_contract_boundary: contract.contract_boundary,
      inspect_source_catalog_ref: contract.source_catalog_ref,
      inspect_receipt_contract_ref: contract.receipt_contract_ref,
      inspect_supported_scope_ids: capability.supported_scope_ids,
      inspect_default_deny_posture: true,
      do_not_use_as_live_source_read_permission: true
    },
    file_read_performed: false,
    file_write_performed: true,
    live_source_read_performed: posture.live_source_read_performed,
    direct_agent_repo_file_access_allowed_now:
      posture.direct_agent_repo_file_access_allowed_now,
    runtime_permission_granted: posture.runtime_permission_granted,
    actual_contour_execution_allowed_now: posture.actual_contour_execution_allowed_now,
    failure_count: 0,
    failures: []
  };
  const indexArtifact = {
    verification_result: "bounded_real_source_adapter_contract_sample_artifact_set_written",
    output_contract_ref: "bounded-real-source-adapter-contract-sample-artifact-set/v1",
    intended_consumer: "ai_agent",
    sample_command:
      "npm run tool:bounded-real-source-adapter-contract-sample:write -- --contract-output <path> --index-output <path>",
    artifact_paths: {
      contract_output_path,
      index_output_path
    },
    artifact_contract_refs: {
      bounded_real_source_adapter_contract: contract.contract_version,
      contract_sample_artifact: contractArtifact.output_contract_ref,
      source_catalog: contract.source_catalog_ref,
      source_materialization_receipt: contract.receipt_contract_ref
    },
    agent_context_request_id: request.agent_context_request_id,
    contract_id: contract.contract_id,
    contract_version: contract.contract_version,
    contract_boundary: contract.contract_boundary,
    materialization_boundary: materializationContract.materialization_boundary,
    adapter_ref: capability.adapter_ref,
    supported_scope_ids: capability.supported_scope_ids,
    supported_source_kinds: capability.supported_source_kinds,
    source_catalog_ref: contract.source_catalog_ref,
    receipt_contract_ref: contract.receipt_contract_ref,
    provenance_envelope_ref: contract.provenance_envelope_ref,
    permission_envelope_ref: contract.permission_envelope_ref,
    audit_envelope_ref: contract.audit_envelope_ref,
    source_content_included_now: materializationContract.source_content_included_now,
    selected_source_refs_included_now:
      materializationContract.selected_source_refs_included_now,
    materialized_source_items_included_now:
      materializationContract.materialized_source_items_included_now,
    writes_only_explicit_sample_artifact_paths: true,
    reads_source_files_or_directories: false,
    file_read_performed: false,
    file_write_performed: true,
    direct_agent_repo_file_access_allowed_now:
      posture.direct_agent_repo_file_access_allowed_now,
    live_source_read_allowed_now: posture.live_source_read_allowed_now,
    live_source_read_performed: posture.live_source_read_performed,
    arbitrary_file_read_allowed_now: posture.arbitrary_file_read_allowed_now,
    user_selected_path_read_allowed_now: posture.user_selected_path_read_allowed_now,
    directory_traversal_allowed_now: posture.directory_traversal_allowed_now,
    repo_scanning_allowed_now: posture.repo_scanning_allowed_now,
    git_command_execution_allowed_now: posture.git_command_execution_allowed_now,
    mcp_server_allowed_now: posture.mcp_server_allowed_now,
    mcp_tool_resource_registration_allowed_now:
      posture.mcp_tool_resource_registration_allowed_now,
    api_route_controller_allowed_now: posture.api_route_controller_allowed_now,
    runtime_handler_bound: posture.runtime_handler_bound,
    provider_sdk_call_allowed_now: posture.provider_sdk_call_allowed_now,
    concrete_persistence_read_allowed_now:
      posture.concrete_persistence_read_allowed_now,
    concrete_persistence_write_allowed_now:
      posture.concrete_persistence_write_allowed_now,
    auth_iam_implementation_allowed_now: posture.auth_iam_implementation_allowed_now,
    permission_grant_allowed_now: posture.permission_grant_allowed_now,
    real_model_call_allowed_now: posture.real_model_call_allowed_now,
    real_storage_write_allowed_now: posture.real_storage_write_allowed_now,
    runtime_permission_granted: posture.runtime_permission_granted,
    actual_contour_execution_allowed_now: posture.actual_contour_execution_allowed_now,
    failure_count: 0,
    failures: []
  };

  writeFileSync(contract_output_path, stableJson(contractArtifact), "utf8");
  writeFileSync(index_output_path, stableJson(indexArtifact), "utf8");

  return indexArtifact;
};

const isDirectRun = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectRun) {
  try {
    const result = writeBoundedRealSourceAdapterContractSampleArtifactSet(
      parseArgs(process.argv.slice(2))
    );

    console.log(stableJson(result));
    process.exit(result.failure_count === 0 ? 0 : 1);
  } catch (error) {
    console.error(
      stableJson({
        verification_result:
          "bounded_real_source_adapter_contract_sample_artifact_set_failed",
        message: error instanceof Error ? error.message : String(error),
        file_read_performed: false,
        file_write_performed: false,
        live_source_read_performed: false,
        runtime_permission_granted: false,
        actual_contour_execution_allowed_now: false,
        failure_count: 1
      })
    );
    process.exit(1);
  }
}
