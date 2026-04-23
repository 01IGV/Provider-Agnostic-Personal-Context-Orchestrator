import type { IsoDateTimeString } from "@orchestrator/core-foundation";
import {
  createCompletionIngressAuditLinkageBuilder,
  createCompletionIngressTraceBuilder,
  type CompletionIngressTraceStatus,
  type CompletionIngressTraceWarning
} from "@orchestrator/audit-eval";
import type {
  CompletionToReconciliationIngressShape,
  ExecutionCompletionIngressInputShape,
  ExecutionCompletionIngressResultShape,
  ExecutionCompletionIngressSummaryShape,
  CompletionIngressWarningShape,
  CompletionValidationResultShape
} from "./execution-completion-ingress-types.js";
import type {
  CompletionArtifactFamily,
  CompletionRejectionReasonCode,
  CompletionValidationStatus
} from "./execution-completion-ingress-vocabularies.js";

const inferExpectedFamilyFromHandoff = (input: ExecutionCompletionIngressInputShape): CompletionArtifactFamily => {
  const target = input.handoff_result.gate_linkage.contour_target;
  if (target === "read_path") return "read_path";
  if (target === "pack_loop") return "pack_loop";
  if (target === "write_path") return "write_path";
  if (target === "handoff") return "handoff";
  return "unknown";
};

const hasArtifactPayload = (payload: Record<string, unknown>): boolean => Object.keys(payload).length > 0;

const collectReasons = (input: {
  handoffInput: ExecutionCompletionIngressInputShape;
  expectedFamily: CompletionArtifactFamily;
}): CompletionRejectionReasonCode[] => {
  const reasons: CompletionRejectionReasonCode[] = [];
  const { completion_envelope: completionEnvelope, handoff_result: handoffResult } = input.handoffInput;

  if (!completionEnvelope.completion_envelope_id) {
    reasons.push("missing_completion_envelope");
  }

  if (completionEnvelope.request_id !== handoffResult.gate_linkage.request_id) {
    reasons.push("identifier_mismatch");
  }

  if (completionEnvelope.operation_id !== handoffResult.gate_linkage.operation_id) {
    reasons.push("identifier_mismatch");
  }

  const handoffAttemptId = handoffResult.attempt?.identifier.attempt_id;
  if (!handoffAttemptId) {
    reasons.push("missing_attempt_linkage");
  }

  if (completionEnvelope.attempt_id && handoffAttemptId && completionEnvelope.attempt_id !== handoffAttemptId) {
    reasons.push("identifier_mismatch");
  }

  if (handoffResult.status !== "ready_contract" && handoffResult.status !== "deferred_contract") {
    reasons.push("handoff_not_eligible_for_completion");
  }

  if (!handoffResult.placeholder_result) {
    reasons.push("handoff_placeholder_missing");
  }

  if (!hasArtifactPayload(completionEnvelope.artifact_payload)) {
    reasons.push("artifact_payload_missing");
  }

  if (
    completionEnvelope.contour_target &&
    handoffResult.gate_linkage.contour_target &&
    completionEnvelope.contour_target !== handoffResult.gate_linkage.contour_target
  ) {
    reasons.push("contour_target_mismatch");
  }

  if (
    input.expectedFamily !== "unknown" &&
    completionEnvelope.completion_family !== "unknown" &&
    completionEnvelope.completion_family !== input.expectedFamily
  ) {
    reasons.push("artifact_family_mismatch");
  }

  return Array.from(new Set(reasons));
};

const resolveValidationStatus = (reasons: CompletionRejectionReasonCode[]): CompletionValidationStatus => {
  if (
    reasons.includes("identifier_mismatch") ||
    reasons.includes("contour_target_mismatch") ||
    reasons.includes("artifact_family_mismatch")
  ) {
    return "mismatched";
  }

  if (reasons.includes("artifact_payload_missing") || reasons.includes("missing_completion_envelope")) {
    return "incomplete";
  }

  if (
    reasons.includes("missing_attempt_linkage") ||
    reasons.includes("handoff_not_eligible_for_completion") ||
    reasons.includes("handoff_placeholder_missing")
  ) {
    return "rejected";
  }

  return "accepted";
};

