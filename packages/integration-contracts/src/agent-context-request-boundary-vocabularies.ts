export const AGENT_CONTEXT_REQUEST_KINDS = [
  "get_context_bundle",
  "expand_context",
  "recover_continuity",
  "prepare_handoff"
] as const;
export type AgentContextRequestKind = (typeof AGENT_CONTEXT_REQUEST_KINDS)[number];

export const AGENT_CONTEXT_RESPONSE_STATUSES = [
  "bounded_context_ready",
  "bounded_context_denied",
  "bounded_context_not_available"
] as const;
export type AgentContextResponseStatus = (typeof AGENT_CONTEXT_RESPONSE_STATUSES)[number];

export const AGENT_CONTEXT_BOUNDARY_STATUSES = [
  "agent_context_request_boundary_candidate",
  "agent_context_request_blocked",
  "agent_context_request_not_permitted"
] as const;
export type AgentContextBoundaryStatus = (typeof AGENT_CONTEXT_BOUNDARY_STATUSES)[number];

export const AGENT_CONTEXT_RESPONSE_BOUNDARIES = [
  "contract_only_bounded_context_response",
  "denial_only_bounded_context_response"
] as const;
export type AgentContextResponseBoundary = (typeof AGENT_CONTEXT_RESPONSE_BOUNDARIES)[number];

export const AGENT_CONTEXT_WARNING_CODES = [
  "agent_context_contract_only",
  "bounded_context_not_runtime_execution",
  "authority_refs_placeholder_only",
  "permission_denied_by_default",
  "no_mcp_api_route_bound",
  "no_runtime_handler_bound",
  "no_provider_or_persistence_execution"
] as const;
export type AgentContextWarningCode = (typeof AGENT_CONTEXT_WARNING_CODES)[number];
