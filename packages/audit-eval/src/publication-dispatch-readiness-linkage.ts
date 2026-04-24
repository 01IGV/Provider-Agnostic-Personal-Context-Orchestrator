import type { AuditId, IsoDateTimeString, OperationalContour } from "@orchestrator/core-foundation";

export interface PublicationDispatchReadinessAuditWarning {
  code: string;
  message: string;
}

export interface PublicationDispatchReadinessTraceShape {
  trace_id: string;
  dispatch_readiness_id: string;
  publication_preparation_id: string;
  normalized_outcome_id: string;
  request_id: string;
  operation_id: string;
  runtime_handoff_id: string;
  attempt_id: string;
  dispatch_readiness_family: string;
  dispatch_readiness_status: string;
  publication_preparation_family: string;
  publication_preparation_status: string;
  normalized_outcome_family: string;
  normalized_outcome_status: string;
  lifecycle_state: string;
  contour_target: OperationalContour | "unknown";
  dispatch_readiness_boundary: "dispatch_ready_placeholder_only";
  linked_publication_preparation_trace_id?: string;
  warnings: PublicationDispatchReadinessAuditWarning[];
  traced_at: IsoDateTimeString;
}

export interface PublicationDispatchReadinessAuditLinkageShape {
  linkage_id: string;
  dispatch_readiness_id: string;
  publication_preparation_id: string;
  normalized_outcome_id: string;
  attempt_id: string;
  runtime_handoff_id: string;
  dispatch_readiness_status: string;
  publication_preparation_status: string;
  blocked_or_deferred_or_terminal: boolean;
  linked_audit_id?: AuditId;
  provenance_chain_ref?: string;
  hook_status: "pending_dispatch_readiness_audit" | "dispatch_readiness_audit_linked";
  warnings: PublicationDispatchReadinessAuditWarning[];
  linked_at: IsoDateTimeString;
}

export interface PublicationDispatchReadinessTraceBuilder {
  build(input: {
    trace_id: string;
    dispatch_readiness_id: string;
    publication_preparation_id: string;
    normalized_outcome_id: string;
    request_id: string;
    operation_id: string;
    runtime_handoff_id: string;
    attempt_id: string;
    dispatch_readiness_family: string;
    dispatch_readiness_status: string;
    publication_preparation_family: string;
    publication_preparation_status: string;
    normalized_outcome_family: string;
    normalized_outcome_status: string;
    lifecycle_state: string;
    contour_target: OperationalContour | "unknown";
    linked_publication_preparation_trace_id?: string;
    warnings?: PublicationDispatchReadinessAuditWarning[];
    now?: IsoDateTimeString;
  }): PublicationDispatchReadinessTraceShape;
}

export interface PublicationDispatchReadinessAuditLinkageBuilder {
  build(input: {
    linkage_id: string;
    dispatch_readiness_id: string;
    publication_preparation_id: string;
    normalized_outcome_id: string;
    attempt_id: string;
    runtime_handoff_id: string;
    dispatch_readiness_status: string;
    publication_preparation_status: string;
    linked_audit_id?: AuditId;
    provenance_chain_ref?: string;
    warnings?: PublicationDispatchReadinessAuditWarning[];
    now?: IsoDateTimeString;
  }): PublicationDispatchReadinessAuditLinkageShape;
}

export const createPublicationDispatchReadinessTraceBuilder =
  (): PublicationDispatchReadinessTraceBuilder => {
    return {
      build(input): PublicationDispatchReadinessTraceShape {
        const tracedAt = input.now ?? ((new Date().toISOString() as unknown) as IsoDateTimeString);
        return {
          trace_id: input.trace_id,
          dispatch_readiness_id: input.dispatch_readiness_id,
          publication_preparation_id: input.publication_preparation_id,
          normalized_outcome_id: input.normalized_outcome_id,
          request_id: input.request_id,
          operation_id: input.operation_id,
          runtime_handoff_id: input.runtime_handoff_id,
          attempt_id: input.attempt_id,
          dispatch_readiness_family: input.dispatch_readiness_family,
          dispatch_readiness_status: input.dispatch_readiness_status,
          publication_preparation_family: input.publication_preparation_family,
          publication_preparation_status: input.publication_preparation_status,
          normalized_outcome_family: input.normalized_outcome_family,
          normalized_outcome_status: input.normalized_outcome_status,
          lifecycle_state: input.lifecycle_state,
          contour_target: input.contour_target,
          dispatch_readiness_boundary: "dispatch_ready_placeholder_only",
          ...(input.linked_publication_preparation_trace_id
            ? { linked_publication_preparation_trace_id: input.linked_publication_preparation_trace_id }
            : {}),
          warnings: input.warnings ?? [],
          traced_at: tracedAt
        };
      }
    };
  };

export const createPublicationDispatchReadinessAuditLinkageBuilder =
  (): PublicationDispatchReadinessAuditLinkageBuilder => {
    return {
      build(input): PublicationDispatchReadinessAuditLinkageShape {
        const linkedAt = input.now ?? ((new Date().toISOString() as unknown) as IsoDateTimeString);
        const blockedOrDeferredOrTerminal = [
          "blocked_dispatch_readiness",
          "deferred_dispatch_readiness",
          "aborted_dispatch_readiness",
          "expired_dispatch_readiness",
          "cancelled_dispatch_readiness",
          "not_dispatchable_dispatch_readiness"
        ].includes(input.dispatch_readiness_status);
        return {
          linkage_id: input.linkage_id,
          dispatch_readiness_id: input.dispatch_readiness_id,
          publication_preparation_id: input.publication_preparation_id,
          normalized_outcome_id: input.normalized_outcome_id,
          attempt_id: input.attempt_id,
          runtime_handoff_id: input.runtime_handoff_id,
          dispatch_readiness_status: input.dispatch_readiness_status,
          publication_preparation_status: input.publication_preparation_status,
          blocked_or_deferred_or_terminal: blockedOrDeferredOrTerminal,
          ...(input.linked_audit_id ? { linked_audit_id: input.linked_audit_id } : {}),
          ...(input.provenance_chain_ref ? { provenance_chain_ref: input.provenance_chain_ref } : {}),
          hook_status: input.linked_audit_id ? "dispatch_readiness_audit_linked" : "pending_dispatch_readiness_audit",
          warnings: input.warnings ?? [],
          linked_at: linkedAt
        };
      }
    };
  };
