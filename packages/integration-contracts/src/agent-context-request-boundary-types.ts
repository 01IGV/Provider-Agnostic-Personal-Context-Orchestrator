import type {
  CorrelationId,
  IsoDateTimeString,
  ScopeId,
  SessionId,
  SubjectId,
  WorkflowId
} from "@orchestrator/core-foundation";
import type { ReadDepthHint, ReadMode } from "@orchestrator/read-path";
import type {
  AgentContextBoundaryStatus,
  AgentContextRequestKind,
  AgentContextResponseBoundary,
  AgentContextResponseStatus,
  AgentContextWarningCode
} from "./agent-context-request-boundary-vocabularies.js";
import type { RequestVisibilityLevel } from "./vocabularies.js";

export interface AgentContextWarningShape {
  code: AgentContextWarningCode;
  message: string;
}

export interface AgentContextRequesterShape {
  requester_ref: string;
  subject_id: SubjectId;
  session_id?: SessionId;
  workflow_id?: WorkflowId;
  agent_runtime_ref?: string;
  model_ref?: string;
}

export interface AgentContextAuthorityEnvelopeShape {
  authority_boundary_id?: string;
  authority_boundary_denial_proof_id?: string;
  authority_context_id?: string;
  subject_identity_ref?: string;
  delegated_authority_ref?: string;
  provenance_chain_ref?: string;
  permission_scope_ref?: string;
  policy_context_ref?: string;
  audit_trace_ref?: string;
  auth_iam_adjacent: true;
  authority_boundary: true;
  permission_boundary: true;
  permission_grant_issued: false;
  runtime_permission_granted: false;
  mcp_route_permission_granted: false;
  api_route_permission_granted: false;
}

export interface AgentContextExecutionPostureShape {
  mcp_server_implemented: false;
  mcp_tool_registered: false;
  mcp_resource_registered: false;
  api_route_registered: false;
  api_controller_registered: false;
  runtime_handler_bound: false;
  provider_sdk_call_allowed_now: false;
  transport_execution_allowed_now: false;
  concrete_persistence_write_allowed_now: false;
  real_model_call_allowed_now: false;
  real_storage_write_allowed_now: false;
  actual_contour_execution_allowed_now: false;
}

export interface AgentContextRequestIntentShape {
  request_kind: AgentContextRequestKind;
  task_signal: string;
  read_mode_hint?: ReadMode;
  depth_hint?: ReadDepthHint;
  requested_scope_hints: ScopeId[];
  requested_visibility?: RequestVisibilityLevel;
  target_runtime?: string;
  target_provider?: string;
  target_model?: string;
  token_budget_hint?: number;
}

export interface AgentContextRequestBoundaryShape {
  agent_context_request_id: string;
  operation_id: "agent_context_request_boundary";
  operation_version: "agent-context-request-boundary/v1";
  requester: AgentContextRequesterShape;
  intent: AgentContextRequestIntentShape;
  authority: AgentContextAuthorityEnvelopeShape;
  execution_posture: AgentContextExecutionPostureShape;
  boundary_status: AgentContextBoundaryStatus;
  contract_only: true;
  bounded_context_requested: true;
  bounded_context_delivered: false;
  created_at: IsoDateTimeString;
  correlation_id?: CorrelationId;
  warnings: AgentContextWarningShape[];
}

export interface BoundedContextResponseEnvelopeShape {
  bounded_context_response_id: string;
  agent_context_request_id: string;
  response_status: AgentContextResponseStatus;
  response_boundary: AgentContextResponseBoundary;
  authority: AgentContextAuthorityEnvelopeShape;
  execution_posture: AgentContextExecutionPostureShape;
  bounded_context_package_ref?: string;
  context_bundle_ref?: string;
  provenance_envelope_ref?: string;
  permission_envelope_ref?: string;
  audit_envelope_ref?: string;
  response_payload: Record<string, unknown>;
  warnings: AgentContextWarningShape[];
  served_at: IsoDateTimeString;
  correlation_id?: CorrelationId;
}

export interface AgentContextRequestBoundaryBuilderInputShape {
  agent_context_request_id: string;
  requester: AgentContextRequesterShape;
  intent: AgentContextRequestIntentShape;
  authority: AgentContextAuthorityEnvelopeShape;
  boundary_status?: AgentContextBoundaryStatus;
  correlation_id?: CorrelationId;
  created_at: IsoDateTimeString;
  warnings?: AgentContextWarningShape[];
}

export interface BoundedContextResponseEnvelopeBuilderInputShape {
  request: AgentContextRequestBoundaryShape;
  response_status?: AgentContextResponseStatus;
  response_payload?: Record<string, unknown>;
  bounded_context_package_ref?: string;
  context_bundle_ref?: string;
  provenance_envelope_ref?: string;
  permission_envelope_ref?: string;
  audit_envelope_ref?: string;
  served_at: IsoDateTimeString;
  warnings?: AgentContextWarningShape[];
}

export interface AgentContextRequestBoundaryBuilder {
  createRequest(input: AgentContextRequestBoundaryBuilderInputShape): AgentContextRequestBoundaryShape;
  createResponse(input: BoundedContextResponseEnvelopeBuilderInputShape): BoundedContextResponseEnvelopeShape;
}
