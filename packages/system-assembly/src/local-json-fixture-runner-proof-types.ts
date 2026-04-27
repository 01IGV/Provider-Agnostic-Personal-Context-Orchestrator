import type { IsoDateTimeString } from "@orchestrator/core-foundation";
import type { LocalJsonRequestResponseRunnerShapeResult } from "./local-json-request-response-runner-shape-types.js";

export type LocalJsonFixtureRunnerProofContractVersion = "local-json-fixture-runner-proof/v1";

export type LocalJsonFixtureRunnerProofResult = "local_json_fixture_runner_default_deny_proven";

export type LocalJsonFixtureRunnerProofBoundary =
  "machine_checkable_local_json_fixture_runner_proof_only";

export type LocalJsonFixtureRunnerProofFailureCode =
  | "json_round_trip_failed"
  | "runner_request_id_mismatch"
  | "runner_response_id_mismatch"
  | "agent_context_request_id_mismatch"
  | "bounded_context_response_id_mismatch"
  | "bounded_context_package_id_mismatch"
  | "protocol_adapter_shape_id_mismatch"
  | "verification_result_mismatch"
  | "provenance_envelope_missing"
  | "permission_envelope_missing"
  | "audit_envelope_missing"
  | "runner_not_local_json_only"
  | "runner_not_deterministic"
  | "runner_not_fixture_driven"
  | "runner_not_shape_only"
  | "mcp_server_implemented_not_false"
  | "mcp_tool_registered_not_false"
  | "mcp_resource_registered_not_false"
  | "api_route_registered_not_false"
  | "api_controller_registered_not_false"
  | "runtime_handler_bound_not_false"
  | "network_access_allowed"
  | "provider_sdk_call_allowed"
  | "transport_execution_allowed"
  | "concrete_persistence_read_allowed"
  | "concrete_persistence_write_allowed"
  | "real_model_call_allowed"
  | "real_storage_write_allowed"
  | "runtime_permission_granted_not_false"
  | "actual_contour_execution_allowed"
  | "file_io_performed_not_false"
  | "cli_execution_performed_not_false"
  | "process_execution_performed_not_false";

export interface LocalJsonFixtureRunnerProofFailureShape {
  code: LocalJsonFixtureRunnerProofFailureCode;
  path: string;
  expected: true | false | string;
  actual: unknown;
  message: string;
}

export interface LocalJsonFixtureRunnerProofRoundTripAssertionsShape {
  json_serializable: boolean;
  runner_request_id_preserved: boolean;
  runner_response_id_preserved: boolean;
  protocol_adapter_shape_id_preserved: boolean;
}

export interface LocalJsonFixtureRunnerProofRefAssertionsShape {
  agent_context_request_id: string;
  bounded_context_response_id: string;
  bounded_context_package_id: string;
  protocol_adapter_shape_id: string;
  verification_result: "agent_consumable_response_contract_verified";
  provenance_envelope_ref: string;
  permission_envelope_ref: string;
  audit_envelope_ref: string;
}

export interface LocalJsonFixtureRunnerProofDenialAssertionsShape {
  local_json_only: true;
  deterministic: true;
  fixture_driven: true;
  runner_shape_only: true;
  mcp_server_implemented: false;
  mcp_tool_registered: false;
  mcp_resource_registered: false;
  api_route_registered: false;
  api_controller_registered: false;
  runtime_handler_bound: false;
  network_access_allowed_now: false;
  provider_sdk_call_allowed_now: false;
  transport_execution_allowed_now: false;
  concrete_persistence_read_allowed_now: false;
  concrete_persistence_write_allowed_now: false;
  real_model_call_allowed_now: false;
  real_storage_write_allowed_now: false;
  runtime_permission_granted: false;
  actual_contour_execution_allowed_now: false;
  file_io_performed: false;
  cli_execution_performed: false;
  process_execution_performed: false;
}

export interface LocalJsonFixtureRunnerProofSummaryShape {
  contract_version: LocalJsonFixtureRunnerProofContractVersion;
  proof_id: string;
  proof_result: LocalJsonFixtureRunnerProofResult;
  proof_boundary: LocalJsonFixtureRunnerProofBoundary;
  runner_request_id: string;
  runner_response_id: string;
  source_runner_shape_id: string;
  round_trip_assertions: LocalJsonFixtureRunnerProofRoundTripAssertionsShape;
  ref_assertions: LocalJsonFixtureRunnerProofRefAssertionsShape;
  denial_assertions: LocalJsonFixtureRunnerProofDenialAssertionsShape;
  failure_count: number;
  failures: LocalJsonFixtureRunnerProofFailureShape[];
  generated_at: IsoDateTimeString;
}

export interface LocalJsonFixtureRunnerProofInputShape {
  runner_shape: LocalJsonRequestResponseRunnerShapeResult;
  now?: IsoDateTimeString;
}

export interface LocalJsonFixtureRunnerProofBuilder {
  create(input: LocalJsonFixtureRunnerProofInputShape): LocalJsonFixtureRunnerProofSummaryShape;
  findFailures(input: LocalJsonFixtureRunnerProofSummaryShape): LocalJsonFixtureRunnerProofFailureShape[];
  assertDefaultDeny(input: LocalJsonFixtureRunnerProofSummaryShape): true;
}

export type LocalJsonFixtureRunnerProofVerificationResult =
  | "local_json_fixture_runner_proof_verified"
  | "local_json_fixture_runner_proof_failed";

export interface LocalJsonFixtureRunnerProofVerificationSummaryShape {
  verification_result: LocalJsonFixtureRunnerProofVerificationResult;
  contract_version: LocalJsonFixtureRunnerProofContractVersion;
  proof_id: string;
  runner_request_id: string;
  runner_response_id: string;
  bounded_context_response_id: string;
  bounded_context_package_id: string;
  protocol_adapter_shape_id: string;
  local_json_only: true;
  deterministic: true;
  fixture_driven: true;
  runtime_permission_granted: false;
  actual_contour_execution_allowed_now: false;
  file_io_performed: false;
  cli_execution_performed: false;
  process_execution_performed: false;
  failure_count: number;
  failures: string[];
}
