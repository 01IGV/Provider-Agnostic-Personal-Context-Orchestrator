import type {
  McpApiAdjacentSurfaceBoundaryBuilder,
  McpApiAdjacentSurfaceBoundaryBuilderInputShape,
  McpApiAdjacentSurfaceBoundaryDenialFlagsShape,
  McpApiAdjacentSurfaceBoundaryReadinessShape,
  McpApiAdjacentSurfaceBoundaryShape,
  McpApiAdjacentSurfaceBoundarySummaryShape,
  McpApiAdjacentSurfaceBoundaryWarningShape
} from "./mcp-api-adjacent-surface-boundary-types.js";
import type {
  McpApiAdjacentSurfaceBoundaryDenialReason,
  McpApiAdjacentSurfaceBoundaryStatus,
  McpApiAdjacentSurfaceKind
} from "./mcp-api-adjacent-surface-boundary-vocabularies.js";

const defaultDenialFlags = (): McpApiAdjacentSurfaceBoundaryDenialFlagsShape => ({
  mcp_tool_registration_allowed_now: false,
  mcp_tool_invocation_allowed_now: false,
  mcp_resource_registration_allowed_now: false,
  api_route_registration_allowed_now: false,
  api_route_invocation_allowed_now: false,
  api_controller_allowed_now: false,
  controller_execution_allowed_now: false,
  runtime_handler_bound: false,
  runtime_handler_invocation_allowed_now: false,
  handler_execution_allowed_now: false,
  provider_sdk_call_allowed_now: false,
  transport_execution_allowed_now: false,
  concrete_persistence_write_allowed_now: false,
  direct_canonical_context_access_allowed_now: false,
  direct_canonical_writeback_allowed_now: false,
  actual_contour_execution_allowed_now: false,
  runtime_permission_granted: false,
  real_model_call_allowed_now: false,
  real_storage_write_allowed_now: false
});

const resolveSurfaceKind = (input: McpApiAdjacentSurfaceBoundaryBuilderInputShape): McpApiAdjacentSurfaceKind => {
  if (input.surface_kind) {
    return input.surface_kind;
  }

  return input.source.source_contour_target === "unknown"
    ? "unknown_protocol_surface"
    : "mcp_api_adjacent_surface";
};

const resolveBoundaryStatus = (
  input: McpApiAdjacentSurfaceBoundaryBuilderInputShape,
  surfaceKind: McpApiAdjacentSurfaceKind
): McpApiAdjacentSurfaceBoundaryStatus => {
  if (input.boundary_status) {
    return input.boundary_status;
  }

  return surfaceKind === "unknown_protocol_surface" || input.source.source_contour_target === "unknown"
    ? "surface_boundary_not_permitted"
    : "surface_boundary_candidate";
};

const defaultDenialReasons = (
  status: McpApiAdjacentSurfaceBoundaryStatus,
  surfaceKind: McpApiAdjacentSurfaceKind
): McpApiAdjacentSurfaceBoundaryDenialReason[] => [
  "mcp_api_surface_boundary_contract_only",
  "mcp_tool_registration_denied_by_default",
  "mcp_tool_invocation_denied_by_default",
  "api_route_registration_denied_by_default",
  "api_route_invocation_denied_by_default",
  "controller_execution_denied_by_default",
  "runtime_handler_binding_denied_by_default",
  "runtime_handler_invocation_denied_by_default",
  "handler_execution_denied_by_default",
  "provider_sdk_call_denied_by_default",
  "transport_execution_denied_by_default",
  "concrete_persistence_write_denied_by_default",
  "direct_canonical_context_access_denied_by_default",
  "direct_canonical_writeback_denied_by_default",
  "actual_contour_execution_denied_by_default",
  "runtime_permission_denied_by_default",
  "source_handler_boundary_denial_proof_required",
  ...(status === "surface_boundary_not_permitted" || surfaceKind === "unknown_protocol_surface"
    ? ["unknown_protocol_surface_not_permitted" as const]
    : [])
];

