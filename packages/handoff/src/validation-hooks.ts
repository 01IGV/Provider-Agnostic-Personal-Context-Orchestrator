import type {
  AdmissibilityEvaluator,
  PolicyEvaluationResult,
  ScopeGovernanceEvaluator,
  TransferEvaluator,
  VisibilityEvaluator
} from "@orchestrator/governance";
import type { ScopeId } from "@orchestrator/core-foundation";
import type { HandoffValidationInput, HandoffValidationResult } from "./types.js";

export interface HandoffValidationHook {
  validate(input: HandoffValidationInput): HandoffValidationResult;
}

export interface HandoffValidationHookDeps {
  admissibility_evaluator: AdmissibilityEvaluator;
  visibility_evaluator: VisibilityEvaluator;
  scope_evaluator: ScopeGovernanceEvaluator;
  transfer_evaluator: TransferEvaluator;
}

const toPolicyResult = (
  accepted: boolean,
  explanation: string
): PolicyEvaluationResult<{ accepted: boolean }> => {
  return {
    domain: "transfer_governance",
    outcome: accepted ? "allow" : "deny",
    payload: { accepted },
    applied_policies: [{ rule_key: "handoff_transfer_policy", effect: accepted ? "allow" : "deny", explanation }],
    warnings: [],
    risks: [],
    ...(accepted ? {} : { rejection_reason: "reject_transfer" })
  };
};

export const createHandoffValidationHook = (
  deps: HandoffValidationHookDeps
): HandoffValidationHook => {
  return {
    validate(input: HandoffValidationInput): HandoffValidationResult {
      if (!input.trigger.should_trigger) {
        return {
          accepted: false,
          outcome: "reject_handoff",
          warnings: [],
          rejection_reason: "handoff_trigger_not_satisfied"
        };
      }

      const requestedScopeId = input.scope_id as ScopeId;
      const scopeEval = deps.scope_evaluator.evaluate({
        requested_scope_id: requestedScopeId,
        eligible_scope_ids: [requestedScopeId]
      });

      const visibilityEval = deps.visibility_evaluator.evaluate({
        requested_visibility: input.requested_visibility ?? "subject_scoped",
        allowed_visibilities: ["private", "subject_scoped", "workspace_visible"]
      });

      const transferEval = deps.transfer_evaluator.evaluate({
        source_scope_id: requestedScopeId,
        target_scope_id: requestedScopeId,
        allows_cross_scope_transfer: input.target_boundary.target_context_type !== "next_provider"
      });

      const admissibilityEval = deps.admissibility_evaluator.evaluate({
        is_structurally_valid: input.packaging.source_record_ids.length > 0,
        is_scope_allowed: scopeEval.outcome !== "denied",
        is_policy_compatible: transferEval.outcome !== "transfer_denied",
        is_trivial: input.packaging.source_record_ids.length === 0,
        confidence: input.packaging.uncertainties.length > 0 ? 0.5 : 0.9
      });

      const accepted =
        admissibilityEval.outcome === "admissible" &&
        visibilityEval.outcome !== "denied" &&
        scopeEval.outcome !== "denied" &&
        transferEval.outcome !== "transfer_denied";

      const warnings = [
        ...input.packaging.warnings,
        ...(visibilityEval.outcome === "restricted"
          ? [{ code: "validation_restriction", note: "handoff visibility restricted by governance" } as const]
          : []),
        ...(scopeEval.outcome === "narrowed"
          ? [{ code: "scope_narrowed", note: "handoff scope narrowed by governance" } as const]
          : [])
      ];

      const policyResult = toPolicyResult(accepted, accepted ? "handoff validated" : "handoff rejected by governance checks");

      if (!accepted) {
        const rejectionReason =
          admissibilityEval.rejection_reason ?? visibilityEval.rejection_reason ?? transferEval.rejection_reason;
        return {
          accepted: false,
          outcome: "reject_handoff",
          policy_result: policyResult,
          warnings,
          ...(rejectionReason ? { rejection_reason: rejectionReason } : {})
        };
      }

      return {
        accepted: true,
        outcome: warnings.length > 0 ? "accept_with_warnings" : "accept_handoff",
        policy_result: policyResult,
        warnings
      };
    }
  };
};
