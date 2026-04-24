import type { AuditId, IsoDateTimeString, OperationalContour } from "@orchestrator/core-foundation";

export interface NormalizedExecutionAttemptOutcomeAuditWarning {
  code: string;
  message: string;
}

export interface NormalizedExecutionAttemptOutcomeTraceShape {
  trace_id: string;
  normalized_outcome_id: string;
  request_id: string;
  operation_id: string;
  runtime_handoff_id: string;
  attempt_id: string;
  normalized_outcome_family: string;
  normalized_outcome_status: string;
  lifecycle_state: string;
  lifecycle_result_family: string;
  contour_target: OperationalContour | "unknown";
  outcome_boundary: "normalized_placeholder_outcome_only";
  linked_lifecycle_trace_id?: string;
  warnings: NormalizedExecutionAttemptOutcomeAuditWarning[];
  traced_at: IsoDateTimeString;
}

export interface NormalizedExecutionAttemptOutcomeAuditLinkageShape {
  linkage_id: string;
  normalized_outcome_id: string;
  attempt_id: string;
  runtime_handoff_id: string;
  lifecycle_state: string;
  normalized_outcome_status: string;
  blocked_or_deferred_or_terminal: boolean;
  linked_audit_id?: AuditId;
  provenance_chain_ref?: string;
  hook_status: "pending_normalized_attempt_outcome_audit" | "normalized_attempt_outcome_audit_linked";
  warnings: NormalizedExecutionAttemptOutcomeAuditWarning[];
  linked_at: IsoDateTimeString;
}

export interface NormalizedExecutionAttemptOutcomeTraceBuilder {
  build(input: {
    trace_id: string;
    normalized_outcome_id: string;
    request_id: string;
    operation_id: string;
    runtime_handoff_id: string;
    attempt_id: string;
    normalized_outcome_family: string;
    normalized_outcome_status: string;
    lifecycle_state: string;
    lifecycle_result_family: string;
    contour_target: OperationalContour | "unknown";
    linked_lifecycle_trace_id?: string;
    warnings?: NormalizedExecutionAttemptOutcomeAuditWarning[];
    now?: IsoDateTimeString;
  }): NormalizedExecutionAttemptOutcomeTraceShape;
}

export interface NormalizedExecutionAttemptOutcomeAuditLinkageBuilder {
  build(input: {
    linkage_id: string;
    normalized_outcome_id: string;
    attempt_id: string;
    runtime_handoff_id: string;
    lifecycle_state: string;
    normalized_outcome_status: string;
    linked_audit_id?: AuditId;
    provenance_chain_ref?: string;
    warnings?: NormalizedExecutionAttemptOutcomeAuditWarning[];
    now?: IsoDateTimeString;
  }): NormalizedExecutionAttemptOutcomeAuditLinkageShape;
}

export const createNormalizedExecutionAttemptOutcomeTraceBuilder = (): NormalizedExecutionAttemptOutcomeTraceBuilder => {
  return {
    build(input): NormalizedExecutionAttemptOutcomeTraceShape {
      const tracedAt = input.now ?? ((new Date().toISOString() as unknown) as IsoDateTimeString);
      return {
        trace_id: input.trace_id,
        normalized_outcome_id: input.normalized_outcome_id,
        request_id: input.request_id,
        operation_id: input.operation_id,
        runtime_handoff_id: input.runtime_handoff_id,
        attempt_id: input.attempt_id,
        normalized_outcome_family: input.normalized_outcome_family,
        normalized_outcome_status: input.normalized_outcome_status,
        lifecycle_state: input.lifecycle_state,
        lifecycle_result_family: input.lifecycle_result_family,
        contour_target: input.contour_target,
        outcome_boundary: "normalized_placeholder_outcome_only",
        ...(input.linked_lifecycle_trace_id ? { linked_lifecycle_trace_id: input.linked_lifecycle_trace_id } : {}),
        warnings: input.warnings ?? [],
        traced_at: tracedAt
      };
    }
  };
};

export const createNormalizedExecutionAttemptOutcomeAuditLinkageBuilder =
  (): NormalizedExecutionAttemptOutcomeAuditLinkageBuilder => {
    return {
      build(input): NormalizedExecutionAttemptOutcomeAuditLinkageShape {
        const linkedAt = input.now ?? ((new Date().toISOString() as unknown) as IsoDateTimeString);
        const blockedOrDeferredOrTerminal = [
          "blocked",
          "deferred",
          "aborted",
          "expired",
          "cancelled",
          "not_dispatchable"
        ].includes(input.lifecycle_state);
        return {
          linkage_id: input.linkage_id,
          normalized_outcome_id: input.normalized_outcome_id,
          attempt_id: input.attempt_id,
          runtime_handoff_id: input.runtime_handoff_id,
          lifecycle_state: input.lifecycle_state,
          normalized_outcome_status: input.normalized_outcome_status,
          blocked_or_deferred_or_terminal: blockedOrDeferredOrTerminal,
          ...(input.linked_audit_id ? { linked_audit_id: input.linked_audit_id } : {}),
          ...(input.provenance_chain_ref ? { provenance_chain_ref: input.provenance_chain_ref } : {}),
          hook_status: input.linked_audit_id
            ? "normalized_attempt_outcome_audit_linked"
            : "pending_normalized_attempt_outcome_audit",
          warnings: input.warnings ?? [],
          linked_at: linkedAt
        };
      }
    };
  };
