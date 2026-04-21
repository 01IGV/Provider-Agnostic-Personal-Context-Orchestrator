import type { PolicyId, ScopeId, SharedLifecycleStatus, SubjectId } from "@orchestrator/core-foundation";
import type { CanonicalEntityDiscriminator } from "../discriminators.js";

export interface PolicyRecord extends CanonicalEntityDiscriminator<"governance", "policy_record"> {
  policy_id: PolicyId;
  policy_type: string;
  scope_id?: ScopeId;
  subject_id?: SubjectId;
  rule_key: string;
  rule_definition: Record<string, unknown>;
  status: SharedLifecycleStatus;
  created_at: string;
  updated_at: string;
}
