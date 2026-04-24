import type { AuditId, IsoDateTimeString, OperationalContour } from "@orchestrator/core-foundation";

export interface DeliveryDispatchPrecheckAuditWarning {
  code: string;
  message: string;
}

export interface DeliveryDispatchPrecheckTraceShape {
  trace_id: string;
  delivery_dispatch_precheck_id: string;
  delivery_dispatch_intent_id: string;
  dispatch_readiness_id: string;
  publication_preparation_id: string;
  normalized_outcome_id: string;
  request_id: string;
  operation_id: string;
  runtime_handoff_id: string;
  attempt_id: string;
  delivery_dispatch_precheck_family: string;
  delivery_dispatch_precheck_status: string;
  delivery_dispatch_intent_family: string;
  delivery_dispatch_intent_status: string;
  dispatch_readiness_family: string;
  dispatch_readiness_status: string;
  publication_preparation_family: string;
  publication_preparation_status: string;
  normalized_outcome_family: string;
  normalized_outcome_status: string;
  lifecycle_state: string;
  contour_target: OperationalContour | "unknown";
  delivery_dispatch_precheck_boundary: "delivery_dispatch_precheck_placeholder_only";
  linked_delivery_dispatch_intent_trace_id?: string;
  warnings: DeliveryDispatchPrecheckAuditWarning[];
  traced_at: IsoDateTimeString;
}

export interface DeliveryDispatchPrecheckAuditLinkageShape {
  linkage_id: string;
  delivery_dispatch_precheck_id: string;
  delivery_dispatch_intent_id: string;
  dispatch_readiness_id: string;
  publication_preparation_id: string;
  normalized_outcome_id: string;
  attempt_id: string;
  runtime_handoff_id: string;
  delivery_dispatch_precheck_status: string;
  delivery_dispatch_intent_status: string;
  blocked_or_deferred_or_terminal: boolean;
  linked_audit_id?: AuditId;
  provenance_chain_ref?: string;
  hook_status: "pending_delivery_dispatch_precheck_audit" | "delivery_dispatch_precheck_audit_linked";
  warnings: DeliveryDispatchPrecheckAuditWarning[];
  linked_at: IsoDateTimeString;
}

export interface DeliveryDispatchPrecheckTraceBuilder {
  build(input: {
    trace_id: string;
    delivery_dispatch_precheck_id: string;
    delivery_dispatch_intent_id: string;
    dispatch_readiness_id: string;
    publication_preparation_id: string;
    normalized_outcome_id: string;
    request_id: string;
    operation_id: string;
    runtime_handoff_id: string;
    attempt_id: string;
    delivery_dispatch_precheck_family: string;
    delivery_dispatch_precheck_status: string;
    delivery_dispatch_intent_family: string;
    delivery_dispatch_intent_status: string;
    dispatch_readiness_family: string;
    dispatch_readiness_status: string;
    publication_preparation_family: string;
    publication_preparation_status: string;
    normalized_outcome_family: string;
    normalized_outcome_status: string;
    lifecycle_state: string;
    contour_target: OperationalContour | "unknown";
    linked_delivery_dispatch_intent_trace_id?: string;
    warnings?: DeliveryDispatchPrecheckAuditWarning[];
    now?: IsoDateTimeString;
  }): DeliveryDispatchPrecheckTraceShape;
}

export interface DeliveryDispatchPrecheckAuditLinkageBuilder {
  build(input: {
    linkage_id: string;
    delivery_dispatch_precheck_id: string;
    delivery_dispatch_intent_id: string;
    dispatch_readiness_id: string;
    publication_preparation_id: string;
    normalized_outcome_id: string;
    attempt_id: string;
    runtime_handoff_id: string;
    delivery_dispatch_precheck_status: string;
    delivery_dispatch_intent_status: string;
    linked_audit_id?: AuditId;
    provenance_chain_ref?: string;
    warnings?: DeliveryDispatchPrecheckAuditWarning[];
    now?: IsoDateTimeString;
  }): DeliveryDispatchPrecheckAuditLinkageShape;
}

