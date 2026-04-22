import type { CandidatePoolEntry } from "./candidate-discovery.js";
import type { EligibilityFilterResult } from "./eligibility-filter.js";

export const READ_PRIORITY_CLASSES = ["critical", "high", "medium", "low"] as const;
export type ReadPriorityClass = (typeof READ_PRIORITY_CLASSES)[number];

export const SELECTION_REASONS = [
  "scope_priority",
  "continuation_relevance",
  "state_relevance",
  "recency_relevance",
  "relation_relevance",
  "policy_allowed"
] as const;

export type SelectionReason = (typeof SELECTION_REASONS)[number];

export interface RankedCandidate {
  entry: CandidatePoolEntry;
  score: number;
  priority_class: ReadPriorityClass;
  selection_reasons: SelectionReason[];
}

export interface RankedSelectionResult {
  ranked_candidates: RankedCandidate[];
  selected_candidates: RankedCandidate[];
  omitted_candidates: RankedCandidate[];
}

export interface RankingSelectionInput {
  eligibility_result: EligibilityFilterResult;
  max_selected: number;
}

export interface RankingSelector {
  rank_and_select(input: RankingSelectionInput): RankedSelectionResult;
}

const priorityFromScore = (score: number): ReadPriorityClass => {
  if (score >= 0.9) {
    return "critical";
  }
  if (score >= 0.75) {
    return "high";
  }
  if (score >= 0.5) {
    return "medium";
  }
  return "low";
};

export const createRankingSelector = (): RankingSelector => {
  return {
    rank_and_select(input: RankingSelectionInput): RankedSelectionResult {
      const ranked = input.eligibility_result.eligible
        .map((entry, idx) => {
          const score = Math.max(0, 1 - idx * 0.03);
          return {
            entry,
            score,
            priority_class: priorityFromScore(score),
            selection_reasons: ["policy_allowed", "scope_priority"] as SelectionReason[]
          };
        })
        .sort((a, b) => b.score - a.score);

      const selected_candidates = ranked.slice(0, input.max_selected);
      const omitted_candidates = ranked.slice(input.max_selected);

      return {
        ranked_candidates: ranked,
        selected_candidates,
        omitted_candidates
      };
    }
  };
};