const defaultWarnings = (): McpApiAdjacentSurfaceBoundaryWarningShape[] => [
  {
    code: "mcp_api_adjacent_not_protocol_implementation",
    message: "MCP/API-adjacent surface boundary is a contract shape only; no protocol implementation is created."
  },
  {
    code: "surface_boundary_not_route_or_controller",
    message: "Surface boundary is not an MCP route, API route, controller, or transport handler."
  },
  {
    code: "mcp_tool_registration_still_denied",
    message: "MCP tool registration remains denied by default."
  },
  {
    code: "api_route_registration_still_denied",
    message: "API route registration remains denied by default."
  },
  {
    code: "runtime_handler_binding_still_denied",
    message: "Runtime handler binding remains denied by default."
  },
  {
    code: "runtime_permission_still_denied",
    message: "Runtime permission remains denied by default."
  },
  {
    code: "provider_sdk_call_still_denied",
    message: "Provider SDK calls remain denied by default."
  },
  {
    code: "transport_execution_still_denied",
    message: "Transport execution remains denied by default."
  },
  {
    code: "concrete_persistence_write_still_denied",
    message: "Concrete persistence writes remain denied by default."
  },
  {
    code: "canonical_context_access_still_denied",
    message: "Direct canonical context access remains denied by default."
  },
  {
    code: "canonical_writeback_still_denied",
    message: "Direct canonical writeback remains denied by default."
  },
  {
    code: "authority_context_placeholder_only",
    message: "Authority, identity, and delegation are preserved as placeholder references only."
  },
  {
    code: "provenance_context_placeholder_only",
    message: "Provenance is preserved as a placeholder reference only."
  },
  {
    code: "source_handler_boundary_denial_proof_reference_only",
    message: "Source handler-boundary denial proof is referenced only and does not grant protocol or runtime permission."
  }
];

const defaultGuardrails = (): string[] => [
  "This boundary is MCP/API-adjacent but is not an MCP/API implementation.",
  "No MCP tool, MCP resource, API route, or API controller is registered.",
  "Runtime handler binding and invocation are denied by default.",
  "Provider SDK calls, transport execution, concrete persistence, model calls, and storage writes are denied by default.",
  "Authority, identity, delegation, and provenance remain shape-level references only.",
  "This boundary is not runtime permission and not evidence of actual contour execution."
];

const buildReadiness = (input: {
  surface_boundary_id: string;
  source_handler_boundary_denial_proof_id: string;
  source_contour_target: McpApiAdjacentSurfaceBoundaryShape["source"]["source_contour_target"];
  surface_kind: McpApiAdjacentSurfaceKind;
  boundary_status: McpApiAdjacentSurfaceBoundaryStatus;
  denial_reasons: McpApiAdjacentSurfaceBoundaryDenialReason[];
}): McpApiAdjacentSurfaceBoundaryReadinessShape => ({
  surface_boundary_readiness_id: `${input.surface_boundary_id}:readiness`,
  surface_boundary_id: input.surface_boundary_id,
  source_handler_boundary_denial_proof_id: input.source_handler_boundary_denial_proof_id,
  source_contour_target: input.source_contour_target,
  surface_kind: input.surface_kind,
  boundary_status: input.boundary_status,
  readiness_status:
    input.boundary_status === "surface_boundary_candidate"
      ? "candidate_for_future_protocol_surface"
      : "not_ready_for_future_protocol_surface",
  mcp_tool_registration_allowed_now: false,
  api_route_registration_allowed_now: false,
  controller_execution_allowed_now: false,
  runtime_handler_invocation_allowed_now: false,
  runtime_permission_granted: false,
  denial_reasons: input.denial_reasons,
  notes: [
    "Readiness is protocol-surface-adjacent only and does not permit route/controller implementation.",
    "Future MCP/API exposure remains explicitly denied in this boundary."
  ]
});