export const createDeliveryDispatchPrecheckTraceBuilder = (): DeliveryDispatchPrecheckTraceBuilder => {
  return {
    build(input): DeliveryDispatchPrecheckTraceShape {
      const tracedAt = input.now ?? ((new Date().toISOString() as unknown) as IsoDateTimeString);
      return {
        trace_id: input.trace_id,
        delivery_dispatch_precheck_id: input.delivery_dispatch_precheck_id,
        delivery_dispatch_intent_id: input.delivery_dispatch_intent_id,
        dispatch_readiness_id: input.dispatch_readiness_id,
        publication_preparation_id: input.publication_preparation_id,
        normalized_outcome_id: input.normalized_outcome_id,
        request_id: input.request_id,
        operation_id: input.operation_id,
        runtime_handoff_id: input.runtime_handoff_id,
        attempt_id: input.attempt_id,
        delivery_dispatch_precheck_family: input.delivery_dispatch_precheck_family,
        delivery_dispatch_precheck_status: input.delivery_dispatch_precheck_status,
        delivery_dispatch_intent_family: input.delivery_dispatch_intent_family,
        delivery_dispatch_intent_status: input.delivery_dispatch_intent_status,
        dispatch_readiness_family: input.dispatch_readiness_family,
        dispatch_readiness_status: input.dispatch_readiness_status,
        publication_preparation_family: input.publication_preparation_family,
        publication_preparation_status: input.publication_preparation_status,
        normalized_outcome_family: input.normalized_outcome_family,
        normalized_outcome_status: input.normalized_outcome_status,
        lifecycle_state: input.lifecycle_state,
        contour_target: input.contour_target,
        delivery_dispatch_precheck_boundary: "delivery_dispatch_precheck_placeholder_only",
        ...(input.linked_delivery_dispatch_intent_trace_id
          ? { linked_delivery_dispatch_intent_trace_id: input.linked_delivery_dispatch_intent_trace_id }
          : {}),
        warnings: input.warnings ?? [],
        traced_at: tracedAt
      };
    }
  };
};

export const createDeliveryDispatchPrecheckAuditLinkageBuilder = (): DeliveryDispatchPrecheckAuditLinkageBuilder => {
  return {
    build(input): DeliveryDispatchPrecheckAuditLinkageShape {
      const linkedAt = input.now ?? ((new Date().toISOString() as unknown) as IsoDateTimeString);
      const blockedOrDeferredOrTerminal = [
        "blocked_delivery_dispatch_precheck",
        "deferred_delivery_dispatch_precheck",
        "aborted_delivery_dispatch_precheck",
        "expired_delivery_dispatch_precheck",
        "cancelled_delivery_dispatch_precheck",
        "not_dispatchable_delivery_dispatch_precheck"
      ].includes(input.delivery_dispatch_precheck_status);
      return {
        linkage_id: input.linkage_id,
        delivery_dispatch_precheck_id: input.delivery_dispatch_precheck_id,
        delivery_dispatch_intent_id: input.delivery_dispatch_intent_id,
        dispatch_readiness_id: input.dispatch_readiness_id,
        publication_preparation_id: input.publication_preparation_id,
        normalized_outcome_id: input.normalized_outcome_id,
        attempt_id: input.attempt_id,
        runtime_handoff_id: input.runtime_handoff_id,
        delivery_dispatch_precheck_status: input.delivery_dispatch_precheck_status,
        delivery_dispatch_intent_status: input.delivery_dispatch_intent_status,
        blocked_or_deferred_or_terminal: blockedOrDeferredOrTerminal,
        ...(input.linked_audit_id ? { linked_audit_id: input.linked_audit_id } : {}),
        ...(input.provenance_chain_ref ? { provenance_chain_ref: input.provenance_chain_ref } : {}),
        hook_status: input.linked_audit_id
          ? "delivery_dispatch_precheck_audit_linked"
          : "pending_delivery_dispatch_precheck_audit",
        warnings: input.warnings ?? [],
        linked_at: linkedAt
      };
    }
  };
};
