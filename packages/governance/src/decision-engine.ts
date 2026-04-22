import type {
  AdmissibilityEvaluator,
  AdmissibilityInput,
  AdmissibilityResult
} from "./admissibility.js";
import type { CapabilityEvaluator, CapabilityInput, CapabilityResult } from "./capability-governance.js";
import type { ConflictEvaluator, ConflictInput, ConflictResult } from "./conflict.js";
import type { DedupEvaluator, DedupInput, DedupResult } from "./dedup.js";
import type { LifecycleEvaluator, LifecycleInput, LifecycleResult } from "./lifecycle.js";
import type { ScopeGovernanceEvaluator, ScopeGovernanceInput, ScopeGovernanceResult } from "./scope-governance.js";
import type { TransferEvaluator, TransferInput, TransferResult } from "./transfer-governance.js";
import type { VisibilityEvaluator, VisibilityInput, VisibilityResult } from "./visibility.js";
import type { DecisioningResult, GovernanceDomain } from "./types.js";

export interface GovernanceDecisioningInput {
  admissibility: AdmissibilityInput;
  visibility: VisibilityInput;
  scope: ScopeGovernanceInput;
  lifecycle: LifecycleInput;
  dedup: DedupInput;
  conflict: ConflictInput;
  transfer: TransferInput;
  capability: CapabilityInput;
}

export interface GovernanceDecisioningTrace {
  admissibility: AdmissibilityResult;
  visibility: VisibilityResult;
  scope: ScopeGovernanceResult;
  lifecycle: LifecycleResult;
  dedup: DedupResult;
  conflict: ConflictResult;
  transfer: TransferResult;
  capability: CapabilityResult;
}

export interface GovernanceDecisionEngine {
  decide(input: GovernanceDecisioningInput): { result: DecisioningResult; trace: GovernanceDecisioningTrace };
}

export interface GovernanceDecisionEnginePrimitives {
  admissibility: AdmissibilityEvaluator;
  visibility: VisibilityEvaluator;
  scope: ScopeGovernanceEvaluator;
  lifecycle: LifecycleEvaluator;
  dedup: DedupEvaluator;
  conflict: ConflictEvaluator;
  transfer: TransferEvaluator;
  capability: CapabilityEvaluator;
}

const DOMAIN_PRIORITY: GovernanceDomain[] = [
  "admissibility",
  "scope_governance",
  "visibility",
  "capability_governance",
  "conflict_handling",
  "transfer_governance",
  "deduplication",
  "lifecycle_retention"
];

export const createGovernanceDecisionEngine = (
  primitives: GovernanceDecisionEnginePrimitives
): GovernanceDecisionEngine => {
  return {
    decide(input: GovernanceDecisioningInput) {
      const trace: GovernanceDecisioningTrace = {
        admissibility: primitives.admissibility.evaluate(input.admissibility),
        visibility: primitives.visibility.evaluate(input.visibility),
        scope: primitives.scope.evaluate(input.scope),
        lifecycle: primitives.lifecycle.evaluate(input.lifecycle),
        dedup: primitives.dedup.evaluate(input.dedup),
        conflict: primitives.conflict.evaluate(input.conflict),
        transfer: primitives.transfer.evaluate(input.transfer),
        capability: primitives.capability.evaluate(input.capability)
      };

      const ordered = [
        trace.admissibility,
        trace.scope,
        trace.visibility,
        trace.capability,
        trace.conflict,
        trace.transfer,
        trace.dedup,
        trace.lifecycle
      ].sort((a, b) => DOMAIN_PRIORITY.indexOf(a.domain) - DOMAIN_PRIORITY.indexOf(b.domain));

      const denied = ordered.find((x) =>
        [
          "reject_noise",
          "reject_invalid",
          "reject_policy",
          "reject_scope",
          "reject_low_confidence",
          "denied",
          "capability_denied",
          "transfer_denied",
          "reject_candidate"
        ].includes(x.outcome)
      );

      const deferred = ordered.find((x) => x.outcome === "defer");
      const reviewRequired = ordered.find((x) => x.review_needed?.required);

      if (denied) {
        return {
          result: {
            domain: denied.domain,
            outcome: "rejected",
            decision_outcome: "rejected",
            mutation_intent: "none",
            applied_policies: denied.applied_policies,
            warnings: denied.warnings,
            risks: denied.risks,
            ...(denied.rejection_reason ? { rejection_reason: denied.rejection_reason } : {})
          },
          trace
        };
      }

      if (reviewRequired) {
        return {
          result: {
            domain: reviewRequired.domain,
            outcome: "review_required",
            decision_outcome: "review_required",
            mutation_intent: "none",
            applied_policies: reviewRequired.applied_policies,
            warnings: reviewRequired.warnings,
            risks: reviewRequired.risks,
            ...(reviewRequired.review_needed ? { review_needed: reviewRequired.review_needed } : {})
          },
          trace
        };
      }

      if (deferred) {
        return {
          result: {
            domain: deferred.domain,
            outcome: "deferred",
            decision_outcome: "deferred",
            mutation_intent: "none",
            applied_policies: deferred.applied_policies,
            warnings: deferred.warnings,
            risks: deferred.risks,
            ...(deferred.defer_reason ? { defer_reason: deferred.defer_reason } : {})
          },
          trace
        };
      }

      const dedupOutcome = trace.dedup.outcome;
      const mutation_intent =
        dedupOutcome === "exact_duplicate"
          ? "none"
          : dedupOutcome === "update_existing_recommended"
            ? "update"
            : dedupOutcome === "merge_recommended"
              ? "merge"
              : trace.lifecycle.outcome === "archive"
                ? "archive"
                : "create";

      const decision_outcome =
        mutation_intent === "update"
          ? "updated_existing"
          : mutation_intent === "merge"
            ? "merged"
            : mutation_intent === "archive"
              ? "archived"
              : "accepted";

      return {
        result: {
          domain: "admissibility",
          outcome: decision_outcome,
          decision_outcome,
          mutation_intent,
          ...(trace.dedup.matched_record_id ? { target_record_id: trace.dedup.matched_record_id } : {}),
          applied_policies: ordered.flatMap((x) => x.applied_policies),
          warnings: ordered.flatMap((x) => x.warnings),
          risks: ordered.flatMap((x) => x.risks)
        },
        trace
      };
    }
  };
};
