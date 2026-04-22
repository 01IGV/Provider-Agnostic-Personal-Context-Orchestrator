import type { GovernanceResultBase } from "./types.js";

export const ADMISSIBILITY_OUTCOMES = [
  "admissible",
  "reject_noise",
  "reject_invalid",
  "reject_policy",
  "reject_scope",
  "reject_low_confidence",
  "defer"
] as const;

export type AdmissibilityOutcome = (typeof ADMISSIBILITY_OUTCOMES)[number];

export interface AdmissibilityInput {
  grounding_score?: number;
  confidence?: number;
  is_structurally_valid: boolean;
  is_scope_allowed: boolean;
  is_policy_compatible: boolean;
  is_trivial?: boolean;
}

export type AdmissibilityResult = GovernanceResultBase<"admissibility", AdmissibilityOutcome>;

export type AdmissibilityRule = (input: AdmissibilityInput) => AdmissibilityResult | undefined;

export interface AdmissibilityEvaluator {
  evaluate(input: AdmissibilityInput): AdmissibilityResult;
}

export const createAdmissibilityEvaluator = (rules: AdmissibilityRule[]): AdmissibilityEvaluator => {
  return {
    evaluate(input: AdmissibilityInput): AdmissibilityResult {
      for (const rule of rules) {
        const result = rule(input);
        if (result) {
          return result;
        }
      }

      return {
        domain: "admissibility",
        outcome: "admissible",
        applied_policies: [],
        warnings: [],
        risks: []
      };
    }
  };
};
