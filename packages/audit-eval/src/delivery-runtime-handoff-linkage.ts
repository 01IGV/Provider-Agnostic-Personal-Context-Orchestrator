import type { AuditId, IsoDateTimeString, OperationalContour } from "@orchestrator/core-foundation";

export interface DeliveryRuntimeHandoffAuditWarning {
  code: string;
  message: string;
}

export interface DeliveryRuntimeHandoffTraceShape {
  trace_id: string;
  request_id: string;
  operation_id: string;
  precheck_id: string;
  dispatch_intent_id: string;
  runtime_handoff_family: string;
  runtime_handoff_status: string;
  runtime_target_family: string;
  warnings: DeliveryRuntimeHandoffAuditWarning[];
  traced_at: IsoDateTimeString;
}

export interface DeliveryRuntimeHandoffAuditLinkageShape {
  linkage_id: string;
  request_id: string;
  operation_id: string;
  precheck_id: string;
  dispatch_intent_id: string;
  runtime_handoff_family: string;
  runtime_handoff_status: string;
  runtime_target_family: string;
  attempt_id?: string;
  contour_target?: OperationalContour;
  linked_audit_id?: AuditId;
  hook_status: "pending_delivery_runtime_handoff_audit" | "delivery_runtime_handoff_audit_linked";
  warnings: DeliveryRuntimeHandoffAuditWarning[];
  linked_at: IsoDateTimeString;
}

export interface DeliveryRuntimeHandoffTraceBuilder {
  build(input: {
    trace_id: string;
    request_id: string;
    operation_id: string;
    precheck_id: string;
    dispatch_intent_id: string;
    runtime_handoff_family: string;
    runtime_handoff_status: string;
    runtime_target_family: string;
    warnings?: DeliveryRuntimeHandoffAuditWarning[];
    now?: IsoDateTimeString;
  }): DeliveryRuntimeHandoffTraceShape;
}

export interface DeliveryRuntimeHandoffAuditLinkageBuilder {
  build(input: {
    linkage_id: string;
    request_id: string;
    operation_id: string;
    precheck_id: string;
    dispatch_intent_id: string;
    runtime_handoff_family: string;
    runtime_handoff_status: string;
    runtime_target_family: string;
    attempt_id?: string;
    contour_target?: OperationalContour;
    linked_audit_id?: AuditId;
    warnings?: DeliveryRuntimeHandoffAuditWarning[];
    now?: IsoDateTimeString;
  }): DeliveryRuntimeHandoffAuditLinkageShape;
}

export const createDeliveryRuntimeHandoffTraceBuilder = (): DeliveryRuntimeHandoffTraceBuilder => {
  return {
    build(input): DeliveryRuntimeHandoffTraceShape {
      const tracedAt = input.now ?? ((new Date().toISOString() as unknown) as IsoDateTimeString);
      return {
        trace_id: input.trace_id,
        request_id: input.request_id,
        operation_id: input.operation_id,
        precheck_id: input.precheck_id,
        dispatch_intent_id: input.dispatch_intent_id,
        runtime_handoff_family: input.runtime_handoff_family,
        runtime_handoff_status: input.runtime_handoff_status,
        runtime_target_family: input.runtime_target_family,
        warnings: input.warnings ?? [],
        traced_at: tracedAt
      };
    }
  };
};

export const createDeliveryRuntimeHandoffAuditLinkageBuilder = (): DeliveryRuntimeHandoffAuditLinkageBuilder => {
  return {
    build(input): DeliveryRuntimeHandoffAuditLinkageShape {
      const linkedAt = input.now ?? ((new Date().toISOString() as unknown) as IsoDateTimeString);
      return {
        linkage_id: input.linkage_id,
        request_id: input.request_id,
        operation_id: input.operation_id,
        precheck_id: input.precheck_id,
        dispatch_intent_id: input.dispatch_intent_id,
        runtime_handoff_family: input.runtime_handoff_family,
        runtime_handoff_status: input.runtime_handoff_status,
        runtime_target_family: input.runtime_target_family,
        ...(input.attempt_id ? { attempt_id: input.attempt_id } : {}),
        ...(input.contour_target ? { contour_target: input.contour_target } : {}),
        ...(input.linked_audit_id ? { linked_audit_id: input.linked_audit_id } : {}),
        hook_status: input.linked_audit_id
          ? "delivery_runtime_handoff_audit_linked"
          : "pending_delivery_runtime_handoff_audit",
        warnings: input.warnings ?? [],
        linked_at: linkedAt
      };
    }
  };
};
