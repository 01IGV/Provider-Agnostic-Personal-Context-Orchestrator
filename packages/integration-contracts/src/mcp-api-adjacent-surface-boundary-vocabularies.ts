export const MCP_API_ADJACENT_SURFACE_BOUNDARY_CONTOUR_TARGETS = [
  "read_path",
  "pack_loop",
  "write_path",
  "handoff",
  "unknown"
] as const;
export type McpApiAdjacentSurfaceBoundaryContourTarget =
  (typeof MCP_API_ADJACENT_SURFACE_BOUNDARY_CONTOUR_TARGETS)[number];

export const MCP_API_ADJACENT_SURFACE_KINDS = [
  "mcp_adjacent_surface",
  "api_adjacent_surface",
  "mcp_api_adjacent_surface",
  "unknown_protocol_surface"
] as const;
export type McpApiAdjacentSurfaceKind = (typeof MCP_API_ADJACENT_SURFACE_KINDS)[number];

export const MCP_API_ADJACENT_SURFACE_BOUNDARY_STATUSES = [
  "surface_boundary_candidate",
  "surface_boundary_blocked",
  "surface_boundary_not_permitted"
] as const;
export type McpApiAdjacentSurfaceBoundaryStatus =
  (typeof MCP_API_ADJACENT_SURFACE_BOUNDARY_STATUSES)[number];

export const MCP_API_ADJACENT_SURFACE_BOUNDARY_DENIAL_REASONS = [
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
  "unknown_protocol_surface_not_permitted"
] as const;
export type McpApiAdjacentSurfaceBoundaryDenialReason =
  (typeof MCP_API_ADJACENT_SURFACE_BOUNDARY_DENIAL_REASONS)[number];

export const MCP_API_ADJACENT_SURFACE_BOUNDARY_WARNING_CODES = [
  "mcp_api_adjacent_not_protocol_implementation",
  "surface_boundary_not_route_or_controller",
  "mcp_tool_registration_still_denied",
  "api_route_registration_still_denied",
  "runtime_handler_binding_still_denied",
  "runtime_permission_still_denied",
  "provider_sdk_call_still_denied",
  "transport_execution_still_denied",
  "concrete_persistence_write_still_denied",
  "canonical_context_access_still_denied",
  "canonical_writeback_still_denied",
  "authority_context_placeholder_only",
  "provenance_context_placeholder_only",
  "source_handler_boundary_denial_proof_reference_only"
] as const;
export type McpApiAdjacentSurfaceBoundaryWarningCode =
  (typeof MCP_API_ADJACENT_SURFACE_BOUNDARY_WARNING_CODES)[number];
