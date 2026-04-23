import type { IsoDateTimeString } from "@orchestrator/core-foundation";
import type { CanonicalResponseEnvelope, SurfaceErrorObject, TypedSurfaceResponse } from "./request-response.js";
import type { IntegrationSurfaceType, SurfaceResponseStatus } from "./vocabularies.js";

export interface ReconciledIntegrationWarning {
  code: string;
  message: string;
}

export interface ReconciledIntegrationResponseLinkageShape<TResult = Record<string, unknown>> {
  linkage_id: string;
  request_id: string;
  operation_id: string;
  surface_type?: IntegrationSurfaceType;
  response_status: SurfaceResponseStatus;
  canonical_response: CanonicalResponseEnvelope<TResult>;
  typed_surface_response: TypedSurfaceResponse<TResult>;
  linked_error?: SurfaceErrorObject;
  warnings: ReconciledIntegrationWarning[];
  linked_at: IsoDateTimeString;
}

export interface ReconciledIntegrationResponseLinkageBuilder {
  build<TResult = Record<string, unknown>>(input: {
    linkage_id: string;
    request_id: string;
    operation_id: string;
    response_status: SurfaceResponseStatus;
    canonical_response: CanonicalResponseEnvelope<TResult>;
    typed_surface_response: TypedSurfaceResponse<TResult>;
    surface_type?: IntegrationSurfaceType;
    linked_error?: SurfaceErrorObject;
    warnings?: ReconciledIntegrationWarning[];
    now?: IsoDateTimeString;
  }): ReconciledIntegrationResponseLinkageShape<TResult>;
}

export const createReconciledIntegrationResponseLinkageBuilder = (): ReconciledIntegrationResponseLinkageBuilder => {
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
      warnings?: ReconciledIntegrationWarning[];
      now?: IsoDateTimeString;
    }): ReconciledIntegrationResponseLinkageShape<TResult> {
      const linkedAt = input.now ?? ((new Date().toISOString() as unknown) as IsoDateTimeString);
      return {
        linkage_id: input.linkage_id,
        request_id: input.request_id,
        operation_id: input.operation_id,
        ...(input.surface_type ? { surface_type: input.surface_type } : {}),
        response_status: input.response_status,
        canonical_response: input.canonical_response,
        typed_surface_response: input.typed_surface_response,
        ...(input.linked_error ? { linked_error: input.linked_error } : {}),
        warnings: input.warnings ?? [],
        linked_at: linkedAt
      };
    }
  };
};
