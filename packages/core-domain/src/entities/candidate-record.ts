import type {
  CandidateId,
  CandidateStatus,
  CandidateType,
  EventId,
  OwnerId,
  ScopeId,
  SubjectId
} from "@orchestrator/core-foundation";
import type { CanonicalEntityDiscriminator } from "../discriminators.js";

export interface CandidateRecord extends CanonicalEntityDiscriminator<"governance", "candidate_record"> {
  candidate_id: CandidateId;
  candidate_type: CandidateType;
  proposed_record_type: string;
  subject_id: SubjectId;
  owner_id: OwnerId;
  scope_id: ScopeId;
  content: Record<string, unknown>;
  proposed_metadata: Record<string, unknown>;
  proposed_by_actor_type: string;
  proposed_by_actor_id?: string;
  source_event_ids: EventId[];
  submitted_at: string;
  status: CandidateStatus;
  why_store?: string;
}
