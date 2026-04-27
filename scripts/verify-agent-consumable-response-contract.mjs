#!/usr/bin/env node

import {
  createDeterministicLocalContextSourceAdapterContracts
} from "../packages/system-assembly/dist/index.js";

const result = createDeterministicLocalContextSourceAdapterContracts();
const { request, adapter_result: adapterResult, response } = result;
const payload = response.response_payload;
const packageEnvelope = payload.bounded_context_package ?? {};
const packageItems = packageEnvelope.package_items ?? [];
const sourceItems = adapterResult.source_items;
const packagePosture = packageEnvelope.execution_posture ?? {};
const responsePosture = response.execution_posture;

const packageItemSourceIds = new Set(packageItems.map((item) => item.source_item_id));
const sourceItemIds = new Set(sourceItems.map((item) => item.source_item_id));

const assertions = {
  response_has_agent_consumable_ids:
    typeof response.bounded_context_response_id === "string" &&
    response.agent_context_request_id === request.agent_context_request_id &&
    typeof response.bounded_context_package_ref === "string" &&
    response.bounded_context_package_ref === packageEnvelope.bounded_context_package_id,
  package_has_agent_consumable_ids:
    typeof packageEnvelope.bounded_context_package_id === "string" &&
    packageEnvelope.agent_context_request_id === request.agent_context_request_id &&
    packageEnvelope.adapter_result_id === adapterResult.adapter_result_id,
  package_items_match_source_items:
    packageItems.length === sourceItems.length &&
    sourceItems.every((item) => packageItemSourceIds.has(item.source_item_id)) &&
    packageItems.every((item) => sourceItemIds.has(item.source_item_id)),
  package_items_are_refs_not_payloads:
    packageItems.every(
      (item) =>
        typeof item.package_item_id === "string" &&
        typeof item.source_item_id === "string" &&
        typeof item.source_ref === "string" &&
        typeof item.content_digest === "string" &&
        item.content === undefined
    ),
  authority_refs_agent_visible:
    request.authority.auth_iam_adjacent === true &&
    request.authority.authority_boundary === true &&
    request.authority.permission_boundary === true &&
    typeof request.authority.authority_boundary_denial_proof_id === "string" &&
    typeof request.authority.permission_scope_ref === "string" &&
    response.authority.authority_boundary_denial_proof_id ===
      request.authority.authority_boundary_denial_proof_id,
  provenance_permission_audit_refs_agent_visible:
    typeof response.provenance_envelope_ref === "string" &&
    typeof response.permission_envelope_ref === "string" &&
    typeof response.audit_envelope_ref === "string" &&
    packageEnvelope.provenance_envelope_ref === response.provenance_envelope_ref &&
    packageEnvelope.permission_envelope_ref === response.permission_envelope_ref &&
    packageEnvelope.audit_envelope_ref === response.audit_envelope_ref,
  response_posture_denies_runtime:
    responsePosture.mcp_server_implemented === false &&
    responsePosture.mcp_tool_registered === false &&
    responsePosture.mcp_resource_registered === false &&
    responsePosture.api_route_registered === false &&
    responsePosture.api_controller_registered === false &&
    responsePosture.runtime_handler_bound === false &&
    responsePosture.provider_sdk_call_allowed_now === false &&
    responsePosture.concrete_persistence_write_allowed_now === false &&
    responsePosture.real_model_call_allowed_now === false &&
    responsePosture.real_storage_write_allowed_now === false &&
    responsePosture.actual_contour_execution_allowed_now === false,
  package_posture_denies_runtime:
    packagePosture.contract_only === true &&
    packagePosture.deterministic === true &&
    packagePosture.local_only === true &&
    packagePosture.canonical_persistence_read_performed === false &&
    packagePosture.provider_response_included === false &&
    packagePosture.model_output_included === false &&
    packagePosture.storage_content_included === false &&
    packagePosture.contour_execution_result_included === false &&
    packagePosture.runtime_permission_granted === false &&
    packagePosture.actual_contour_execution_allowed_now === false
};

const failed = Object.entries(assertions)
  .filter(([, passed]) => passed !== true)
  .map(([name]) => name);

const verification = {
  verification_result:
    failed.length === 0
      ? "agent_consumable_response_contract_verified"
      : "agent_consumable_response_contract_failed",
  request_id: request.agent_context_request_id,
  response_id: response.bounded_context_response_id,
  bounded_context_package_id: packageEnvelope.bounded_context_package_id,
  package_item_count: packageItems.length,
  source_item_count: sourceItems.length,
  authority_boundary_denial_proof_id: request.authority.authority_boundary_denial_proof_id,
  provenance_envelope_ref: response.provenance_envelope_ref,
  permission_envelope_ref: response.permission_envelope_ref,
  audit_envelope_ref: response.audit_envelope_ref,
  runtime_permission_granted: request.authority.runtime_permission_granted,
  actual_contour_execution_allowed_now: packagePosture.actual_contour_execution_allowed_now,
  failure_count: failed.length,
  failures: failed
};

console.log(JSON.stringify(verification, null, 2));

if (failed.length > 0) {
  process.exit(1);
}
