import type { GovernanceResultBase } from "./types.js";

export const CAPABILITY_OUTCOMES = [
  "capability_allowed",
  "capability_restricted",
  "capability_denied",
  "defer"
] as const;

export type CapabilityOutcome = (typeof CAPABILITY_OUTCOMES)[number];

export interface CapabilityInput {
  requested_capability: string;
  allowed_capabilities: string[];
  restricted_capabilities?: string[];
}

export type CapabilityResult = GovernanceResultBase<"capability_governance", CapabilityOutcome>;

export type CapabilityRule = (input: CapabilityInput) => CapabilityResult | undefined;

export interface CapabilityEvaluator {
  evaluate(input: CapabilityInput): CapabilityResult;
}

export const createCapabilityEvaluator = (rules: CapabilityRule[]): CapabilityEvaluator => {
  return {
    evaluate(input: CapabilityInput): CapabilityResult {
      for (const rule of rules) {
        const result = rule(input);
        if (result) {
          return result;
        }
      }

      const denied = !input.allowed_capabilities.includes(input.requested_capability);
      const restricted = input.restricted_capabilities?.includes(input.requested_capability) ?? false;

      return {
        domain: "capability_governance",
        outcome: denied ? "capability_denied" : restricted ? "capability_restricted" : "capability_allowed",
        applied_policies: [],
        warnings: [],
        risks: [],
        ...(denied ? { rejection_reason: "reject_capability" as const } : {})
      };
    }
  };
};
