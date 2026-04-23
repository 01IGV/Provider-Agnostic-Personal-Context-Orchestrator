import type { AuditId, IsoDateTimeString } from "@orchestrator/core-foundation";
import {
  createExecutionAttemptTraceBuilder,
  type AuditTraceContext,
  type ExecutionAttemptAuditHookLinkage,
  type ExecutionAttemptTraceWarning
} from "@orchestrator/audit-eval";
import type {
  ContourExecutionAttemptShape,
  ExecutionAttemptWarningShape,
  ExecutionHandoffInputShape,
  ExecutionHandoffResultShape,
  ExecutionHandoffSummaryShape,
  ExecutionResultPlaceholderShape
} from "./execution-handoff-types.js";
import type { ExecutionAttemptBlockedReasonCode, ExecutionAttemptStatus } from "./execution-handoff-vocabularies.js";

const blockedReasonsFromGate = (
  input: ExecutionHandoffInputShape
): ExecutionAttemptBlockedReasonCode[] => {
  const reasons: ExecutionAttemptBlockedReasonCode[] = [];

  if (input.gate_result.status === "blocked") {
    reasons.push("blocked_by_gate_status");
  }

  if (input.gate_result.status === "missing_boundary") {
    reasons.push("blocked_by_missing_boundary");
  }

  if (input.gate_result.status === "unsupported_contour" || input.gate_result.status === "ambiguous_target") {
    reasons.push("blocked_by_unsupported_target");
  }

  if (input.gate_result.status === "eligible" && !input.gate_result.invocation_request) {
    reasons.push("blocked_by_missing_readiness");
  }

  if (
    input.gate_result.status === "eligible" &&
    input.gate_result.dispatch_linkage.planning_status === "deferred"
  ) {
    reasons.push("blocked_by_deferred_dispatch_status");
  }

  return Array.from(new Set(reasons));
};

const resolveAttemptStatus = (
  input: ExecutionHandoffInputShape,
  blockedReasonCodes: ExecutionAttemptBlockedReasonCode[]
): ExecutionAttemptStatus => {
  if (input.gate_result.status === "eligible" && blockedReasonCodes.length === 0) {
    return "ready_to_execute";
  }

  if (input.gate_result.status === "blocked") {
    return "blocked";
  }

  return "deferred";
};

const buildWarnings = (input: {
  handoffInput: ExecutionHandoffInputShape;
  blockedReasonCodes: ExecutionAttemptBlockedReasonCode[];
  attemptStatus: ExecutionAttemptStatus;
}): ExecutionAttemptWarningShape[] => {
  return [
    ...(input.handoffInput.gate_result.status === "eligible"
      ? []
      : [{ code: "gate_status_not_eligible", message: "contour gate status is not eligible for direct execution handoff" } as const]),
    ...(input.handoffInput.gate_result.invocation_request
      ? []
      : [{ code: "missing_gate_invocation_request", message: "gate result has no normalized invocation request placeholder" } as const]),
    ...(input.handoffInput.gate_result.result_expectation.expectation_status === "awaiting_execution_layer"
      ? [{ code: "expectation_placeholder_only", message: "execution result remains placeholder-only until future execution layer is materialized" } as const]
      : []),
    ...(input.blockedReasonCodes.includes("blocked_by_missing_readiness")
      ? [{ code: "readiness_not_strictly_ready", message: "execution handoff is missing required readiness signals from gate output" } as const]
      : []),
    ...(input.attemptStatus === "ready_to_execute"
      ? []
      : [{ code: "trace_hook_pending", message: "attempt is not ready and requires follow-up before execution hook activation" } as const])
  ];
};

const toPlaceholderStatus = (
  attemptStatus: ExecutionAttemptStatus
): ExecutionResultPlaceholderShape["placeholder_status"] => {
  if (attemptStatus === "ready_to_execute") {
    return "awaiting_execution";
  }

  if (attemptStatus === "blocked") {
    return "blocked_before_execution";
  }

  return "deferred_before_execution";
};

const buildTraceContext = (input: ExecutionHandoffInputShape, now: IsoDateTimeString): AuditTraceContext => {
  return {
    request_id: input.gate_result.request_id,
    created_at: now
  };
};

