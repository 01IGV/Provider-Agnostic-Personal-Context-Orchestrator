import type { AuditId, IsoDateTimeString, OperationalContour } from "@orchestrator/core-foundation";

export interface PublicationDispatchIntentAuditWarning {
  code: string;
  message: string;
}

export interface PublicationDispatchIntentTraceShape {
  trace_id: string;
  request_id: string;
  operation_id: string;
  publication_family: string;
  channel_family: string;
  dispatch_intent_family: string;
  dispatch_intent_status: string;
  dispatch_target_family: string;
  warnings: PublicationDispatchIntentAuditWarning[];
  traced_at: IsoDateTimeString;
}

export interface PublicationDispatchIntentAuditLinkageShape {
  linkage_id: string;
  request_id: string;
  operation_id: string;
  attempt_id?: string;
  contour_target?: OperationalContour;
  publication_family: string;
  channel_family: string;
  dispatch_intent_family: string;
  dispatch_intent_status: string;
  dispatch_target_family: string;
  linked_audit_id?: AuditId;
  hook_status: "pending_dispatch_intent_audit" | "dispatch_intent_audit_linked";
  warnings: PublicationDispatchIntentAuditWarning[];
  linked_at: IsoDateTimeString;
}

export interface PublicationDispatchIntentTraceBuilder {
  build(input: {
    trace_id: string;
    request_id: string;
    operation_id: string;
    publication_family: string;
    channel_family: string;
    dispatch_intent_family: string;
    dispatch_intent_status: string;
    dispatch_target_family: string;
    warnings?: PublicationDispatchIntentAuditWarning[];
    now?: IsoDateTimeString;
  }): PublicationDispatchIntentTraceShape;
}

export interface PublicationDispatchIntentAuditLinkageBuilder {
  build(input: {
    linkage_id: string;
    request_id: string;
    operation_id: string;
    publication_family: string;
    channel_family: string;
    dispatch_intent_family: string;
    dispatch_intent_status: string;
    dispatch_target_family: string;
    attempt_id?: string;
    contour_target?: OperationalContour;
    linked_audit_id?: AuditId;
    warnings?: PublicationDispatchIntentAuditWarning[];
    now?: IsoDateTimeString;
  }): PublicationDispatchIntentAuditLinkageShape;
}

export const createPublicationDispatchIntentTraceBuilder = (): PublicationDispatchIntentTraceBuilder => {
  return {
    build(input): PublicationDispatchIntentTraceShape {
      const tracedAt = input.now ?? ((new Date().toISOString() as unknown) as IsoDateTimeString);
      return {
        trace_id: input.trace_id,
        request_id: input.request_id,
        operation_id: input.operation_id,
        publication_family: input.publication_family,
        channel_family: input.channel_family,
        dispatch_intent_family: input.dispatch_intent_family,
        dispatch_intent_status: input.dispatch_intent_status,
        dispatch_target_family: input.dispatch_target_family,
        warnings: input.warnings ?? [],
        traced_at: tracedAt
      };
    }
  };
};

export const createPublicationDispatchIntentAuditLinkageBuilder = (): PublicationDispatchIntentAuditLinkageBuilder => {
  return {
    build(input): PublicationDispatchIntentAuditLinkageShape {
      const linkedAt = input.now ?? ((new Date().toISOString() as unknown) as IsoDateTimeString);
      return {
        linkage_id: input.linkage_id,
        request_id: input.request_id,
        operation_id: input.operation_id,
        ...(input.attempt_id ? { attempt_id: input.attempt_id } : {}),
        ...(input.contour_target ? { contour_target: input.contour_target } : {}),
        publication_family: input.publication_family,
        channel_family: input.channel_family,
        dispatch_intent_family: input.dispatch_intent_family,
        dispatch_intent_status: input.dispatch_intent_status,
        dispatch_target_family: input.dispatch_target_family,
        ...(input.linked_audit_id ? { linked_audit_id: input.linked_audit_id } : {}),
        hook_status: input.linked_audit_id ? "dispatch_intent_audit_linked" : "pending_dispatch_intent_audit",
        warnings: input.warnings ?? [],
        linked_at: linkedAt
      };
    }
  };
};
