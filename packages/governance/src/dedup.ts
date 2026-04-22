import type { DomainEntityId } from "@orchestrator/core-domain";
import type { GovernanceResultBase } from "./types.js";

export const DEDUP_OUTCOMES = [
  "no_match",
  "exact_duplicate",
  "merge_recommended",
  "update_existing_recommended",
  "defer"
] as const;

export type DedupOutcome = (typeof DEDUP_OUTCOMES)[number];

export interface DedupInput {
  dedup_key?: string;
  candidate_signature: string;
  existing_signatures: Array<{ record_id: DomainEntityId; signature: string }>;
}

export type DedupResult = GovernanceResultBase<"deduplication", DedupOutcome> & {
  matched_record_id?: DomainEntityId;
};

export type DedupRule = (input: DedupInput) => DedupResult | undefined;

export interface DedupEvaluator {
  evaluate(input: DedupInput): DedupResult;
}

export const createDedupEvaluator = (rules: DedupRule[]): DedupEvaluator => {
  return {
    evaluate(input: DedupInput): DedupResult {
      for (const rule of rules) {
        const result = rule(input);
        if (result) {
          return result;
        }
      }

      const exact = input.existing_signatures.find((x) => x.signature === input.candidate_signature);
      return {
        domain: "deduplication",
        outcome: exact ? "exact_duplicate" : "no_match",
        ...(exact ? { matched_record_id: exact.record_id } : {}),
        applied_policies: [],
        warnings: [],
        risks: []
      };
    }
  };
};
