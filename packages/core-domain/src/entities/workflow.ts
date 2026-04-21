import type { ScopeId, SharedLifecycleStatus, SubjectId, WorkflowId } from "@orchestrator/core-foundation";
import type { CanonicalEntityDiscriminator } from "../discriminators.js";

export interface Workflow extends CanonicalEntityDiscriminator<"identity_scope", "workflow"> {
  workflow_id: WorkflowId;
  subject_id: SubjectId;
  scope_id: ScopeId;
  workflow_type: string;
  status: SharedLifecycleStatus;
  started_at: string;
  updated_at: string;
  ended_at?: string;
}
