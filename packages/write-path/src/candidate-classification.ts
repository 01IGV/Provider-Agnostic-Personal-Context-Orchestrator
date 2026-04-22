import type {
  CandidateClassificationResult,
  ClassificationResultSet,
  ExtractedCandidateDraft,
  WritePriority,
  WriteRouteFamily
} from "./types.js";

export interface CandidateClassificationInput {
  extracted_candidates: ExtractedCandidateDraft[];
}

export interface CandidateClassifier {
  classify(input: CandidateClassificationInput): ClassificationResultSet;
}

const routeFromDraft = (draft: ExtractedCandidateDraft): WriteRouteFamily => {
  if (draft.candidate_family === "state_candidate") {
    return "canonical_state_write";
  }
  if (draft.candidate_family === "summary_candidate") {
    return "derived_summary_refresh";
  }
  if (draft.candidate_family === "handoff_candidate") {
    return "derived_handoff_refresh";
  }
  if (draft.candidate_family === "audit_candidate") {
    return "audit_only";
  }
  if (draft.candidate_family === "no_write_candidate") {
    return "no_write";
  }
  return "canonical_memory_write";
};

const priorityFromDraft = (draft: ExtractedCandidateDraft): WritePriority => {
  const importance = draft.proposed_metadata.importance;
  if (typeof importance === "number") {
    if (importance >= 0.9) {
      return "critical";
    }
    if (importance >= 0.75) {
      return "high";
    }
    if (importance >= 0.5) {
      return "medium";
    }
  }
  return "low";
};

const toClassification = (draft: ExtractedCandidateDraft): CandidateClassificationResult => {
  const route = routeFromDraft(draft);

  return {
    candidate_id: draft.candidate_id,
    route_family: route,
    candidate_semantic_type:
      route === "canonical_memory_write"
        ? "memory"
        : route === "canonical_state_write"
          ? "state"
          : route === "derived_summary_refresh"
            ? "summary"
            : route === "derived_handoff_refresh"
              ? "handoff"
              : route === "audit_only"
                ? "audit"
                : "none",
    candidate_priority: priorityFromDraft(draft),
    expected_target_entity_type:
      route === "canonical_state_write"
        ? "state_object"
        : route === "derived_summary_refresh"
          ? "summary_artifact"
          : route === "derived_handoff_refresh"
            ? "handoff_artifact"
            : route === "audit_only"
              ? "audit_record"
              : route === "no_write"
                ? "none"
                : "memory_object",
    requires_conflict_check: route === "canonical_memory_write" || route === "canonical_state_write",
    requires_dedup_check: route === "canonical_memory_write" || route === "canonical_state_write",
    requires_policy_review: route !== "no_write"
  };
};

export const createCandidateClassifier = (): CandidateClassifier => {
  return {
    classify(input: CandidateClassificationInput): ClassificationResultSet {
      return {
        classifications: input.extracted_candidates.map((draft) => toClassification(draft))
      };
    }
  };
};
