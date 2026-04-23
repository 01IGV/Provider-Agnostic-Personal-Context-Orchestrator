import type { AuditId, IsoDateTimeString, OperationalContour } from "@orchestrator/core-foundation";

export const COMPLETION_INGRESS_TRACE_STATUSES = [
  "accepted_completion",
  "rejected_completion",
  "incomplete_completion",
  "mismatched_completion"
] as const;

export type CompletionIngressTraceStatus = (typeof COMPLETION_INGRESS_TRACE_STATUSES)[number];

export const COMPLETION_INGRESS_TRACE_WARNING_CODES = [
  "completion_missing_attempt_linkage",
  "completion_shape_incomplete",
  "completion_shape_mismatch",
  "completion_reconciliation_forwarded",
  "completion_reconciliation_not_forwarded"
] as const;

export type CompletionIngressTraceWarningCode = (typeof COMPLETION_INGRESS_TRACE_WARNING_CODES)[number];

export interface CompletionIngressTraceWarning {
  code: CompletionIngressTraceWarningCode;
  message: string;
}

export interface CompletionIngressTraceRecord {
  trace_id: string;
  completion_envelope_id: string;
  request_id: string;
  operation_id: string;
  attempt_id?: string;
  contour_target?: OperationalContour;
  ingress_status: CompletionIngressTraceStatus;
  created_at: IsoDateTimeString;
  warnings: CompletionIngressTraceWarning[];
}

export interface CompletionIngressAuditLinkageShape {
  linkage_id: string;
  completion_envelope_id: string;
  request_id: string;
  operation_id: string;
  attempt_id?: string;
  contour_target?: OperationalContour;
  ingress_status: CompletionIngressTraceStatus;
  linked_audit_id?: AuditId;
  hook_status: "pending_completion_audit" | "completion_audit_linked";
  warnings: CompletionIngressTraceWarning[];
  linked_at: IsoDateTimeString;
}

export interface CompletionIngressTraceBuilder {
  build(input: {
    trace_id: string;
    completion_envelope_id: string;
    request_id: string;
    operation_id: string;
    ingress_status: CompletionIngressTraceStatus;
    attempt_id?: string;
    contour_target?: OperationalContour;
    warnings?: CompletionIngressTraceWarning[];
    now?: IsoDateTimeString;
  }): CompletionIngressTraceRecord;
}

export interface CompletionIngressAuditLinkageBuilder {
  build(input: {
    linkage_id: string;
    completion_envelope_id: string;
    request_id: string;
    operation_id: string;
    ingress_status: CompletionIngressTraceStatus;
    attempt_id?: string;
    contour_target?: OperationalContour;
    linked_audit_id?: AuditId;
    warnings?: CompletionIngressTraceWarning[];
    now?: IsoDateTimeString;
  }): CompletionIngressAuditLinkageShape;
}

export const createCompletionIngressTraceBuilder = (): CompletionIngressTraceBuilder => {
  return {
    build(input): CompletionIngressTraceRecord {
      const createdAt = input.now ?? ((new Date().toISOString() as unknown) as IsoDateTimeString);
      return {
        trace_id: input.trace_id,
        completion_envelope_id: input.completion_envelope_id,
        request_id: input.request_id,
        operation_id: input.operation_id,
        ...(input.attempt_id ? { attempt_id: input.attempt_id } : {}),
        ...(input.contour_target ? { contour_target: input.contour_target } : {}),
        ingress_status: input.ingress_status,
        created_at: createdAt,
        warnings: input.warnings ?? []
      };
    }
  };
};

export const createCompletionIngressAuditLinkageBuilder = (): CompletionIngressAuditLinkageBuilder => {
  return {
    build(input): CompletionIngressAuditLinkageShape {
      const linkedAt = input.now ?? ((new Date().toISOString() as unknown) as IsoDateTimeString);
      return {
        linkage_id: input.linkage_id,
        completion_envelope_id: input.completion_envelope_id,
        request_id: input.request_id,
        operation_id: input.operation_id,
        ...(input.attempt_id ? { attempt_id: input.attempt_id } : {}),
        ...(input.contour_target ? { contour_target: input.contour_target } : {}),
        ingress_status: input.ingress_status,
        ...(input.linked_audit_id ? { linked_audit_id: input.linked_audit_id } : {}),
        hook_status: input.linked_audit_id ? "completion_audit_linked" : "pending_completion_audit",
        warnings: input.warnings ?? [],
        linked_at: linkedAt
      };
    }
  };
};
