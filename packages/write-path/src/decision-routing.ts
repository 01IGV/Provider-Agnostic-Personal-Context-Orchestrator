import type {
  CandidateDecisionLink,
  DecisionRoutingResult,
  ExtractedCandidateDraft,
  WriteDeferVocabulary,
  WriteRejectionVocabulary
} from "./types.js";

export interface DecisionRoutingInput {
  candidate: ExtractedCandidateDraft;
  decision_link: CandidateDecisionLink;
}

export interface DecisionRouter {
  route(input: DecisionRoutingInput): DecisionRoutingResult;
}

const mapRejectionReason = (reason: string | undefined): WriteRejectionVocabulary | undefined => {
  if (!reason) {
    return undefined;
  }

  if (reason === "reject_scope") {
    return "reject_scope";
  }
  if (reason === "reject_policy") {
    return "reject_policy";
  }
  if (reason === "reject_low_confidence") {
    return "reject_low_confidence";
  }
  return "reject_invalid";
};

const mapDeferReason = (reason: string | undefined): WriteDeferVocabulary | undefined => {
  if (reason === "policy_ambiguity") {
    return "policy_ambiguity";
  }
  if (reason === "conflict_unresolved") {
    return "conflict_unresolved";
  }
  if (reason === "insufficient_grounding") {
    return "insufficient_grounding";
  }
  return reason ? "requires_manual_review" : undefined;
};

export const createDecisionRouter = (): DecisionRouter => {
  return {
    route(input: DecisionRoutingInput): DecisionRoutingResult {
      const base: DecisionRoutingResult = {
        candidate_id: input.candidate.candidate_id,
        route_family:
          input.candidate.candidate_family === "state_candidate"
            ? "canonical_state_write"
            : input.candidate.candidate_family === "summary_candidate"
              ? "derived_summary_refresh"
              : input.candidate.candidate_family === "handoff_candidate"
                ? "derived_handoff_refresh"
                : input.candidate.candidate_family === "audit_candidate"
                  ? "audit_only"
                  : input.candidate.candidate_family === "no_write_candidate"
                    ? "no_write"
                    : "canonical_memory_write",
        decision_outcome: input.decision_link.decision.decision_outcome,
        mutation_intent: input.decision_link.decision.mutation_intent,
      };

      const rejection = mapRejectionReason(input.decision_link.decision.rejection_reason);
      const defer = mapDeferReason(input.decision_link.decision.defer_reason);

      return {
        ...base,
        ...(input.decision_link.decision.target_record_id
          ? { target_record_id: input.decision_link.decision.target_record_id }
          : {}),
        ...(rejection ? { rejection_reason: rejection } : {}),
        ...(defer ? { defer_reason: defer } : {})
      };
    }
  };
};