const buildAttempt = (input: {
  handoffInput: ExecutionHandoffInputShape;
  now: IsoDateTimeString;
  blockedReasonCodes: ExecutionAttemptBlockedReasonCode[];
  status: ExecutionAttemptStatus;
  warnings: ExecutionAttemptWarningShape[];
}): ContourExecutionAttemptShape | undefined => {
  const invocationRequest = input.handoffInput.gate_result.invocation_request;
  const boundaryReference = input.handoffInput.gate_result.dispatch_linkage.linked_boundary;
  const contourTarget =
    input.handoffInput.gate_result.dispatch_linkage.contour_target_resolution.contour_target ??
    invocationRequest?.contour_target;

  if (!contourTarget) {
    return undefined;
  }

  const requestId = input.handoffInput.gate_result.request_id;
  const operationId = input.handoffInput.gate_result.operation_id;
  const attemptId = `${requestId}:${operationId}:${contourTarget}:execution-attempt`;

  return {
    identifier: {
      attempt_id: attemptId,
      request_id: requestId,
      operation_id: operationId,
      contour_target: contourTarget
    },
    status: input.status,
    context: {
      dispatch_result_id: input.handoffInput.gate_result.dispatch_linkage.dispatch_result_id,
      gate_result_id: input.handoffInput.gate_result.gate_result_id,
      contour_target: contourTarget,
      ...(invocationRequest ? { invocation_request: invocationRequest } : {}),
      ...(boundaryReference ? { boundary_reference: boundaryReference } : {}),
      expected_result: input.handoffInput.gate_result.result_expectation,
      prepared_at: input.now
    },
    blocked_reason_codes: input.blockedReasonCodes,
    warnings: input.warnings
  };
};

const buildPlaceholder = (attempt: ContourExecutionAttemptShape): ExecutionResultPlaceholderShape => {
  return {
    attempt_id: attempt.identifier.attempt_id,
    request_id: attempt.identifier.request_id,
    operation_id: attempt.identifier.operation_id,
    contour_target: attempt.identifier.contour_target,
    expectation_status: attempt.context.expected_result.expectation_status,
    expected_result_kind: attempt.context.expected_result.expected_result_kind,
    placeholder_status: toPlaceholderStatus(attempt.status),
    notes: [
      "execution result placeholder emitted without contour pipeline invocation",
      "placeholder should be consumed by future execution layer contracts only"
    ]
  };
};

const buildAuditHookLinkage = (input: {
  attempt: ContourExecutionAttemptShape;
  now: IsoDateTimeString;
  linkedAuditId?: AuditId;
}): ExecutionAttemptAuditHookLinkage => {
  return {
    linkage_id: `${input.attempt.identifier.attempt_id}:audit-hook-linkage`,
    attempt_id: input.attempt.identifier.attempt_id,
    request_id: input.attempt.identifier.request_id,
    operation_id: input.attempt.identifier.operation_id,
    contour_target: input.attempt.identifier.contour_target,
    ...(input.linkedAuditId ? { linked_audit_id: input.linkedAuditId } : {}),
    hook_status: input.linkedAuditId ? "audit_hook_linked" : "pending_audit_hook",
    linked_at: input.now,
    notes: [
      "execution handoff prepared audit-hook linkage as contract placeholder",
      ...(input.linkedAuditId ? ["linked audit id provided by caller"] : ["audit id will be linked by future execution/audit integration layer"])
    ]
  };
};

export interface ExecutionHandoffContractBuilder {
  build(input: ExecutionHandoffInputShape): ExecutionHandoffResultShape;
}

export interface ExecutionHandoffSummaryBuilder {
  summarize(input: { handoff_results: ExecutionHandoffResultShape[] }): ExecutionHandoffSummaryShape;
}

