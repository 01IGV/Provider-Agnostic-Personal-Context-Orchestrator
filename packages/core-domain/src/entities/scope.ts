import type { CanonicalScopeType, ScopeId } from "@orchestrator/core-foundation";
import type { CanonicalEntityDiscriminator } from "../discriminators.js";

export interface Scope extends CanonicalEntityDiscriminator<"identity_scope", "scope"> {
  scope_id: ScopeId;
  scope_type: CanonicalScopeType;
  scope_key: string;
  parent_scope_id?: ScopeId;
  created_at: string;
}
