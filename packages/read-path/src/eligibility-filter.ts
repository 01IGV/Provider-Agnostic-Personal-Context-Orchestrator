import type { AdmissibilityEvaluator } from "@orchestrator/governance";
import type { CandidatePool, CandidatePoolEntry } from "./candidate-discovery.js";

export const ELIGIBILITY_REJECTION_REASONS = [
  "scope_mismatch",
  "visibility_restricted",
  "stale_or_expired",
  "invalidated_or_archived",
  "low_confidence",
  "duplicate",
  "policy_rejection",
  "structural_invalidity"
] as const;

export type EligibilityRejectionReason = (typeof ELIGIBILITY_REJECTION_REASONS)[number];

export interface EligibilityRejectedEntry {
  entry: CandidatePoolEntry;
  reason: EligibilityRejectionReason;
}

export interface EligibilityFilterResult {
  eligible: CandidatePoolEntry[];
  rejected: EligibilityRejectedEntry[];
}

export interface EligibilityFilterInput {
  candidate_pool: CandidatePool;
}

export interface EligibilityFilter {
  filter(input: EligibilityFilterInput): EligibilityFilterResult;
}

export const createEligibilityFilter = (
  admissibilityEvaluator: AdmissibilityEvaluator
): EligibilityFilter => {
  return {
    filter(input: EligibilityFilterInput): EligibilityFilterResult {
      const eligible: CandidatePoolEntry[] = [];
      const rejected: EligibilityRejectedEntry[] = [];

      for (const entry of input.candidate_pool.entries) {
        const admissibility = admissibilityEvaluator.evaluate({
          is_structurally_valid: true,
          is_scope_allowed: true,
          is_policy_compatible: true,
          confidence: 1
        });

        if (admissibility.outcome === "admissible") {
          eligible.push(entry);
        } else {
          rejected.push({
            entry,
            reason: admissibility.rejection_reason === "reject_scope"
              ? "scope_mismatch"
              : admissibility.rejection_reason === "reject_low_confidence"
                ? "low_confidence"
                : admissibility.rejection_reason === "reject_policy"
                  ? "policy_rejection"
                  : "structural_invalidity"
          });
        }
      }

      return { eligible, rejected };
    }
  };
};
