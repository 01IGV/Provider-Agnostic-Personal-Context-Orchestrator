#!/usr/bin/env node

import {
  createDeterministicLocalContextSourceAdapterContracts
} from "../packages/system-assembly/dist/index.js";

const result = createDeterministicLocalContextSourceAdapterContracts();
const { request, adapter_result: adapterResult, response } = result;
const payload = response.response_payload;
const localSourcePosture = payload.local_source_execution_posture ?? {};

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
    localSourcePosture.actual_contour_execution_allowed_now === false
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
  source_item_count: adapterResult.source_items.length,
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
