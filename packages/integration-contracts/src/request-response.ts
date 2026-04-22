import type {
  ClientId,
  CorrelationId,
  ErrorFamily,
  InvocationId,
  IsoDateTimeString,
  ScopeId,
  SessionId,
  SubjectId,
  WorkflowId
} from "@orchestrator/core-foundation";
import type { IntegrationMode } from "@orchestrator/core-domain";
import type { IntegrationSurfaceType, RequestVisibilityLevel, SurfaceErrorCode, SurfaceResponseStatus } from "./vocabularies.js";

export interface ExternalInvocationEnvelope {
  invocation_id: InvocationId;
  client_id: ClientId;
  integration_mode: IntegrationMode;
  surface_type: IntegrationSurfaceType;
  received_at: IsoDateTimeString;
  correlation_id?: CorrelationId;
  transport_metadata?: Record<string, unknown>;
}

export interface CanonicalRequestEnvelope<TPayload = Record<string, unknown>> {
  request_id: string;
  operation_id: string;
  operation_version: string;
  invocation: ExternalInvocationEnvelope;
  subject_id: SubjectId;
  scope_id?: ScopeId;
  session_id?: SessionId;
  workflow_id?: WorkflowId;
  requested_visibility?: RequestVisibilityLevel;
  payload: TPayload;
  target_runtime?: string;
  target_provider?: string;
  target_model?: string;
  requested_at: IsoDateTimeString;
}

export interface CanonicalResponseEnvelope<TResult = Record<string, unknown>> {
  request_id: string;
  operation_id: string;
  status: SurfaceResponseStatus;
  result?: TResult;
  warnings: Array<{ code: string; message: string }>;
  served_at: IsoDateTimeString;
  correlation_id?: CorrelationId;
}

export interface SurfaceErrorObject {
  error_code: SurfaceErrorCode;
  error_family: ErrorFamily;
  message: string;
  retryable: boolean;
  details?: Record<string, unknown>;
}

export interface TypedSurfaceResponse<TResult = Record<string, unknown>> {
  envelope: CanonicalResponseEnvelope<TResult>;
  error?: SurfaceErrorObject;
}
