import type { AuditId, IsoDateTimeString, OperationalContour } from "@orchestrator/core-foundation";

export interface ExecutionAttemptOutcomePublicationPreparationAuditWarning {
  code: string;
  message: string;
}

export interface ExecutionAttemptOutcomePublicationPreparationTraceShape {
  trace_id: string;
  publication_preparation_id: string;
  normalized_outcome_id: string;
  request_id: string;
  operation_id: string;
  runtime_handoff_id: string;
  attempt_id: string;
  publication_preparation_family: string;
  publication_preparation_status: string;
  normalized_outcome_family: string;
  normalized_outcome_status: string;
  lifecycle_state: string;
  contour_target: OperationalContour | "unknown";
  publication_boundary: "publication_ready_placeholder_only";
  linked_normalized_outcome_trace_id?: string;
  warnings: ExecutionAttemptOutcomePublicationPreparationAuditWarning[];
  traced_at: IsoDateTimeString;
}

export interface ExecutionAttemptOutcomePublicationPreparationAuditLinkageShape {
  linkage_id: string;
  publication_preparation_id: string;
  normalized_outcome_id: string;
  attempt_id: string;
  runtime_handoff_id: string;
  publication_preparation_status: string;
  normalized_outcome_status: string;
  blocked_or_deferred_or_terminal: boolean;
  linked_audit_id?: AuditId;
  provenance_chain_ref?: string;
  hook_status:
    | "pending_publication_preparation_audit"
    | "publication_preparation_audit_linked";
  warnings: ExecutionAttemptOutcomePublicationPreparationAuditWarning[];
  linked_at: IsoDateTimeString;
}

export interface ExecutionAttemptOutcomePublicationPreparationTraceBuilder {
  build(input: {
    trace_id: string;
    publication_preparation_id: string;
    normalized_outcome_id: string;
    request_id: string;
    operation_id: string;
    runtime_handoff_id: string;
    attempt_id: string;
    publication_preparation_family: string;
    publication_preparation_status: string;
    normalized_outcome_family: string;
    normalized_outcome_status: string;
    lifecycle_state: string;
    contour_target: OperationalContour | "unknown";
    linked_normalized_outcome_trace_id?: string;
    warnings?: ExecutionAttemptOutcomePublicationPreparationAuditWarning[];
    now?: IsoDateTimeString;
  }): ExecutionAttemptOutcomePublicationPreparationTraceShape;
}

export interface ExecutionAttemptOutcomePublicationPreparationAuditLinkageBuilder {
  build(input: {
    linkage_id: string;
    publication_preparation_id: string;
    normalized_outcome_id: string;
    attempt_id: string;
    runtime_handoff_id: string;
    publication_preparation_status: string;
    normalized_outcome_status: string;
    linked_audit_id?: AuditId;
    provenance_chain_ref?: string;
    warnings?: ExecutionAttemptOutcomePublicationPreparationAuditWarning[];
    now?: IsoDateTimeString;
  }): ExecutionAttemptOutcomePublicationPreparationAuditLinkageShape;
}

export const createExecutionAttemptOutcomePublicationPreparationTraceBuilder =
  (): ExecutionAttemptOutcomePublicationPreparationTraceBuilder => {
    return {
      build(input): ExecutionAttemptOutcomePublicationPreparationTraceShape {
        const tracedAt = input.now ?? ((new Date().toISOString() as unknown) as IsoDateTimeString);
        return {
          trace_id: input.trace_id,
          publication_preparation_id: input.publication_preparation_id,
          normalized_outcome_id: input.normalized_outcome_id,
          request_id: input.request_id,
          operation_id: input.operation_id,
          runtime_handoff_id: input.runtime_handoff_id,
          attempt_id: input.attempt_id,
          publication_preparation_family: input.publication_preparation_family,
          publication_preparation_status: input.publication_preparation_status,
          normalized_outcome_family: input.normalized_outcome_family,
          normalized_outcome_status: input.normalized_outcome_status,
          lifecycle_state: input.lifecycle_state,
          contour_target: input.contour_target,
          publication_boundary: "publication_ready_placeholder_only",
          ...(input.linked_normalized_outcome_trace_id
            ? { linked_normalized_outcome_trace_id: input.linked_normalized_outcome_trace_id }
            : {}),
          warnings: input.warnings ?? [],
          traced_at: tracedAt
        };
      }
    };
  };

export const createExecutionAttemptOutcomePublicationPreparationAuditLinkageBuilder =
  (): ExecutionAttemptOutcomePublicationPreparationAuditLinkageBuilder => {
    return {
      build(input): ExecutionAttemptOutcomePublicationPreparationAuditLinkageShape {
        const linkedAt = input.now ?? ((new Date().toISOString() as unknown) as IsoDateTimeString);
        const blockedOrDeferredOrTerminal = [
          "blocked_publication_preparation",
          "deferred_publication_preparation",
          "aborted_publication_preparation",
          "expired_publication_preparation",
          "cancelled_publication_preparation",
          "not_dispatchable_publication_preparation"
        ].includes(input.publication_preparation_status);
        return {
          linkage_id: input.linkage_id,
          publication_preparation_id: input.publication_preparation_id,
          normalized_outcome_id: input.normalized_outcome_id,
          attempt_id: input.attempt_id,
          runtime_handoff_id: input.runtime_handoff_id,
          publication_preparation_status: input.publication_preparation_status,
          normalized_outcome_status: input.normalized_outcome_status,
          blocked_or_deferred_or_terminal: blockedOrDeferredOrTerminal,
          ...(input.linked_audit_id ? { linked_audit_id: input.linked_audit_id } : {}),
          ...(input.provenance_chain_ref ? { provenance_chain_ref: input.provenance_chain_ref } : {}),
          hook_status: input.linked_audit_id
            ? "publication_preparation_audit_linked"
            : "pending_publication_preparation_audit",
          warnings: input.warnings ?? [],
          linked_at: linkedAt
        };
      }
    };
  };
