import type { CorrelationId, IsoDateTimeString } from "@orchestrator/core-foundation";
import type { AgentContextRequestBoundaryShape } from "./agent-context-request-boundary-types.js";
import type {
  VerifiedResponseProtocolSurfaceAdapterShape,
  VerifiedResponseProtocolSurfaceAdapterSummaryShape
} from "./verified-response-protocol-surface-adapter-types.js";
import type {
  LocalJsonRequestResponseRunnerBoundary,
  LocalJsonRequestResponseRunnerInputKind,
  LocalJsonRequestResponseRunnerKind,
  LocalJsonRequestResponseRunnerOutputKind,
  LocalJsonRequestResponseRunnerStatus
} from "./local-json-request-response-runner-vocabularies.js";

export interface LocalJsonRequestResponseRunnerExecutionPostureShape {
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
}

export interface LocalJsonRequestResponseRunnerRequestEnvelopeShape {
  runner_request_id: string;
  runner_kind: LocalJsonRequestResponseRunnerKind;
  runner_status: LocalJsonRequestResponseRunnerStatus;
  runner_boundary: LocalJsonRequestResponseRunnerBoundary;
  operation_id: "local_json_request_response_runner_shape";
  operation_version: "local-json-request-response-runner-shape/v1";
  input_kind: LocalJsonRequestResponseRunnerInputKind;
  requested_output_kind: LocalJsonRequestResponseRunnerOutputKind;
  request_json: AgentContextRequestBoundaryShape;
  execution_posture: LocalJsonRequestResponseRunnerExecutionPostureShape;
  created_at: IsoDateTimeString;
  correlation_id?: CorrelationId;
  notes: string[];
}

export interface LocalJsonRequestResponseRunnerResponseRefsShape {
  agent_context_request_id: string;
  bounded_context_response_id: string;
  bounded_context_package_id: string;
  protocol_adapter_shape_id: string;
  verification_result: "agent_consumable_response_contract_verified";
}

export interface LocalJsonResponseObservationSummaryShape {
  observation_result: "local_json_response_observation_summary_ready";
  agent_readable_contract: "agent-readable-local-json-response-observation/v1";
  agent_response_status: "bounded_context_ready_for_agent_use";
  runner_response_id: string;
  agent_context_request_id: string;
  bounded_context_response_id: string;
  bounded_context_package_id: string;
  protocol_adapter_shape_id: string;
  response_status: string;
  selected_source_item_count: number;
  selected_source_refs: string[];
  selected_scope_ids: string[];
  package_item_count: number;
  local_json_only: true;
  deterministic: true;
  fixture_driven: true;
  runtime_permission_granted: false;
  actual_contour_execution_allowed_now: false;
  safe_agent_use_hints: string[];
  denied_agent_action_hints: string[];
}

export interface LocalJsonRequestResponseRunnerResponseEnvelopeShape {
  runner_response_id: string;
  runner_request_id: string;
  runner_status: LocalJsonRequestResponseRunnerStatus;
  output_kind: LocalJsonRequestResponseRunnerOutputKind;
  refs: LocalJsonRequestResponseRunnerResponseRefsShape;
  response_json: VerifiedResponseProtocolSurfaceAdapterShape;
  response_summary_json: VerifiedResponseProtocolSurfaceAdapterSummaryShape;
  response_observation_summary_json: LocalJsonResponseObservationSummaryShape;
  execution_posture: LocalJsonRequestResponseRunnerExecutionPostureShape;
  json_serializable: true;
  served_at: IsoDateTimeString;
  correlation_id?: CorrelationId;
  notes: string[];
}

export interface LocalJsonRequestResponseRunnerSummaryShape {
  runner_request_id: string;
  runner_response_id: string;
  agent_context_request_id: string;
  bounded_context_response_id: string;
  bounded_context_package_id: string;
  protocol_adapter_shape_id: string;
  local_json_only: true;
  deterministic: true;
  fixture_driven: true;
  runner_shape_only: true;
  runtime_permission_granted: false;
  actual_contour_execution_allowed_now: false;
}

export interface LocalJsonRequestResponseRunnerRequestBuilderInputShape {
  runner_request_id: string;
  request_json: AgentContextRequestBoundaryShape;
  created_at: IsoDateTimeString;
  correlation_id?: CorrelationId;
  notes?: string[];
}

export interface LocalJsonRequestResponseRunnerResponseBuilderInputShape {
  runner_request: LocalJsonRequestResponseRunnerRequestEnvelopeShape;
  response_json: VerifiedResponseProtocolSurfaceAdapterShape;
  response_summary_json: VerifiedResponseProtocolSurfaceAdapterSummaryShape;
  served_at: IsoDateTimeString;
  notes?: string[];
}

export interface LocalJsonRequestResponseRunnerBuilder {
  createRequest(
    input: LocalJsonRequestResponseRunnerRequestBuilderInputShape
  ): LocalJsonRequestResponseRunnerRequestEnvelopeShape;
  createResponse(
    input: LocalJsonRequestResponseRunnerResponseBuilderInputShape
  ): LocalJsonRequestResponseRunnerResponseEnvelopeShape;
  summarize(
    input: LocalJsonRequestResponseRunnerResponseEnvelopeShape
  ): LocalJsonRequestResponseRunnerSummaryShape;
}