export const createMcpApiAdjacentSurfaceBoundaryBuilder = (): McpApiAdjacentSurfaceBoundaryBuilder => ({
  create(input: McpApiAdjacentSurfaceBoundaryBuilderInputShape): McpApiAdjacentSurfaceBoundaryShape {
    const surfaceKind = resolveSurfaceKind(input);
    const boundaryStatus = resolveBoundaryStatus(input, surfaceKind);
    const denialReasons = input.denial_reasons ?? defaultDenialReasons(boundaryStatus, surfaceKind);
    const guardrails = input.guardrail_notes ?? defaultGuardrails();
    const warnings = input.warnings ?? defaultWarnings();

    return {
      surface_boundary_id: input.surface_boundary_id,
      request_id: input.request_id,
      operation_id: input.operation_id,
      source: input.source,
      authority_context_placeholder: input.authority_context_placeholder,
      surface_kind: surfaceKind,
      boundary_status: boundaryStatus,
      mcp_api_adjacent: true,
      protocol_surface_boundary: true,
      route_controller_implemented: false,
      mcp_tool_registered: false,
      api_route_registered: false,
      runtime_handler_bound: false,
      runtime_permission_granted: false,
      actual_handler_execution_allowed_now: false,
      actual_contour_execution_allowed_now: false,
      surface_boundary_intent: {
        surface_boundary_intent_id: `${input.surface_boundary_id}:intent`,
        surface_boundary_id: input.surface_boundary_id,
        source_handler_boundary_denial_proof_id: input.source.source_handler_boundary_denial_proof_id,
        source_contour_target: input.source.source_contour_target,
        surface_kind: surfaceKind,
        intent_status: "surface_boundary_intent_recorded",
        intent_boundary: "mcp_api_adjacent_surface_boundary_contract_only",
        mcp_api_adjacent: true,
        protocol_surface_boundary: true,
        route_controller_implemented: false,
        mcp_tool_registered: false,
        api_route_registered: false,
        runtime_handler_bound: false,
        runtime_permission_granted: false,
        actual_handler_execution_allowed_now: false,
        actual_contour_execution_allowed_now: false,
        notes: guardrails
      },
      surface_boundary_readiness: buildReadiness({
        surface_boundary_id: input.surface_boundary_id,
        source_handler_boundary_denial_proof_id: input.source.source_handler_boundary_denial_proof_id,
        source_contour_target: input.source.source_contour_target,
        surface_kind: surfaceKind,
        boundary_status: boundaryStatus,
        denial_reasons: denialReasons
      }),
      denial_flags: defaultDenialFlags(),
      denial_reasons: denialReasons,
      warnings,
      guardrail_notes: guardrails,
      created_at: input.created_at
    };
  },

  summarize(input: McpApiAdjacentSurfaceBoundaryShape): McpApiAdjacentSurfaceBoundarySummaryShape {
    return {
      surface_boundary_id: input.surface_boundary_id,
      source_handler_boundary_id: input.source.source_handler_boundary_id,
      source_handler_boundary_denial_proof_id: input.source.source_handler_boundary_denial_proof_id,
      source_invocation_denial_proof_id: input.source.source_invocation_denial_proof_id,
      source_contour_target: input.source.source_contour_target,
      source_handler_boundary_status: input.source.source_handler_boundary_status,
      surface_kind: input.surface_kind,
      boundary_status: input.boundary_status,
      mcp_api_adjacent: true,
      protocol_surface_boundary: true,
      route_controller_implemented: false,
      mcp_tool_registered: false,
      api_route_registered: false,
      runtime_handler_bound: false,
      runtime_permission_granted: false,
      actual_handler_execution_allowed_now: false,
      actual_contour_execution_allowed_now: false,
      denial_flags_all_false: true,
      guardrail_notes: input.guardrail_notes
    };
  }
});