const buildWarnings = (input: {
  handoffInput: ExecutionCompletionIngressInputShape;
  validationStatus: CompletionValidationStatus;
}): CompletionIngressWarningShape[] => {
  const { completion_envelope: completionEnvelope } = input.handoffInput;

  return [
    ...(completionEnvelope.attempt_id
      ? []
      : [
          {
            code: "completion_envelope_missing_attempt_id",
            message: "completion envelope did not provide attempt_id; linkage falls back to handoff attempt contract"
          } as const
        ]),
    ...(completionEnvelope.contour_target
      ? []
      : [
          {
            code: "completion_envelope_missing_contour_target",
            message: "completion envelope did not provide contour_target; boundary alignment uses handoff linkage"
          } as const
        ]),
    ...(input.validationStatus === "incomplete"
      ? [{ code: "completion_artifact_incomplete", message: "completion artifact is structurally incomplete for reconciliation ingress" } as const]
      : []),
    ...(input.validationStatus === "mismatched"
      ? [{ code: "completion_artifact_ambiguous", message: "completion artifact mismatched handoff linkage or expected completion family" } as const]
      : []),
    ...(input.validationStatus === "accepted"
      ? [{ code: "completion_forwarded_to_reconciliation", message: "accepted completion artifact is prepared for reconciliation boundary" } as const]
      : [{ code: "completion_not_forwarded_to_reconciliation", message: "completion artifact is not forwarded to reconciliation due to validation outcome" } as const])
  ];
};

const buildValidation = (input: {
  handoffInput: ExecutionCompletionIngressInputShape;
  now: IsoDateTimeString;
  expectedFamily: CompletionArtifactFamily;
}): CompletionValidationResultShape => {
  const reasons = collectReasons({ handoffInput: input.handoffInput, expectedFamily: input.expectedFamily });
  const status = resolveValidationStatus(reasons);
  const warnings = buildWarnings({ handoffInput: input.handoffInput, validationStatus: status });

  return {
    validation_id: `${input.handoffInput.completion_envelope.completion_envelope_id}:completion-validation`,
    status,
    reasons,
    warnings
  };
};

const toIngressStatus = (status: CompletionValidationStatus): ExecutionCompletionIngressResultShape["status"] => {
  if (status === "accepted") return "accepted_completion";
  if (status === "incomplete") return "incomplete_completion";
  if (status === "mismatched") return "mismatched_completion";
  return "rejected_completion";
};

const toTraceWarnings = (warnings: CompletionIngressWarningShape[]): CompletionIngressTraceWarning[] => {
  return warnings.map((warning) => {
    if (warning.code === "completion_artifact_incomplete") {
      return { code: "completion_shape_incomplete", message: warning.message };
    }

    if (warning.code === "completion_artifact_ambiguous") {
      return { code: "completion_shape_mismatch", message: warning.message };
    }

    if (warning.code === "completion_forwarded_to_reconciliation") {
      return { code: "completion_reconciliation_forwarded", message: warning.message };
    }

    if (warning.code === "completion_not_forwarded_to_reconciliation") {
      return { code: "completion_reconciliation_not_forwarded", message: warning.message };
    }

    return { code: "completion_missing_attempt_linkage", message: warning.message };
  });
};

const buildReconciliationIngress = (input: {
  handoffInput: ExecutionCompletionIngressInputShape;
  now: IsoDateTimeString;
}): CompletionToReconciliationIngressShape => {
  const { handoff_result: handoffResult, completion_envelope: completionEnvelope } = input.handoffInput;

  return {
    ingress_id: `${completionEnvelope.completion_envelope_id}:reconciliation-ingress`,
    request_id: handoffResult.gate_linkage.request_id,
    operation_id: handoffResult.gate_linkage.operation_id,
    completion_family: completionEnvelope.completion_family,
    reconciliation_input: {
      handoff_result: handoffResult,
      ...(input.handoffInput.linked_audit_id ? { linked_audit_id: input.handoffInput.linked_audit_id } : {}),
      now: input.now
    },
    completion_payload: completionEnvelope.artifact_payload,
    forwarded_at: input.now,
    notes: [
      "completion ingress forwards accepted completion artifact into reconciliation boundary contracts",
      "ingress remains contract-only and does not execute contour pipelines"
    ]
  };
};

export interface ExecutionCompletionIngressBuilder {
  ingest(input: ExecutionCompletionIngressInputShape): ExecutionCompletionIngressResultShape;
}

export interface ExecutionCompletionIngressSummaryBuilder {
  summarize(input: { ingress_results: ExecutionCompletionIngressResultShape[] }): ExecutionCompletionIngressSummaryShape;
}

