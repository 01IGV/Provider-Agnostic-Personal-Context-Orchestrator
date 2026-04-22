import type { VisibilityType } from "@orchestrator/core-foundation";
import type { GovernanceResultBase } from "./types.js";

export const VISIBILITY_OUTCOMES = ["visible", "restricted", "denied", "defer"] as const;
export type VisibilityOutcome = (typeof VISIBILITY_OUTCOMES)[number];

export interface VisibilityInput {
  requested_visibility: VisibilityType;
  allowed_visibilities: VisibilityType[];
  allow_restricted_projection?: boolean;
}

export type VisibilityResult = GovernanceResultBase<"visibility", VisibilityOutcome>;

export type VisibilityRule = (input: VisibilityInput) => VisibilityResult | undefined;

export interface VisibilityEvaluator {
  evaluate(input: VisibilityInput): VisibilityResult;
}

export const createVisibilityEvaluator = (rules: VisibilityRule[]): VisibilityEvaluator => {
  return {
    evaluate(input: VisibilityInput): VisibilityResult {
      for (const rule of rules) {
        const result = rule(input);
        if (result) {
          return result;
        }
      }

      const allowed = input.allowed_visibilities.includes(input.requested_visibility);
      return {
        domain: "visibility",
        outcome: allowed ? "visible" : "denied",
        applied_policies: [],
        warnings: [],
        risks: [],
        ...(allowed ? {} : { rejection_reason: "reject_visibility" as const })
      };
    }
  };
};