export const createExecutionHandoffContractBuilder = (): ExecutionHandoffContractBuilder => {
  const traceBuilder = createExecutionAttemptTraceBuilder();

  return {
    build(input: ExecutionHandoffInputShape): ExecutionHandoffResultShape {
      const now = input.now ?? ((new Date().toISOString() as unknown) as IsoDateTimeString);
      const blockedReasonCodes = blockedReasonsFromGate(input);
      const attemptStatus = resolveAttemptStatus(input, blockedReasonCodes);
      const warnings = buildWarnings({
        handoffInput: input,
        blockedReasonCodes,
        attemptStatus
      });
      const attempt = buildAttempt({
        handoffInput: input,
        now,
        blockedReasonCodes,
        status: attemptStatus,
        warnings
      });

      if (!attempt) {
        return {
          handoff_result_id: `${input.gate_result.gate_result_id}:execution-handoff`,
          status: input.gate_result.status === "unsupported_contour" ? "unsupported_target" : "missing_gate_result",
          gate_linkage: {
            linkage_id: `${input.gate_result.gate_result_id}:execution-linkage`,
            gate_result_id: input.gate_result.gate_result_id,
            attempt_id: `${input.gate_result.request_id}:${input.gate_result.operation_id}:missing-attempt`,
            request_id: input.gate_result.request_id,
            operation_id: input.gate_result.operation_id,
            linkage_notes: ["execution handoff could not resolve contour attempt identifier from gate output"]
          },
          gate_warnings: input.gate_result.eligibility.warnings,
          produced_at: now
        };
      }

      const placeholderResult = buildPlaceholder(attempt);
      const traceWarnings: ExecutionAttemptTraceWarning[] = warnings.map((warning) => ({
        code: warning.code === "trace_hook_pending" ? "attempt_status_requires_followup" : "gate_warning_forwarded",
        message: warning.message
      }));
      const trace = traceBuilder.build({
        trace_id: `${attempt.identifier.attempt_id}:trace`,
        attempt_id: attempt.identifier.attempt_id,
        request_id: attempt.identifier.request_id,
        operation_id: attempt.identifier.operation_id,
        contour_target: attempt.identifier.contour_target,
        attempt_status: attempt.status,
        blocked_reason_codes: attempt.blocked_reason_codes,
        expected_result_kind: placeholderResult.expected_result_kind,
        trace_context: buildTraceContext(input, now),
        warnings: traceWarnings,
        now
      });
      const auditHookLinkage = buildAuditHookLinkage({
        attempt,
        now,
        ...(input.linked_audit_id ? { linkedAuditId: input.linked_audit_id } : {})
      });

      const gateLinkage = {
        linkage_id: `${input.gate_result.gate_result_id}:execution-linkage`,
        gate_result_id: input.gate_result.gate_result_id,
        attempt_id: attempt.identifier.attempt_id,
        request_id: attempt.identifier.request_id,
        operation_id: attempt.identifier.operation_id,
        contour_target: attempt.identifier.contour_target,
        linkage_notes: [
          "contour gate result linked to execution attempt contract",
          "linkage remains execution-free and does not invoke contour pipelines"
        ]
      };

      if (attempt.status === "ready_to_execute") {
        return {
          handoff_result_id: `${input.gate_result.gate_result_id}:execution-handoff`,
          status: "ready_contract",
          gate_linkage: gateLinkage,
          attempt,
          ready_result: {
            status: "ready_contract",
            attempt,
            ready_for_future_execution_layer: true,
            placeholder_result: placeholderResult
          },
          placeholder_result: placeholderResult,
          trace_contract: { trace, warnings: traceWarnings },
          audit_hook_linkage: { audit_hook_linkage: auditHookLinkage, hook_status: auditHookLinkage.hook_status },
          gate_warnings: input.gate_result.eligibility.warnings,
          produced_at: now
        };
      }

      if (attempt.status === "blocked") {
        return {
          handoff_result_id: `${input.gate_result.gate_result_id}:execution-handoff`,
          status: "blocked_contract",
          gate_linkage: gateLinkage,
          attempt,
          blocked_result: {
            status: "blocked_contract",
            attempt,
            blocked_reason_codes: attempt.blocked_reason_codes,
            placeholder_result: placeholderResult
          },
          placeholder_result: placeholderResult,
          trace_contract: { trace, warnings: traceWarnings },
          audit_hook_linkage: { audit_hook_linkage: auditHookLinkage, hook_status: auditHookLinkage.hook_status },
          gate_warnings: input.gate_result.eligibility.warnings,
          produced_at: now
        };
      }

      return {
        handoff_result_id: `${input.gate_result.gate_result_id}:execution-handoff`,
        status: "deferred_contract",
        gate_linkage: gateLinkage,
        attempt,
        deferred_result: {
          status: "deferred_contract",
          attempt,
          defer_reason_codes: attempt.blocked_reason_codes,
          placeholder_result: placeholderResult
        },
        placeholder_result: placeholderResult,
        trace_contract: { trace, warnings: traceWarnings },
        audit_hook_linkage: { audit_hook_linkage: auditHookLinkage, hook_status: auditHookLinkage.hook_status },
        gate_warnings: input.gate_result.eligibility.warnings,
        produced_at: now
      };
    }
  };
};

export const createExecutionHandoffSummaryBuilder = (): ExecutionHandoffSummaryBuilder => {
  return {
    summarize(input: { handoff_results: ExecutionHandoffResultShape[] }): ExecutionHandoffSummaryShape {
      const warnings = input.handoff_results.flatMap((result) => result.attempt?.warnings ?? []);

      return {
        total: input.handoff_results.length,
        ready_contracts: input.handoff_results.filter((item) => item.status === "ready_contract").length,
        blocked_contracts: input.handoff_results.filter((item) => item.status === "blocked_contract").length,
        deferred_contracts: input.handoff_results.filter((item) => item.status === "deferred_contract").length,
        missing_gate_results: input.handoff_results.filter((item) => item.status === "missing_gate_result").length,
        unsupported_targets: input.handoff_results.filter((item) => item.status === "unsupported_target").length,
        warnings
      };
    }
  };
};
