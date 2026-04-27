import type { CorrelationId, IsoDateTimeString } from "@orchestrator/core-foundation";
import type {
  LocalJsonRequestResponseRunnerResponseEnvelopeShape,
  LocalJsonRequestResponseRunnerSummaryShape
} from "./local-json-request-response-runner-types.js";
import type {
  LocalJsonFixtureRunnerCliBoundaryKind,
  LocalJsonFixtureRunnerCliBoundaryMode,
  LocalJsonFixtureRunnerCliBoundaryStatus
} from "./local-json-fixture-runner-cli-boundary-vocabularies.js";

export interface LocalJsonFixtureRunnerCliBoundaryPathShape {
  path_ref: string;
  media_type: "application/json";
  fixture_role:
    | "agent_context_request_input_fixture"
    | "verified_protocol_surface_adapter_output_fixture";
  local_only: true;
}

export interface LocalJsonFixtureRunnerCliBoundaryExecutionPostureShape {
  cli_boundary: true;
  file_boundary: true;
  contract_only: true;
  deterministic: true;
  local_only: true;
  file_read_performed: false;
  file_write_performed: false;
  cli_process_spawned: false;
  process_execution_performed: false;
  mcp_server_implemented: false;
  mcp_tool_registered: false;
  mcp_resource_registered: false;
  api_route_registered: false;
  api_controller_registered: false;
  runtime_handler_bound: false;
  provider_sdk_call_allowed_now: false;
  transport_execution_allowed_now: false;
  concrete_persistence_read_allowed_now: false;
  concrete_persistence_write_allowed_now: false;
  real_model_call_allowed_now: false;
  real_storage_write_allowed_now: false;
  runtime_permission_granted: false;
  actual_contour_execution_allowed_now: false;
}

export interface LocalJsonFixtureRunnerCliBoundaryRefsShape {
  runner_request_id: string;
  runner_response_id: string;
  bounded_context_response_id: string;
  bounded_context_package_id: string;
  protocol_adapter_shape_id: string;
  local_json_fixture_runner_proof_id: string;
  provenance_envelope_ref: string;
  permission_envelope_ref: string;
  audit_envelope_ref: string;
}

export interface LocalJsonFixtureRunnerCliBoundaryShape {
  cli_boundary_id: string;
  boundary_kind: LocalJsonFixtureRunnerCliBoundaryKind;
  boundary_status: LocalJsonFixtureRunnerCliBoundaryStatus;
  boundary_mode: LocalJsonFixtureRunnerCliBoundaryMode;
  operation_id: "minimal_local_json_fixture_runner_cli_boundary";
  operation_version: "minimal-local-json-fixture-runner-cli-boundary/v1";
  input_fixture: LocalJsonFixtureRunnerCliBoundaryPathShape;
  output_fixture: LocalJsonFixtureRunnerCliBoundaryPathShape;
  refs: LocalJsonFixtureRunnerCliBoundaryRefsShape;
  execution_posture: LocalJsonFixtureRunnerCliBoundaryExecutionPostureShape;
  runner_response: LocalJsonRequestResponseRunnerResponseEnvelopeShape;
  runner_summary: LocalJsonRequestResponseRunnerSummaryShape;
  created_at: IsoDateTimeString;
  correlation_id?: CorrelationId;
  notes: string[];
}

export interface LocalJsonFixtureRunnerCliBoundaryBuilderInputShape {
  cli_boundary_id: string;
  input_fixture: LocalJsonFixtureRunnerCliBoundaryPathShape;
  output_fixture: LocalJsonFixtureRunnerCliBoundaryPathShape;
  refs: LocalJsonFixtureRunnerCliBoundaryRefsShape;
  runner_response: LocalJsonRequestResponseRunnerResponseEnvelopeShape;
  runner_summary: LocalJsonRequestResponseRunnerSummaryShape;
  created_at: IsoDateTimeString;
  correlation_id?: CorrelationId;
  notes?: string[];
}

export interface LocalJsonFixtureRunnerCliBoundarySummaryShape {
  cli_boundary_id: string;
  runner_response_id: string;
  bounded_context_response_id: string;
  bounded_context_package_id: string;
  protocol_adapter_shape_id: string;
  local_json_fixture_runner_proof_id: string;
  cli_boundary: true;
  file_boundary: true;
  contract_only: true;
  deterministic: true;
  local_only: true;
  file_read_performed: false;
  file_write_performed: false;
  cli_process_spawned: false;
  process_execution_performed: false;
  runtime_permission_granted: false;
  actual_contour_execution_allowed_now: false;
}

export interface LocalJsonFixtureRunnerCliBoundaryBuilder {
  create(
    input: LocalJsonFixtureRunnerCliBoundaryBuilderInputShape
  ): LocalJsonFixtureRunnerCliBoundaryShape;
  summarize(
    input: LocalJsonFixtureRunnerCliBoundaryShape
  ): LocalJsonFixtureRunnerCliBoundarySummaryShape;
}
