import type {
  CorrelationId,
  EventId,
  OwnerId,
  ScopeId,
  SessionId,
  SubjectId,
  WorkflowId
} from "@orchestrator/core-foundation";
import type { CanonicalEntityDiscriminator } from "../discriminators.js";

export interface CanonicalEvent extends CanonicalEntityDiscriminator<"chronology", "event"> {
  event_id: EventId;
  event_type: string;
  subject_id: SubjectId;
  owner_id: OwnerId;
  scope_id: ScopeId;
  session_id?: SessionId;
  workflow_id?: WorkflowId;
  actor_type: string;
  actor_id?: string;
  timestamp: string;
  payload: Record<string, unknown>;
  source_ref?: string;
  correlation_id?: CorrelationId;
}
