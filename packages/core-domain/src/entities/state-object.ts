import type {
  CanonicalRecordVersion,
  EventId,
  IsoDateTimeString,
  OwnerId,
  ScopeId,
  SessionId,
  StateId,
  StateStatus,
  StateType,
  SubjectId,
  WorkflowId
} from "@orchestrator/core-foundation";
import type { CanonicalEntityDiscriminator } from "../discriminators.js";

export interface StateObject extends CanonicalEntityDiscriminator<"canonical_context", "state_object"> {
  state_id: StateId;
  state_type: StateType;
  subject_id: SubjectId;
  owner_id: OwnerId;
  scope_id: ScopeId;
  session_id?: SessionId;
  workflow_id?: WorkflowId;
  content: Record<string, unknown>;
  status: StateStatus;
  priority?: number;
  started_at?: IsoDateTimeString;
  updated_at: IsoDateTimeString;
  expires_at?: IsoDateTimeString;
  source_event_ids: EventId[];
  policy_tags: string[];
  version: CanonicalRecordVersion;
}
