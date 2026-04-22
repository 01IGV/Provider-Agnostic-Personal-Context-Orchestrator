import type {
  AuditId,
  ClientId,
  CorrelationId,
  IsoDateTimeString,
  ScopeId,
  SessionId,
  SubjectId,
  WorkflowId
} from "@orchestrator/core-foundation";
import type { DomainEntityId } from "@orchestrator/core-domain";
import type { EvaluationId } from "@orchestrator/persistence-contracts";

export const AUDIT_COMPONENTS = [
  "request",
  "read",
  "pack",
  "write",
  "handoff",
  "governance",
  "integration",
  "artifact_provenance"
] as const;

export type AuditComponent = (typeof AUDIT_COMPONENTS)[number];

export const EVALUATION_COMPONENTS = [
  "relevance",
  "boundedness",
  "continuity",
  "write_quality",
  "handoff_quality",
  "governance_quality",
  "provider_neutrality",
  "operational_stability"
] as const;

export type EvaluationComponent = (typeof EVALUATION_COMPONENTS)[number];

export interface AuditTraceContext {
  request_id?: string;
  session_id?: SessionId;
  workflow_id?: WorkflowId;
  subject_id?: SubjectId;
  scope_id?: ScopeId;
  client_id?: ClientId;
  provider?: string;
  target_runtime?: string;
  target_model?: string;
  correlation_id?: CorrelationId;
  created_at: IsoDateTimeString;
}

export interface AuditActorContext {
  actor_type: string;
  actor_id?: string;
}

export interface AuditEntityLink {
  entity_id: DomainEntityId;
  relation: string;
}

export interface EvaluationScopeReference {
  evaluation_scope: string;
  related_request_ids?: string[];
  related_session_ids?: SessionId[];
  related_workflow_ids?: WorkflowId[];
  subject_id?: SubjectId;
  client_id?: ClientId;
  provider?: string;
  time_window?: {
    from?: IsoDateTimeString;
    to?: IsoDateTimeString;
  };
}

export interface ContourAuditEvaluationLink {
  link_id: `${string}:${string}`;
  audit_id: AuditId;
  evaluation_id: EvaluationId;
  contour: "read_path" | "pack_loop" | "write_path" | "handoff" | "cross_contour";
  linked_at: IsoDateTimeString;
  reason: string;
}
