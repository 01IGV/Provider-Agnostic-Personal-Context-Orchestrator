import type {
  VerifiedResponseProtocolSurfaceAdapterBuilder,
  VerifiedResponseProtocolSurfaceAdapterBuilderInputShape,
  VerifiedResponseProtocolSurfaceAdapterDenialPostureShape,
  VerifiedResponseProtocolSurfaceAdapterShape,
  VerifiedResponseProtocolSurfaceAdapterSummaryShape
} from "./verified-response-protocol-surface-adapter-types.js";

const defaultDenialPosture = (): VerifiedResponseProtocolSurfaceAdapterDenialPostureShape => ({
  protocol_adjacent: true,
  adapter_shape_only: true,
  mcp_server_implemented: false,
  mcp_tool_registered: false,
  mcp_resource_registered: false,
  api_route_registered: false,
  api_controller_registered: false,
  runtime_handler_bound: false,
  transport_execution_allowed_now: false,
  provider_sdk_call_allowed_now: false,
  concrete_persistence_read_allowed_now: false,
  concrete_persistence_write_allowed_now: false,
  real_model_call_allowed_now: false,
  real_storage_write_allowed_now: false,
  runtime_permission_granted: false,
  actual_contour_execution_allowed_now: false
});

const defaultNotes = (): string[] => [
  "Protocol-surface adapter is a shape only and does not create an MCP/API server.",
  "No MCP tool, MCP resource, API route, controller, runtime handler, transport, provider call, persistence, model call, storage write, or contour execution is registered or invoked.",
  "The adapter carries a verified bounded context response for future protocol exposure."
];

export const createVerifiedResponseProtocolSurfaceAdapterBuilder =
  (): VerifiedResponseProtocolSurfaceAdapterBuilder => ({
    create(input: VerifiedResponseProtocolSurfaceAdapterBuilderInputShape): VerifiedResponseProtocolSurfaceAdapterShape {
      return {
        adapter_shape_id: input.adapter_shape_id,
        adapter_kind: "mcp_api_adjacent_verified_response_adapter",
        adapter_status: "verified_response_adapter_shape_ready",
        adapter_boundary: "protocol_adjacent_adapter_shape_only",
        operation_id: "verified_response_protocol_surface_adapter_shape",
        authority: input.response.authority,
        refs: {
          agent_context_request_id: input.response.agent_context_request_id,
          bounded_context_response_id: input.response.bounded_context_response_id,
          bounded_context_package_id: input.bounded_context_package_id,
          provenance_envelope_ref: input.response.provenance_envelope_ref ?? "",
          permission_envelope_ref: input.response.permission_envelope_ref ?? "",
          audit_envelope_ref: input.response.audit_envelope_ref ?? "",
          verification_result: input.verification_result
        },
        denial_posture: defaultDenialPosture(),
        response: input.response,
        created_at: input.created_at,
        ...(input.correlation_id ? { correlation_id: input.correlation_id } : {}),
        notes: input.notes ?? defaultNotes()
      };
    },

    summarize(input: VerifiedResponseProtocolSurfaceAdapterShape): VerifiedResponseProtocolSurfaceAdapterSummaryShape {
      return {
        adapter_shape_id: input.adapter_shape_id,
        adapter_kind: input.adapter_kind,
        adapter_status: input.adapter_status,
        bounded_context_response_id: input.refs.bounded_context_response_id,
        bounded_context_package_id: input.refs.bounded_context_package_id,
        verification_result: input.refs.verification_result,
        protocol_adjacent: input.denial_posture.protocol_adjacent,
        adapter_shape_only: input.denial_posture.adapter_shape_only,
        mcp_server_implemented: input.denial_posture.mcp_server_implemented,
        mcp_tool_registered: input.denial_posture.mcp_tool_registered,
        api_route_registered: input.denial_posture.api_route_registered,
        runtime_handler_bound: input.denial_posture.runtime_handler_bound,
        runtime_permission_granted: input.denial_posture.runtime_permission_granted,
        actual_contour_execution_allowed_now: input.denial_posture.actual_contour_execution_allowed_now
      };
    }
  });
