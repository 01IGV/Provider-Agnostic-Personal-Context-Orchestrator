#!/usr/bin/env node

import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  writeBoundedRealSourceAdapterContractSampleArtifactSet
} from "./bounded-real-source-adapter-contract-sample-cli.mjs";

const tempDir = mkdtempSync(join(tmpdir(), "bounded-real-source-adapter-contract-sample-"));
const contractOutputPath = join(tempDir, "bounded-real-source-adapter-contract.sample.json");
const indexOutputPath = join(
  tempDir,
  "bounded-real-source-adapter-contract.sample.index.json"
);
const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));

const sampleWriteResult = writeBoundedRealSourceAdapterContractSampleArtifactSet({
  contract_output_path: contractOutputPath,
  index_output_path: indexOutputPath
});
const contractArtifact = readJson(contractOutputPath);
const indexArtifact = readJson(indexOutputPath);
const contract = contractArtifact.contract_json ?? {};
const capability = contract.capability_declaration ?? {};
const materializationContract = contract.materialization_contract ?? {};
const posture = contract.execution_posture ?? {};

const assertions = {
  sample_artifact_set_written:
    sampleWriteResult.verification_result ===
      "bounded_real_source_adapter_contract_sample_artifact_set_written" &&
    sampleWriteResult.output_contract_ref ===
      "bounded-real-source-adapter-contract-sample-artifact-set/v1" &&
    sampleWriteResult.failure_count === 0,
  explicit_paths_used:
    indexArtifact.artifact_paths.contract_output_path === contractOutputPath &&
    indexArtifact.artifact_paths.index_output_path === indexOutputPath &&
    indexArtifact.writes_only_explicit_sample_artifact_paths === true,
  contract_artifact_is_agent_inspectable:
    contractArtifact.output_contract_ref ===
      "bounded-real-source-adapter-contract-sample-artifact/v1" &&
    contractArtifact.intended_consumer === "ai_agent" &&
    contractArtifact.artifact_boundary === "agent_inspectable_contract_sample_artifact" &&
    contractArtifact.agent_inspection_hints.do_not_use_as_live_source_read_permission === true,
  contract_shape_matches_verified_contract:
    contract.contract_version === "bounded-real-source-adapter-contract/v1" &&
    contract.contract_boundary === "contract_only_bounded_real_source_adapter" &&
    contract.intended_consumer === "future_real_source_adapter" &&
    indexArtifact.contract_id === contract.contract_id &&
    indexArtifact.contract_version === contract.contract_version &&
    indexArtifact.contract_boundary === contract.contract_boundary,
  source_catalog_and_receipt_contract_refs_carried:
    contract.source_catalog_ref === "local-v0-source-catalog/v1" &&
    contract.receipt_contract_ref === "local-v0-source-materialization-receipt/v1" &&
    indexArtifact.source_catalog_ref === contract.source_catalog_ref &&
    indexArtifact.receipt_contract_ref === contract.receipt_contract_ref &&
    indexArtifact.artifact_contract_refs.source_catalog === contract.source_catalog_ref &&
    indexArtifact.artifact_contract_refs.source_materialization_receipt ===
      contract.receipt_contract_ref,
  capability_declaration_carried:
    capability.capability_boundary === "declaration_only_bounded_real_source_capability" &&
    capability.supported_scope_ids?.includes("scope:repo-work-context") === true &&
    capability.supported_source_kinds?.includes("repo_work_context_source_candidate") ===
      true &&
    indexArtifact.supported_scope_ids?.join("|") === capability.supported_scope_ids.join("|"),
  materialization_contract_is_not_source_content:
    materializationContract.materialization_boundary ===
      "contract_only_future_real_source_materialization_boundary" &&
    materializationContract.required_receipt_version ===
      "local-v0-source-materialization-receipt/v1" &&
    materializationContract.source_content_included_now === false &&
    materializationContract.selected_source_refs_included_now === false &&
    materializationContract.materialized_source_items_included_now === false &&
    indexArtifact.source_content_included_now === false &&
    indexArtifact.selected_source_refs_included_now === false &&
    indexArtifact.materialized_source_items_included_now === false,
  envelopes_carried:
    typeof contract.provenance_envelope_ref === "string" &&
    typeof contract.permission_envelope_ref === "string" &&
    typeof contract.audit_envelope_ref === "string" &&
    indexArtifact.provenance_envelope_ref === contract.provenance_envelope_ref &&
    indexArtifact.permission_envelope_ref === contract.permission_envelope_ref &&
    indexArtifact.audit_envelope_ref === contract.audit_envelope_ref,
  no_live_reads_or_direct_agent_file_access:
    posture.direct_agent_repo_file_access_allowed_now === false &&
    posture.live_source_read_allowed_now === false &&
    posture.live_source_read_performed === false &&
    posture.arbitrary_file_read_allowed_now === false &&
    posture.user_selected_path_read_allowed_now === false &&
    posture.directory_traversal_allowed_now === false &&
    posture.repo_scanning_allowed_now === false &&
    indexArtifact.direct_agent_repo_file_access_allowed_now === false &&
    indexArtifact.live_source_read_allowed_now === false &&
    indexArtifact.live_source_read_performed === false &&
    indexArtifact.reads_source_files_or_directories === false,
  runtime_surfaces_remain_closed:
    indexArtifact.mcp_server_allowed_now === false &&
    indexArtifact.mcp_tool_resource_registration_allowed_now === false &&
    indexArtifact.api_route_controller_allowed_now === false &&
    indexArtifact.runtime_handler_bound === false &&
    indexArtifact.provider_sdk_call_allowed_now === false &&
    indexArtifact.concrete_persistence_read_allowed_now === false &&
    indexArtifact.concrete_persistence_write_allowed_now === false &&
    indexArtifact.auth_iam_implementation_allowed_now === false &&
    indexArtifact.permission_grant_allowed_now === false &&
    indexArtifact.real_model_call_allowed_now === false &&
    indexArtifact.real_storage_write_allowed_now === false &&
    indexArtifact.runtime_permission_granted === false &&
    indexArtifact.actual_contour_execution_allowed_now === false
};

const failed = Object.entries(assertions)
  .filter(([, passed]) => passed !== true)
  .map(([name]) => name);

const verification = {
  verification_result:
    failed.length === 0
      ? "bounded_real_source_adapter_contract_sample_artifact_verified"
      : "bounded_real_source_adapter_contract_sample_artifact_failed",
  output_contract_ref: sampleWriteResult.output_contract_ref,
  contract_output_path: contractOutputPath,
  index_output_path: indexOutputPath,
  contract_id: contract.contract_id,
  contract_version: contract.contract_version,
  source_catalog_ref: contract.source_catalog_ref,
  receipt_contract_ref: contract.receipt_contract_ref,
  direct_agent_repo_file_access_allowed_now:
    indexArtifact.direct_agent_repo_file_access_allowed_now,
  live_source_read_allowed_now: indexArtifact.live_source_read_allowed_now,
  live_source_read_performed: indexArtifact.live_source_read_performed,
  runtime_permission_granted: indexArtifact.runtime_permission_granted,
  actual_contour_execution_allowed_now: indexArtifact.actual_contour_execution_allowed_now,
  failure_count: failed.length,
  failures: failed
};

console.log(JSON.stringify(verification, null, 2));

if (failed.length > 0) {
  process.exit(1);
}
