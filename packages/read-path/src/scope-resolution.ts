import type { ScopeId } from "@orchestrator/core-foundation";
import type { ScopeGovernanceEvaluator } from "@orchestrator/governance";

export interface ScopeResolutionInput {
  requested_scope_hints?: ScopeId[];
  eligible_scope_ids: ScopeId[];
  preferred_scope_ids?: ScopeId[];
}

export interface ScopeResolutionResult {
  eligible_scopes: ScopeId[];
  preferred_scopes: ScopeId[];
  excluded_scopes: ScopeId[];
  scope_priority_order: ScopeId[];
  scope_confidence: number;
}

export interface ScopeResolver {
  resolve(input: ScopeResolutionInput): ScopeResolutionResult;
}

export const createScopeResolver = (scopeEvaluator: ScopeGovernanceEvaluator): ScopeResolver => {
  return {
    resolve(input: ScopeResolutionInput): ScopeResolutionResult {
      const requested = input.requested_scope_hints ?? [];
      const preferred = input.preferred_scope_ids ?? input.eligible_scope_ids;

      const selectedFromRequested = requested
        .map((scope_id) =>
          scopeEvaluator.evaluate({
            requested_scope_id: scope_id,
            eligible_scope_ids: input.eligible_scope_ids,
            preferred_scope_ids: preferred
          })
        )
        .filter((r) => r.selected_scope_id)
        .map((r) => r.selected_scope_id as ScopeId);

      const priority = selectedFromRequested.length > 0 ? selectedFromRequested : preferred;
      const excluded = requested.filter((x) => !priority.includes(x));

      return {
        eligible_scopes: input.eligible_scope_ids,
        preferred_scopes: preferred,
        excluded_scopes: excluded,
        scope_priority_order: priority,
        scope_confidence: priority.length > 0 ? 1 : 0
      };
    }
  };
};
