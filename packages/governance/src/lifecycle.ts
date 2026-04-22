import type { SharedLifecycleStatus } from "@orchestrator/core-foundation";
import type { GovernanceResultBase } from "./types.js";

export const LIFECYCLE_OUTCOMES = [
  "retain_active",
  "transition_status",
  "archive",
  "invalidate",
  "expire",
  "defer"
] as const;

export type LifecycleOutcome = (typeof LIFECYCLE_OUTCOMES)[number];

export interface LifecycleInput {
  current_status?: SharedLifecycleStatus;
  requested_status?: SharedLifecycleStatus;
  ttl_seconds?: number;
  retention_class?: "durable" | "transient";
}

export type LifecycleResult = GovernanceResultBase<"lifecycle_retention", LifecycleOutcome> & {
  next_status?: SharedLifecycleStatus;
  expires_in_seconds?: number;
};

export type LifecycleRule = (input: LifecycleInput) => LifecycleResult | undefined;

export interface LifecycleEvaluator {
  evaluate(input: LifecycleInput): LifecycleResult;
}

export const createLifecycleEvaluator = (rules: LifecycleRule[]): LifecycleEvaluator => {
  return {
    evaluate(input: LifecycleInput): LifecycleResult {
      for (const rule of rules) {
        const result = rule(input);
        if (result) {
          return result;
        }
      }

      return {
        domain: "lifecycle_retention",
        outcome: input.requested_status && input.requested_status !== input.current_status
          ? "transition_status"
          : "retain_active",
        ...(input.requested_status ?? input.current_status
          ? { next_status: (input.requested_status ?? input.current_status) }
          : {}),
        ...(input.ttl_seconds !== undefined ? { expires_in_seconds: input.ttl_seconds } : {}),
        applied_policies: [],
        warnings: [],
        risks: []
      };
    }
  };
};
