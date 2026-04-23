import type { IsoDateTimeString } from "@orchestrator/core-foundation";
import type { CanonicalResponseEnvelope, SurfaceErrorObject, TypedSurfaceResponse } from "./request-response.js";
import type { IntegrationSurfaceType, SurfaceResponseStatus } from "./vocabularies.js";

export interface PublicationEgressWarning {
  code: string;
  message: string;
}

export interface PublicationEgressResponseLinkageShape<TResult = Record<string, unknown>> {
  linkage_id: string;
  request_id: string;
  operation_id: string;
  egress_status: SurfaceResponseStatus;
  surface_type?: IntegrationSurfaceType;
  canonical_response: CanonicalResponseEnvelope<TResult>;
  typed_surface_response: TypedSurfaceResponse<TResult>;
  linked_error?: SurfaceErrorObject;
  warnings: PublicationEgressWarning[];
  linked_at: IsoDateTimeString;
}

export interface PublicationEgressResponseLinkageBuilder {
  build<TResult = Record<string, unknown>>(input: {
    linkage_id: string;
    request_id: string;
    operation_id: string;
    egress_status: SurfaceResponseStatus;
    canonical_response: CanonicalResponseEnvelope<TResult>;
    typed_surface_response: TypedSurfaceResponse<TResult>;
    surface_type?: IntegrationSurfaceType;
    linked_error?: SurfaceErrorObject;
    warnings?: PublicationEgressWarning[];
    now?: IsoDateTimeString;
  }): PublicationEgressResponseLinkageShape<TResult>;
}

export const createPublicationEgressResponseLinkageBuilder = (): PublicationEgressResponseLinkageBuilder => {
  return {
    build<TResult = Record<string, unknown>>(input: {
      linkage_id: string;
      request_id: string;
      operation_id: string;
      egress_status: SurfaceResponseStatus;
      canonical_response: CanonicalResponseEnvelope<TResult>;
      typed_surface_response: TypedSurfaceResponse<TResult>;
      surface_type?: IntegrationSurfaceType;
      linked_error?: SurfaceErrorObject;
      warnings?: PublicationEgressWarning[];
      now?: IsoDateTimeString;
    }): PublicationEgressResponseLinkageShape<TResult> {
      const linkedAt = input.now ?? ((new Date().toISOString() as unknown) as IsoDateTimeString);
      return {
        linkage_id: input.linkage_id,
        request_id: input.request_id,
        operation_id: input.operation_id,
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
