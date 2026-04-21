import type { BundleId, ScopeId, SubjectId } from "@orchestrator/core-foundation";
import type { DerivedEntityDiscriminator } from "../discriminators.js";
import type { DomainEntityId } from "./shared.js";

export interface ContextBundle extends DerivedEntityDiscriminator<"derived_context", "context_bundle"> {
  bundle_id: BundleId;
  bundle_type: string;
  purpose: string;
  target_runtime: string;
  target_provider?: string;
  target_model?: string;
  subject_id: SubjectId;
  scope_ids: ScopeId[];
  generated_at: string;
  expires_at?: string;
  token_budget?: number;
  sections: Record<string, unknown>;
  source_record_ids: DomainEntityId[];
  confidence_notes?: string[];
  freshness_notes?: string[];
  generation_metadata: Record<string, unknown>;
}
