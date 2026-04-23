import type { AuditId, IsoDateTimeString, OperationalContour } from "@orchestrator/core-foundation";

export interface ChannelBindingAuditWarning {
  code: string;
  message: string;
}

export interface PublicationChannelBindingTraceShape {
  trace_id: string;
  request_id: string;
  operation_id: string;
  publication_family: string;
  channel_family: string;
  eligibility_status: string;
  egress_gate_status: string;
  warnings: ChannelBindingAuditWarning[];
  traced_at: IsoDateTimeString;
}

export interface PublicationEgressGateAuditLinkageShape {
  linkage_id: string;
  request_id: string;
  operation_id: string;
  attempt_id?: string;
  contour_target?: OperationalContour;
  publication_family: string;
  channel_family: string;
  egress_gate_status: string;
  linked_audit_id?: AuditId;
  hook_status: "pending_channel_egress_audit" | "channel_egress_audit_linked";
  warnings: ChannelBindingAuditWarning[];
  linked_at: IsoDateTimeString;
}

export interface PublicationChannelBindingTraceBuilder {
  build(input: {
    trace_id: string;
    request_id: string;
    operation_id: string;
    publication_family: string;
    channel_family: string;
    eligibility_status: string;
    egress_gate_status: string;
    warnings?: ChannelBindingAuditWarning[];
    now?: IsoDateTimeString;
  }): PublicationChannelBindingTraceShape;
}

export interface PublicationEgressGateAuditLinkageBuilder {
  build(input: {
    linkage_id: string;
    request_id: string;
    operation_id: string;
    publication_family: string;
    channel_family: string;
    egress_gate_status: string;
    attempt_id?: string;
    contour_target?: OperationalContour;
    linked_audit_id?: AuditId;
    warnings?: ChannelBindingAuditWarning[];
    now?: IsoDateTimeString;
  }): PublicationEgressGateAuditLinkageShape;
}

export const createPublicationChannelBindingTraceBuilder = (): PublicationChannelBindingTraceBuilder => {
  return {
    build(input): PublicationChannelBindingTraceShape {
      const tracedAt = input.now ?? ((new Date().toISOString() as unknown) as IsoDateTimeString);
      return {
        trace_id: input.trace_id,
        request_id: input.request_id,
        operation_id: input.operation_id,
        publication_family: input.publication_family,
        channel_family: input.channel_family,
        eligibility_status: input.eligibility_status,
        egress_gate_status: input.egress_gate_status,
        warnings: input.warnings ?? [],
        traced_at: tracedAt
      };
    }
  };
};

export const createPublicationEgressGateAuditLinkageBuilder = (): PublicationEgressGateAuditLinkageBuilder => {
  return {
    build(input): PublicationEgressGateAuditLinkageShape {
      const linkedAt = input.now ?? ((new Date().toISOString() as unknown) as IsoDateTimeString);
      return {
        linkage_id: input.linkage_id,
        request_id: input.request_id,
        operation_id: input.operation_id,
        ...(input.attempt_id ? { attempt_id: input.attempt_id } : {}),
        ...(input.contour_target ? { contour_target: input.contour_target } : {}),
        publication_family: input.publication_family,
        channel_family: input.channel_family,
        egress_gate_status: input.egress_gate_status,
        ...(input.linked_audit_id ? { linked_audit_id: input.linked_audit_id } : {}),
        hook_status: input.linked_audit_id ? "channel_egress_audit_linked" : "pending_channel_egress_audit",
        warnings: input.warnings ?? [],
        linked_at: linkedAt
      };
    }
  };
};
