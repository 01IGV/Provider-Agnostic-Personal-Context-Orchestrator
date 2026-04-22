import type { DomainEntityId } from "@orchestrator/core-domain";
import type { GovernanceResultBase } from "./types.js";

export const CONFLICT_OUTCOMES = [
  "no_conflict",
  "conflict_detected",
  "preserve_both_with_markers",
  "supersede_existing",
  "reject_candidate",
  "defer"
] as const;

export type ConflictOutcome = (typeof CONFLICT_OUTCOMES)[number];

export interface ConflictInput {
  candidate_record_id?: DomainEntityId;
  conflicting_record_ids: DomainEntityId[];
  conflict_severity?: "low" | "medium" | "high";
}

export type ConflictResult = GovernanceResultBase<"conflict_handling", ConflictOutcome> & {
  affected_record_ids: DomainEntityId[];
};

export type ConflictRule = (input: ConflictInput) => ConflictResult | undefined;

export interface ConflictEvaluator {
  evaluate(input: ConflictInput): ConflictResult;
}

export const createConflictEvaluator = (rules: ConflictRule[]): ConflictEvaluator => {
  return {
    evaluate(input: ConflictInput): ConflictResult {
      for (const rule of rules) {
        const result = rule(input);
        if (result) {
          return result;
        }
      }

      return {
        domain: "conflict_handling",
        outcome: input.conflicting_record_ids.length > 0 ? "conflict_detected" : "no_conflict",
        affected_record_ids: input.conflicting_record_ids,
        applied_policies: [],
        warnings: [],
        risks: []
      };
    }
  };
};
