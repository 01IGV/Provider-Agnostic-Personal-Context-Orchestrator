import {
  type AdmissibilityEvaluator,
  type CandidateGovernanceContext,
  type GovernanceDecisionEngine,
  type GovernanceDecisioningInput,
  type GovernanceDecisioningTrace
} from "@orchestrator/governance";
import { asCanonicalId, type ScopeId, type VisibilityType } from "@orchestrator/core-foundation";
import type {
  CandidateAdmissibilityLink,
  CandidateClassificationResult,
  CandidateDecisionLink,
  CandidateDedupConflictLink,
  ExtractedCandidateDraft
} from "./types.js";

export interface EligibilityHookInput {
  candidate: ExtractedCandidateDraft;
}

export interface EligibilityGovernanceHook {
  evaluate(input: EligibilityHookInput): CandidateAdmissibilityLink;
}

const confidenceFromCandidate = (candidate: ExtractedCandidateDraft): number | undefined => {
  const raw = candidate.proposed_metadata.confidence;
  return typeof raw === "number" ? raw : undefined;
};

export const createEligibilityGovernanceHook = (
  admissibility_evaluator: AdmissibilityEvaluator
): EligibilityGovernanceHook => {
  return {
    evaluate(input: EligibilityHookInput): CandidateAdmissibilityLink {
      const contentSize = Object.keys(input.candidate.content).length;
      const confidence = confidenceFromCandidate(input.candidate);
      return {
        candidate_id: input.candidate.candidate_id,
        admissibility: admissibility_evaluator.evaluate({
          is_structurally_valid: contentSize > 0,
          is_scope_allowed: true,
          is_policy_compatible: true,
          ...(confidence !== undefined ? { confidence } : {}),
          is_trivial: contentSize === 0
        })
      };
    }
  };
};

export interface DecisioningHookInput {
  candidate: ExtractedCandidateDraft;
  classification: CandidateClassificationResult;
  admissibility_link: CandidateAdmissibilityLink;
  dedup_conflict_link?: CandidateDedupConflictLink;
  governance_context?: CandidateGovernanceContext;
}

export interface DecisioningGovernanceHook {
  decide(input: DecisioningHookInput): CandidateDecisionLink;
}

const fallbackScope = (candidate: ExtractedCandidateDraft): ScopeId => {
  return candidate.scope_id ?? asCanonicalId<"scope_id">("global_user");
};

const defaultAllowedVisibilities: VisibilityType[] = ["private", "subject_scoped", "workspace_visible"];

const buildGovernanceDecisioningInput = (
  input: DecisioningHookInput
): GovernanceDecisioningInput => {
  const scopeId = fallbackScope(input.candidate);
  const confidence = confidenceFromCandidate(input.candidate);
  const dedupKey = input.candidate.proposed_metadata.dedup_key as string | undefined;

  return {
    admissibility: {
      is_structurally_valid: input.admissibility_link.admissibility.outcome === "admissible",
      is_scope_allowed: true,
      is_policy_compatible: true,
      ...(confidence !== undefined ? { confidence } : {})
    },
    visibility: {
      requested_visibility: (input.candidate.proposed_metadata.visibility as VisibilityType | undefined) ?? "private",
      allowed_visibilities: defaultAllowedVisibilities
    },
    scope: {
      requested_scope_id: scopeId,
      eligible_scope_ids: [scopeId]
    },
    lifecycle: {
      requested_status: (input.candidate.proposed_metadata.requested_status as
        | "active"
        | "tentative"
        | "pending"
        | "superseded"
        | "archived"
        | "invalidated"
        | "completed"
        | undefined) ?? "active",
      retention_class: input.classification.route_family === "canonical_state_write" ? "transient" : "durable"
    },
    dedup: {
      ...(dedupKey ? { dedup_key: dedupKey } : {}),
      candidate_signature: JSON.stringify(input.candidate.content),
      existing_signatures: input.dedup_conflict_link?.dedup?.matched_record_id
        ? [{
            record_id: input.dedup_conflict_link.dedup.matched_record_id,
            signature: JSON.stringify(input.candidate.content)
          }]
        : []
    },
    conflict: {
      ...(input.dedup_conflict_link?.dedup?.matched_record_id
        ? { candidate_record_id: input.dedup_conflict_link.dedup.matched_record_id }
        : {}),
      conflicting_record_ids: input.dedup_conflict_link?.conflict?.affected_record_ids ?? []
    },
    transfer: {
      source_scope_id: scopeId,
      target_scope_id: scopeId,
      allows_cross_scope_transfer: false
    },
    capability: {
      requested_capability: "write_candidate",
      allowed_capabilities: ["write_candidate"]
    }
  };
};

const normalizedTrace = (trace: GovernanceDecisioningTrace): GovernanceDecisioningTrace => {
  return trace;
};

export const createDecisioningGovernanceHook = (
  governance_decision_engine: GovernanceDecisionEngine
): DecisioningGovernanceHook => {
  return {
    decide(input: DecisioningHookInput): CandidateDecisionLink {
      const decisioningInput = buildGovernanceDecisioningInput(input);
      const result = governance_decision_engine.decide(decisioningInput);

      return {
        candidate_id: input.candidate.candidate_id,
        decision: result.result,
        trace: normalizedTrace(result.trace)
      };
    }
  };
};
