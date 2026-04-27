import type {
  AgentContextExecutionPostureShape,
  AgentContextRequestBoundaryBuilder,
  AgentContextRequestBoundaryBuilderInputShape,
  AgentContextRequestBoundaryShape,
  AgentContextWarningShape,
  BoundedContextResponseEnvelopeBuilderInputShape,
  BoundedContextResponseEnvelopeShape
} from "./agent-context-request-boundary-types.js";

const defaultExecutionPosture = (): AgentContextExecutionPostureShape => ({
  mcp_server_implemented: false,
  mcp_tool_registered: false,
  mcp_resource_registered: false,
  api_route_registered: false,
  api_controller_registered: false,
  runtime_handler_bound: false,
  provider_sdk_call_allowed_now: false,
  transport_execution_allowed_now: false,
  concrete_persistence_write_allowed_now: false,
  real_model_call_allowed_now: false,
  real_storage_write_allowed_now: false,
  actual_contour_execution_allowed_now: false
});

const defaultWarnings = (): AgentContextWarningShape[] => [
  {
    code: "agent_context_contract_only",
    message: "Agent context request boundary is a contract shape only."
  },
  {
    code: "bounded_context_not_runtime_execution",
    message: "Bounded context response envelope is not runtime execution and does not invoke contours."
  },
  {
    code: "permission_denied_by_default",
    message: "No permission grant or runtime permission is issued by this boundary."
  },
  {
    code: "no_mcp_api_route_bound",
    message: "No MCP/API route, controller, tool, or resource is registered."
  },
  {
    code: "no_provider_or_persistence_execution",
    message: "No provider SDK call, transport execution, persistence write, model call, or storage write is performed."
  }
];

export const createAgentContextRequestBoundaryBuilder = (): AgentContextRequestBoundaryBuilder => ({
  createRequest(input: AgentContextRequestBoundaryBuilderInputShape): AgentContextRequestBoundaryShape {
    return {
      agent_context_request_id: input.agent_context_request_id,
      operation_id: "agent_context_request_boundary",
      operation_version: "agent-context-request-boundary/v1",
      requester: input.requester,
      intent: input.intent,
      authority: input.authority,
      execution_posture: defaultExecutionPosture(),
      boundary_status: input.boundary_status ?? "agent_context_request_boundary_candidate",
      contract_only: true,
      bounded_context_requested: true,
      bounded_context_delivered: false,
      created_at: input.created_at,
      ...(input.correlation_id ? { correlation_id: input.correlation_id } : {}),
      warnings: input.warnings ?? defaultWarnings()
    };
  },

  createResponse(input: BoundedContextResponseEnvelopeBuilderInputShape): BoundedContextResponseEnvelopeShape {
    return {
      bounded_context_response_id: `${input.request.agent_context_request_id}:bounded-context-response`,
      agent_context_request_id: input.request.agent_context_request_id,
      response_status: input.response_status ?? "bounded_context_ready",
      response_boundary: "contract_only_bounded_context_response",
      authority: input.request.authority,
      execution_posture: input.request.execution_posture,
      ...(input.bounded_context_package_ref ? { bounded_context_package_ref: input.bounded_context_package_ref } : {}),
      ...(input.context_bundle_ref ? { context_bundle_ref: input.context_bundle_ref } : {}),
      ...(input.provenance_envelope_ref ? { provenance_envelope_ref: input.provenance_envelope_ref } : {}),
      ...(input.permission_envelope_ref ? { permission_envelope_ref: input.permission_envelope_ref } : {}),
      ...(input.audit_envelope_ref ? { audit_envelope_ref: input.audit_envelope_ref } : {}),
      response_payload: input.response_payload ?? {},
      warnings: input.warnings ?? input.request.warnings,
      served_at: input.served_at,
      ...(input.request.correlation_id ? { correlation_id: input.request.correlation_id } : {})
    };
  }
});
