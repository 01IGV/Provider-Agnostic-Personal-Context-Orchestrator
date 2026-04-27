import type { CorrelationId, IsoDateTimeString } from "@orchestrator/core-foundation";
import type {
  AgentContextAuthorityEnvelopeShape,
  BoundedContextResponseEnvelopeShape
} from "./agent-context-request-boundary-types.js";
import type {
  VerifiedResponseProtocolSurfaceAdapterBoundary,
  VerifiedResponseProtocolSurfaceAdapterKind,
  VerifiedResponseProtocolSurfaceAdapterStatus
} from "./verified-response-protocol-surface-adapter-vocabularies.js";

export interface VerifiedResponseProtocolSurfaceAdapterDenialPostureShape {
  protocol_adjacent: true;
  adapter_shape_only: true;
  mcp_server_implemented: false;
  mcp_tool_registered: false;
  mcp_resource_registered: false;
  api_route_registered: false;
  api_controller_registered: false;
  runtime_handler_bound: false;
  transport_execution_allowed_now: false;
  provider_sdk_call_allowed_now: false;
  concrete_persistence_read_allowed_now: false;
  concrete_persistence_write_allowed_now: false;
  real_model_call_allowed_now: false;
  real_storage_write_allowed_now: false;
  runtime_permission_granted: false;
  actual_contour_execution_allowed_now: false;
}

export interface VerifiedResponseProtocolSurfaceAdapterRefsShape {
  agent_context_request_id: string;
  bounded_context_response_id: string;
  bounded_context_package_id: string;
  provenance_envelope_ref: string;
  permission_envelope_ref: string;
  audit_envelope_ref: string;
  verification_result: "agent_consumable_response_contract_verified";
}

export interface VerifiedResponseProtocolSurfaceAdapterShape {
  adapter_shape_id: string;
  adapter_kind: VerifiedResponseProtocolSurfaceAdapterKind;
  adapter_status: VerifiedResponseProtocolSurfaceAdapterStatus;
  adapter_boundary: VerifiedResponseProtocolSurfaceAdapterBoundary;
  operation_id: "verified_response_protocol_surface_adapter_shape";
  authority: AgentContextAuthorityEnvelopeShape;
  refs: VerifiedResponseProtocolSurfaceAdapterRefsShape;
  denial_posture: VerifiedResponseProtocolSurfaceAdapterDenialPostureShape;
  response: BoundedContextResponseEnvelopeShape;
  created_at: IsoDateTimeString;
  correlation_id?: CorrelationId;
  notes: string[];
}

export interface VerifiedResponseProtocolSurfaceAdapterBuilderInputShape {
  adapter_shape_id: string;
  response: BoundedContextResponseEnvelopeShape;
  bounded_context_package_id: string;
  verification_result: "agent_consumable_response_contract_verified";
  created_at: IsoDateTimeString;
  correlation_id?: CorrelationId;
  notes?: string[];
}

export interface VerifiedResponseProtocolSurfaceAdapterSummaryShape {
  adapter_shape_id: string;
  adapter_kind: VerifiedResponseProtocolSurfaceAdapterKind;
  adapter_status: VerifiedResponseProtocolSurfaceAdapterStatus;
  bounded_context_response_id: string;
  bounded_context_package_id: string;
  verification_result: "agent_consumable_response_contract_verified";
  protocol_adjacent: true;
  adapter_shape_only: true;
  mcp_server_implemented: false;
  mcp_tool_registered: false;
  api_route_registered: false;
  runtime_handler_bound: false;
  runtime_permission_granted: false;
  actual_contour_execution_allowed_now: false;
}

export interface VerifiedResponseProtocolSurfaceAdapterBuilder {
  create(
    input: VerifiedResponseProtocolSurfaceAdapterBuilderInputShape
  ): VerifiedResponseProtocolSurfaceAdapterShape;
  summarize(
    input: VerifiedResponseProtocolSurfaceAdapterShape
  ): VerifiedResponseProtocolSurfaceAdapterSummaryShape;
}
