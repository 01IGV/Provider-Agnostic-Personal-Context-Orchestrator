import type { IsoDateTimeString } from "@orchestrator/core-foundation";
import type { CanonicalResponseEnvelope, SurfaceErrorObject, TypedSurfaceResponse } from "./request-response.js";
import type { IntegrationSurfaceType, SurfaceResponseStatus } from "./vocabularies.js";

export interface FinalizedIntegrationWarning {
  code: string;
  message: string;
}

export interface FinalizedIntegrationResponseLinkageShape<TResult = Record<string, unknown>> {
  linkage_id: string;
  request_id: string;
  operation_id: string;
  response_status: SurfaceResponseStatus;
  surface_type?: IntegrationSurfaceType;
  canonical_response: CanonicalResponseEnvelope<TResult>;
  typed_surface_response: TypedSurfaceResponse<TResult>;
  linked_error?: SurfaceErrorObject;
  warnings: FinalizedIntegrationWarning[];
  linked_at: IsoDateTimeString;
}

export interface FinalizedIntegrationResponseLinkageBuilder {
  build<TResult = Record<string, unknown>>(input: {
    linkage_id: string;
    request_id: string;
    operation_id: string;
    response_status: SurfaceResponseStatus;
    canonical_response: CanonicalResponseEnvelope<TResult>;
    typed_surface_response: TypedSurfaceResponse<TResult>;
    surface_type?: IntegrationSurfaceType;
    linked_error?: SurfaceErrorObject;
    warnings?: FinalizedIntegrationWarning[];
    now?: IsoDateTimeString;
  }): FinalizedIntegrationResponseLinkageShape<TResult>;
}

export const createFinalizedIntegrationResponseLinkageBuilder = (): FinalizedIntegrationResponseLinkageBuilder => {
  return {
    build<TResult = Record<string, unknown>>(input: {
      linkage_id: string;
      request_id: string;
      operation_id: string;
      response_status: SurfaceResponseStatus;
      canonical_response: CanonicalResponseEnvelope<TResult>;
      typed_surface_response: TypedSurfaceResponse<TResult>;
      surface_type?: IntegrationSurfaceType;
      linked_error?: SurfaceErrorObject;
      warnings?: FinalizedIntegrationWarning[];
      now?: IsoDateTimeString;
    }): FinalizedIntegrationResponseLinkageShape<TResult> {
      const linkedAt = input.now ?? ((new Date().toISOString() as unknown) as IsoDateTimeString);
      return {
        linkage_id: input.linkage_id,
        request_id: input.request_id,
        operation_id: input.operation_id,
        response_status: input.response_status,
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
