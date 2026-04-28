#!/usr/bin/env node

import {
  createDeterministicLocalContextSourceAdapterContracts
} from "../packages/system-assembly/dist/index.js";

const result = createDeterministicLocalContextSourceAdapterContracts();
const { request, adapter_result: adapterResult, response } = result;
const payload = response.response_payload;
const localSourcePosture = payload.local_source_execution_posture ?? {};
const packageEnvelope = payload.bounded_context_package ?? {};
const packagePosture = packageEnvelope.execution_posture ?? {};
const sourceMaterializationReceipt = payload.source_materialization_receipt ?? {};
const sourceMaterializationReceiptPosture = sourceMaterializationReceipt.execution_posture ?? {};

const assertions = {
  request_contract_only: request.contract_only === true,
  adapter_contract_only: adapterResult.execution_posture.contract_only === true,
  adapter_local_only: adapterResult.execution_posture.local_only === true,
  adapter_deterministic: adapterResult.execution_posture.deterministic === true,
  adapter_ready: adapterResult.adapter_status === "local_context_source_ready",
  materialization_boundary_contract_only:
    adapterResult.materialization_boundary === "contract_only_local_deterministic_context_materialization",
  response_ready: response.response_status === "bounded_context_ready",
  response_materialized_from_local_deterministic_source:
    payload.bounded_context_materialized_from_local_deterministic_source === true,
  bounded_context_package_present:
    packageEnvelope.package_version === "bounded-context-package-envelope/v1" &&
    packageEnvelope.package_boundary === "contract_only_bounded_context_package",
  bounded_context_package_ref_matches:
    response.bounded_context_package_ref === packageEnvelope.bounded_context_package_id,
  bounded_context_package_item_count_matches:
    packageEnvelope.source_item_count === adapterResult.source_items.length &&
    packageEnvelope.package_items?.length === adapterResult.source_items.length,
  bounded_context_package_items_are_refs:
    packageEnvelope.package_items?.every(
      (item) =>
        typeof item.package_item_id === "string" &&
        typeof item.source_item_id === "string" &&
        typeof item.content_digest === "string" &&
        typeof item.provenance_ref === "string" &&
        typeof item.permission_ref === "string" &&
        typeof item.audit_ref === "string" &&
        item.content === undefined
    ) === true,
  bounded_context_package_envelopes_carried:
    packageEnvelope.provenance_envelope_ref === adapterResult.provenance_envelope_ref &&
    packageEnvelope.permission_envelope_ref === adapterResult.permission_envelope_ref &&
    packageEnvelope.audit_envelope_ref === adapterResult.audit_envelope_ref,
  source_materialization_receipt_present:
    sourceMaterializationReceipt.receipt_version ===
      "local-v0-source-materialization-receipt/v1" &&
    sourceMaterializationReceipt.agent_context_request_id === request.agent_context_request_id &&
    sourceMaterializationReceipt.adapter_result_id === adapterResult.adapter_result_id &&
    sourceMaterializationReceipt.source_catalog_ref === "local-v0-source-catalog/v1" &&
    sourceMaterializationReceipt.materialization_boundary === adapterResult.materialization_boundary,
  source_materialization_receipt_scope_and_source_refs_match:
    sourceMaterializationReceipt.requested_scope_ids?.join("|") ===
      request.intent.requested_scope_hints.join("|") &&
    sourceMaterializationReceipt.selected_scope_ids?.join("|") ===
      adapterResult.source_items.map((item) => item.scope_id).join("|") &&
    sourceMaterializationReceipt.selected_source_refs?.join("|") ===
      adapterResult.source_items.map((item) => item.source_ref).join("|") &&
    sourceMaterializationReceipt.selected_source_item_count === adapterResult.source_items.length,
  source_materialization_receipt_items_are_refs:
    sourceMaterializationReceipt.receipt_items?.length === adapterResult.source_items.length &&
    sourceMaterializationReceipt.receipt_items?.every(
      (item) =>
        typeof item.receipt_item_id === "string" &&
        typeof item.source_item_id === "string" &&
        typeof item.scope_id === "string" &&
        typeof item.source_ref === "string" &&
        typeof item.content_digest === "string" &&
        typeof item.provenance_ref === "string" &&
        typeof item.permission_ref === "string" &&
        typeof item.audit_ref === "string" &&
        item.content === undefined
    ) === true,
  source_materialization_receipt_envelopes_carried:
    sourceMaterializationReceipt.provenance_envelope_ref ===
      adapterResult.provenance_envelope_ref &&
    sourceMaterializationReceipt.permission_envelope_ref ===
      adapterResult.permission_envelope_ref &&
    sourceMaterializationReceipt.audit_envelope_ref === adapterResult.audit_envelope_ref,
  source_item_count_matches:
    payload.source_item_count === adapterResult.source_items.length && adapterResult.source_items.length > 0,
  source_items_are_deterministically_ordered: adapterResult.source_items.every(
    (item, index, items) => index === 0 || items[index - 1].deterministic_order < item.deterministic_order
  ),
  provenance_envelope_carried:
    response.provenance_envelope_ref === adapterResult.provenance_envelope_ref,
  permission_envelope_carried:
    response.permission_envelope_ref === adapterResult.permission_envelope_ref,
  audit_envelope_carried:
    response.audit_envelope_ref === adapterResult.audit_envelope_ref,
  permission_grant_issued: request.authority.permission_grant_issued === false,
  runtime_permission_granted: request.authority.runtime_permission_granted === false,
  mcp_route_permission_granted: request.authority.mcp_route_permission_granted === false,
  api_route_permission_granted: request.authority.api_route_permission_granted === false,
  network_access_allowed_now: adapterResult.execution_posture.network_access_allowed_now === false,
  provider_sdk_call_allowed_now: adapterResult.execution_posture.provider_sdk_call_allowed_now === false,
  transport_execution_allowed_now: adapterResult.execution_posture.transport_execution_allowed_now === false,
  concrete_persistence_read_allowed_now:
    adapterResult.execution_posture.concrete_persistence_read_allowed_now === false,
  concrete_persistence_write_allowed_now:
    adapterResult.execution_posture.concrete_persistence_write_allowed_now === false,
  real_model_call_allowed_now: adapterResult.execution_posture.real_model_call_allowed_now === false,
  real_storage_write_allowed_now: adapterResult.execution_posture.real_storage_write_allowed_now === false,
  runtime_handler_bound: adapterResult.execution_posture.runtime_handler_bound === false,
  actual_contour_execution_allowed_now:
    adapterResult.execution_posture.actual_contour_execution_allowed_now === false,
  payload_local_posture_non_executing:
    localSourcePosture.network_access_allowed_now === false &&
    localSourcePosture.provider_sdk_call_allowed_now === false &&
    localSourcePosture.concrete_persistence_write_allowed_now === false &&
    localSourcePosture.real_model_call_allowed_now === false &&
    localSourcePosture.real_storage_write_allowed_now === false &&
    localSourcePosture.actual_contour_execution_allowed_now === false,
  bounded_context_package_posture_non_executing:
    packagePosture.contract_only === true &&
    packagePosture.deterministic === true &&
    packagePosture.local_only === true &&
    packagePosture.canonical_persistence_read_performed === false &&
    packagePosture.provider_response_included === false &&
    packagePosture.model_output_included === false &&
    packagePosture.storage_content_included === false &&
    packagePosture.contour_execution_result_included === false &&
    packagePosture.runtime_permission_granted === false &&
    packagePosture.actual_contour_execution_allowed_now === false,
  source_materialization_receipt_posture_non_executing:
    sourceMaterializationReceiptPosture.contract_only === true &&
    sourceMaterializationReceiptPosture.deterministic === true &&
    sourceMaterializationReceiptPosture.local_only === true &&
    sourceMaterializationReceiptPosture.allowlisted_source_catalog === true &&
    sourceMaterializationReceiptPosture.direct_agent_repo_file_access_allowed_now === false &&
    sourceMaterializationReceiptPosture.live_source_read_performed === false &&
    sourceMaterializationReceiptPosture.arbitrary_file_read_allowed_now === false &&
    sourceMaterializationReceiptPosture.user_selected_path_read_allowed_now === false &&
    sourceMaterializationReceiptPosture.directory_traversal_allowed_now === false &&
    sourceMaterializationReceiptPosture.runtime_permission_granted === false &&
    sourceMaterializationReceiptPosture.actual_contour_execution_allowed_now === false
};

const failed = Object.entries(assertions)
  .filter(([, passed]) => passed !== true)
  .map(([name]) => name);

const verification = {
  verification_result:
    failed.length === 0
      ? "local_deterministic_context_source_adapter_verified"
      : "local_deterministic_context_source_adapter_failed",
  request_id: request.agent_context_request_id,
  adapter_result_id: adapterResult.adapter_result_id,
  response_id: response.bounded_context_response_id,
  bounded_context_package_id: packageEnvelope.bounded_context_package_id,
  source_materialization_receipt_id: sourceMaterializationReceipt.receipt_id,
  source_item_count: adapterResult.source_items.length,
  package_item_count: packageEnvelope.package_items?.length ?? 0,
  response_status: response.response_status,
  materialization_boundary: adapterResult.materialization_boundary,
  runtime_permission_granted: request.authority.runtime_permission_granted,
  actual_contour_execution_allowed_now:
    adapterResult.execution_posture.actual_contour_execution_allowed_now,
  failure_count: failed.length,
  failures: failed
};

console.log(JSON.stringify(verification, null, 2));

if (failed.length > 0) {
  process.exit(1);
}
