import type { IsoDateTimeString } from "@orchestrator/core-foundation";
import type { CanonicalResponseEnvelope, SurfaceErrorObject, TypedSurfaceResponse } from "./request-response.js";
import type { IntegrationSurfaceType, SurfaceResponseStatus } from "./vocabularies.js";

export const INTEGRATION_PUBLICATION_CHANNEL_FAMILIES = [
  "mcp_channel",
  "api_channel",
  "hybrid_channel",
  "unknown_channel"
] as const;

export type IntegrationPublicationChannelFamily = (typeof INTEGRATION_PUBLICATION_CHANNEL_FAMILIES)[number];

export interface ChannelBoundEgressWarning {
  code: string;
  message: string;
}

export interface ChannelBoundEgressResponseLinkageShape<TResult = Record<string, unknown>> {
  linkage_id: string;
  request_id: string;
  operation_id: string;
  channel_family: IntegrationPublicationChannelFamily;
  egress_gate_status: string;
  egress_status: SurfaceResponseStatus;
  surface_type?: IntegrationSurfaceType;
  canonical_response: CanonicalResponseEnvelope<TResult>;
  typed_surface_response: TypedSurfaceResponse<TResult>;
  linked_error?: SurfaceErrorObject;
  warnings: ChannelBoundEgressWarning[];
  linked_at: IsoDateTimeString;
}

export interface ChannelBoundEgressResponseLinkageBuilder {
  build<TResult = Record<string, unknown>>(input: {
    linkage_id: string;
    request_id: string;
    operation_id: string;
    channel_family: IntegrationPublicationChannelFamily;
    egress_gate_status: string;
    egress_status: SurfaceResponseStatus;
    canonical_response: CanonicalResponseEnvelope<TResult>;
    typed_surface_response: TypedSurfaceResponse<TResult>;
    surface_type?: IntegrationSurfaceType;
    linked_error?: SurfaceErrorObject;
    warnings?: ChannelBoundEgressWarning[];
    now?: IsoDateTimeString;
  }): ChannelBoundEgressResponseLinkageShape<TResult>;
}

export const createChannelBoundEgressResponseLinkageBuilder = (): ChannelBoundEgressResponseLinkageBuilder => {
  return {
    build<TResult = Record<string, unknown>>(input: {
      linkage_id: string;
      request_id: string;
      operation_id: string;
      channel_family: IntegrationPublicationChannelFamily;
      egress_gate_status: string;
      egress_status: SurfaceResponseStatus;
      canonical_response: CanonicalResponseEnvelope<TResult>;
      typed_surface_response: TypedSurfaceResponse<TResult>;
      surface_type?: IntegrationSurfaceType;
      linked_error?: SurfaceErrorObject;
      warnings?: ChannelBoundEgressWarning[];
      now?: IsoDateTimeString;
    }): ChannelBoundEgressResponseLinkageShape<TResult> {
      const linkedAt = input.now ?? ((new Date().toISOString() as unknown) as IsoDateTimeString);
      return {
        linkage_id: input.linkage_id,
        request_id: input.request_id,
        operation_id: input.operation_id,
        channel_family: input.channel_family,
        egress_gate_status: input.egress_gate_status,
        egress_status: input.egress_status,
        ...(input.surface_type ? { surface_type: input.surface_type } : {}),
        canonical_response: input.canonical_response,
        typed_surface_response: input.typed_surface_response,
        ...(input.linked_error ? { linked_error: input.linked_error } : {}),
        warnings: input.warnings ?? [],
        linked_at: linkedAt
      };
    }
  };
};