export const createExecutionCompletionIngressBuilder = (): ExecutionCompletionIngressBuilder => {
  const traceBuilder = createCompletionIngressTraceBuilder();
  const auditLinkageBuilder = createCompletionIngressAuditLinkageBuilder();

  return {
    ingest(input: ExecutionCompletionIngressInputShape): ExecutionCompletionIngressResultShape {
      const now =
        input.completion_envelope.received_at ??
        input.now ??
        ((new Date().toISOString() as unknown) as IsoDateTimeString);
      const expectedFamily = inferExpectedFamilyFromHandoff(input);
      const validation = buildValidation({ handoffInput: input, now, expectedFamily });
      const status = toIngressStatus(validation.status);
      const warnings = validation.warnings;
      const traceWarnings = toTraceWarnings(warnings);

      const attemptId = input.handoff_result.attempt?.identifier.attempt_id;
      const linkageStatus =
        validation.status === "mismatched"
          ? "mismatched"
          : validation.reasons.includes("missing_attempt_linkage")
            ? "missing_attempt"
            : "linked";

      const attemptLinkage = {
        linkage_id: `${input.completion_envelope.completion_envelope_id}:attempt-linkage`,
        handoff_result_id: input.handoff_result.handoff_result_id,
        completion_envelope_id: input.completion_envelope.completion_envelope_id,
        request_id: input.handoff_result.gate_linkage.request_id,
        operation_id: input.handoff_result.gate_linkage.operation_id,
        ...(attemptId ? { attempt_id: attemptId } : {}),
        linkage_status: linkageStatus,
        linked_at: now,
        warnings
      } as const;

      const traceStatus = status as CompletionIngressTraceStatus;
      const trace = traceBuilder.build({
        trace_id: `${input.completion_envelope.completion_envelope_id}:completion-trace`,
        completion_envelope_id: input.completion_envelope.completion_envelope_id,
        request_id: input.handoff_result.gate_linkage.request_id,
        operation_id: input.handoff_result.gate_linkage.operation_id,
        ingress_status: traceStatus,
        ...(attemptId ? { attempt_id: attemptId } : {}),
        ...(input.handoff_result.gate_linkage.contour_target
          ? { contour_target: input.handoff_result.gate_linkage.contour_target }
          : {}),
        warnings: traceWarnings,
        now
      });

      const auditLinkage = auditLinkageBuilder.build({
        linkage_id: `${input.completion_envelope.completion_envelope_id}:completion-audit-linkage`,
        completion_envelope_id: input.completion_envelope.completion_envelope_id,
        request_id: input.handoff_result.gate_linkage.request_id,
        operation_id: input.handoff_result.gate_linkage.operation_id,
        ingress_status: traceStatus,
        ...(attemptId ? { attempt_id: attemptId } : {}),
        ...(input.handoff_result.gate_linkage.contour_target
          ? { contour_target: input.handoff_result.gate_linkage.contour_target }
          : {}),
        ...(input.linked_audit_id ? { linked_audit_id: input.linked_audit_id } : {}),
        warnings: traceWarnings,
        now
      });

      if (status === "accepted_completion") {
        return {
          ingress_result_id: `${input.completion_envelope.completion_envelope_id}:completion-ingress`,
          status,
          handoff_result_id: input.handoff_result.handoff_result_id,
          request_id: input.handoff_result.gate_linkage.request_id,
          operation_id: input.handoff_result.gate_linkage.operation_id,
          completion_family: input.completion_envelope.completion_family,
          outcome: {
            status,
            attempt_linkage: attemptLinkage,
            validation,
            completion_envelope: input.completion_envelope,
            reconciliation_ingress: buildReconciliationIngress({ handoffInput: input, now })
          },
          trace,
          trace_warnings: traceWarnings,
          audit_linkage: auditLinkage,
          warnings,
          processed_at: now
        };
      }

      return {
        ingress_result_id: `${input.completion_envelope.completion_envelope_id}:completion-ingress`,
        status,
        handoff_result_id: input.handoff_result.handoff_result_id,
        request_id: input.handoff_result.gate_linkage.request_id,
        operation_id: input.handoff_result.gate_linkage.operation_id,
        completion_family: input.completion_envelope.completion_family,
        outcome: {
          status,
          attempt_linkage: attemptLinkage,
          validation,
          completion_envelope: input.completion_envelope
        },
        trace,
        trace_warnings: traceWarnings,
        audit_linkage: auditLinkage,
        warnings,
        processed_at: now
      };
    }
  };
};

export const createExecutionCompletionIngressSummaryBuilder = (): ExecutionCompletionIngressSummaryBuilder => {
  return {
    summarize(input: { ingress_results: ExecutionCompletionIngressResultShape[] }): ExecutionCompletionIngressSummaryShape {
      return {
        total: input.ingress_results.length,
        accepted_completion: input.ingress_results.filter((item) => item.status === "accepted_completion").length,
        rejected_completion: input.ingress_results.filter((item) => item.status === "rejected_completion").length,
        incomplete_completion: input.ingress_results.filter((item) => item.status === "incomplete_completion").length,
        mismatched_completion: input.ingress_results.filter((item) => item.status === "mismatched_completion").length,
        warnings: input.ingress_results.flatMap((item) => item.warnings)
      };
    }
  };
};
