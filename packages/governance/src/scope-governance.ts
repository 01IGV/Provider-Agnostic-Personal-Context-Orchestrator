import type { ScopeId } from "@orchestrator/core-foundation";
import type { GovernanceResultBase } from "./types.js";

export const SCOPE_GOVERNANCE_OUTCOMES = ["allowed", "narrowed", "denied", "defer"] as const;
export type ScopeGovernanceOutcome = (typeof SCOPE_GOVERNANCE_OUTCOMES)[number];

export interface ScopeGovernanceInput {
  requested_scope_id: ScopeId;
  eligible_scope_ids: ScopeId[];
  preferred_scope_ids?: ScopeId[];
}

export type ScopeGovernanceResult = GovernanceResultBase<"scope_governance", ScopeGovernanceOutcome> & {
  selected_scope_id?: ScopeId;
};

export type ScopeGovernanceRule = (
  input: ScopeGovernanceInput
) => ScopeGovernanceResult | undefined;

export interface ScopeGovernanceEvaluator {
  evaluate(input: ScopeGovernanceInput): ScopeGovernanceResult;
}

export const createScopeGovernanceEvaluator = (
  rules: ScopeGovernanceRule[]
): ScopeGovernanceEvaluator => {
  return {
    evaluate(input: ScopeGovernanceInput): ScopeGovernanceResult {
      for (const rule of rules) {
        const result = rule(input);
        if (result) {
          return result;
        }
      }

      const allowed = input.eligible_scope_ids.includes(input.requested_scope_id);
      const selected_scope_id = allowed
        ? input.requested_scope_id
        : input.preferred_scope_ids?.[0] ?? input.eligible_scope_ids[0];

      return {
        domain: "scope_governance",
        outcome: allowed ? "allowed" : selected_scope_id ? "narrowed" : "denied",
        ...(selected_scope_id ? { selected_scope_id } : {}),
        applied_policies: [],
        warnings: [],
        risks: [],
        ...(selected_scope_id ? {} : { rejection_reason: "reject_scope" as const })
      };
    }
  };
};
