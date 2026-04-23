import type { AuditId, IsoDateTimeString, OperationalContour } from "@orchestrator/core-foundation";

export interface DeliveryPrecheckAuditWarning {
  code: string;
  message: string;
}

export interface DeliveryPrecheckTraceShape {
  trace_id: string;
  request_id: string;
  operation_id: string;
  dispatch_intent_id: string;
  dispatch_intent_family: string;
  precheck_family: string;
  precheck_status: string;
  target_handler_family: string;
  warnings: DeliveryPrecheckAuditWarning[];
  traced_at: IsoDateTimeString;
}

export interface DeliveryPrecheckAuditLinkageShape {
  linkage_id: string;
  request_id: string;
  operation_id: string;
  dispatch_intent_id: string;
  dispatch_intent_family: string;
  precheck_family: string;
  precheck_status: string;
  target_handler_family: string;
  attempt_id?: string;
  contour_target?: OperationalContour;
  linked_audit_id?: AuditId;
  hook_status: "pending_delivery_precheck_audit" | "delivery_precheck_audit_linked";
  warnings: DeliveryPrecheckAuditWarning[];
  linked_at: IsoDateTimeString;
}

export interface DeliveryPrecheckTraceBuilder {
  build(input: {
    trace_id: string;
    request_id: string;
    operation_id: string;
    dispatch_intent_id: string;
    dispatch_intent_family: string;
    precheck_family: string;
    precheck_status: string;
    target_handler_family: string;
    warnings?: DeliveryPrecheckAuditWarning[];
    now?: IsoDateTimeString;
  }): DeliveryPrecheckTraceShape;
}

export interface DeliveryPrecheckAuditLinkageBuilder {
  build(input: {
    linkage_id: string;
    request_id: string;
    operation_id: string;
    dispatch_intent_id: string;
    dispatch_intent_family: string;
    precheck_family: string;
    precheck_status: string;
    target_handler_family: string;
    attempt_id?: string;
    contour_target?: OperationalContour;
    linked_audit_id?: AuditId;
    warnings?: DeliveryPrecheckAuditWarning[];
    now?: IsoDateTimeString;
  }): DeliveryPrecheckAuditLinkageShape;
}

export const createDeliveryPrecheckTraceBuilder = (): DeliveryPrecheckTraceBuilder => {
  return {
    build(input): DeliveryPrecheckTraceShape {
      const tracedAt = input.now ?? ((new Date().toISOString() as unknown) as IsoDateTimeString);
      return {
        trace_id: input.trace_id,
        request_id: input.request_id,
        operation_id: input.operation_id,
        dispatch_intent_id: input.dispatch_intent_id,
        dispatch_intent_family: input.dispatch_intent_family,
        precheck_family: input.precheck_family,
        precheck_status: input.precheck_status,
        target_handler_family: input.target_handler_family,
        warnings: input.warnings ?? [],
        traced_at: tracedAt
      };
    }
  };
};

export const createDeliveryPrecheckAuditLinkageBuilder = (): DeliveryPrecheckAuditLinkageBuilder => {
  return {
    build(input): DeliveryPrecheckAuditLinkageShape {
      const linkedAt = input.now ?? ((new Date().toISOString() as unknown) as IsoDateTimeString);
      return {
        linkage_id: input.linkage_id,
        request_id: input.request_id,
        operation_id: input.operation_id,
        dispatch_intent_id: input.dispatch_intent_id,
        dispatch_intent_family: input.dispatch_intent_family,
        precheck_family: input.precheck_family,
        precheck_status: input.precheck_status,
        target_handler_family: input.target_handler_family,
        ...(input.attempt_id ? { attempt_id: input.attempt_id } : {}),
        ...(input.contour_target ? { contour_target: input.contour_target } : {}),
        ...(input.linked_audit_id ? { linked_audit_id: input.linked_audit_id } : {}),
        hook_status: input.linked_audit_id ? "delivery_precheck_audit_linked" : "pending_delivery_precheck_audit",
        warnings: input.warnings ?? [],
        linked_at: linkedAt
      };
    }
  };
};
