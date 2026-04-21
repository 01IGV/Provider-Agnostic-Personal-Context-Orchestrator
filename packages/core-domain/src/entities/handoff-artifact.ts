import type { HandoffId, HandoffType, ScopeId, SharedLifecycleStatus, SubjectId } from "@orchestrator/core-foundation";
import type { DerivedEntityDiscriminator } from "../discriminators.js";
import type { DomainEntityId } from "./shared.js";

export interface HandoffArtifact extends DerivedEntityDiscriminator<"derived_context", "handoff_artifact"> {
  handoff_id: HandoffId;
  handoff_type: HandoffType;
  source_context_type: string;
  target_context_type: string;
  subject_id: SubjectId;
  scope_id: ScopeId;
  content: Record<string, unknown>;
  source_record_ids: DomainEntityId[];
  generated_at: string;
  expires_at?: string;
  status: SharedLifecycleStatus;
  transfer_metadata: Record<string, unknown>;
}
