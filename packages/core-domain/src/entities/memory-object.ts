import type {
  CanonicalRecordVersion,
  EventId,
  IsoDateTimeString,
  MemoryId,
  MemoryStatus,
  MemoryType,
  OwnerId,
  ScopeId,
  SubjectId,
  VisibilityType
} from "@orchestrator/core-foundation";
import type { CanonicalEntityDiscriminator } from "../discriminators.js";

export interface MemoryObject extends CanonicalEntityDiscriminator<"canonical_context", "memory_object"> {
  memory_id: MemoryId;
  memory_type: MemoryType;
  subject_id: SubjectId;
  owner_id: OwnerId;
  scope_id: ScopeId;
  content: Record<string, unknown>;
  normalized_content?: Record<string, unknown>;
  confidence: number;
  importance: number;
  freshness_score?: number;
  status: MemoryStatus;
  visibility: VisibilityType;
  created_at: IsoDateTimeString;
  updated_at: IsoDateTimeString;
  valid_from?: IsoDateTimeString;
  valid_to?: IsoDateTimeString;
  source_event_ids: EventId[];
  source_refs: string[];
  policy_tags: string[];
  dedup_key?: string;
  version: CanonicalRecordVersion;
}
