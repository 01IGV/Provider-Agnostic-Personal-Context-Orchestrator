import type { ArtifactRefId, ScopeId, SubjectId } from "@orchestrator/core-foundation";
import type { CanonicalEntityDiscriminator } from "../discriminators.js";

export interface ArtifactReference extends CanonicalEntityDiscriminator<"canonical_context", "artifact_reference"> {
  artifact_ref_id: ArtifactRefId;
  subject_id: SubjectId;
  scope_id: ScopeId;
  artifact_type: string;
  locator: string;
  title?: string;
  description?: string;
  source_system: string;
  created_at: string;
  updated_at: string;
  metadata: Record<string, unknown>;
}
