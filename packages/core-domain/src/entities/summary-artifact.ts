import type { ScopeId, SharedLifecycleStatus, SubjectId, SummaryId, SummaryType } from "@orchestrator/core-foundation";
import type { DerivedEntityDiscriminator } from "../discriminators.js";
import type { DomainEntityId } from "./shared.js";

export interface SummaryArtifact extends DerivedEntityDiscriminator<"derived_context", "summary_artifact"> {
  summary_id: SummaryId;
  summary_type: SummaryType;
  subject_id: SubjectId;
  scope_id: ScopeId;
  content: Record<string, unknown>;
  source_record_ids: DomainEntityId[];
  generated_at: string;
  expires_at?: string;
  generation_metadata: Record<string, unknown>;
  status: SharedLifecycleStatus;
}
