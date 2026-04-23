import type { AuditId, IsoDateTimeString, OperationalContour } from "@orchestrator/core-foundation";

export interface PublicationOutcomeAuditWarning {
  code: string;
  message: string;
}

export interface PublicationOutcomeAuditLinkageShape {
  linkage_id: string;
  request_id: string;
  operation_id: string;
  attempt_id?: string;
  contour_target?: OperationalContour;
  publication_status: string;
  publication_family: string;
  linked_audit_id?: AuditId;
  hook_status: "pending_publication_audit" | "publication_audit_linked";
  warnings: PublicationOutcomeAuditWarning[];
  linked_at: IsoDateTimeString;
}

export interface PublicationOutcomeAuditLinkageBuilder {
  build(input: {
    linkage_id: string;
    request_id: string;
    operation_id: string;
    publication_status: string;
    publication_family: string;
    attempt_id?: string;
    contour_target?: OperationalContour;
    linked_audit_id?: AuditId;
    warnings?: PublicationOutcomeAuditWarning[];
    now?: IsoDateTimeString;
  }): PublicationOutcomeAuditLinkageShape;
}

export const createPublicationOutcomeAuditLinkageBuilder = (): PublicationOutcomeAuditLinkageBuilder => {
  return {
    build(input): PublicationOutcomeAuditLinkageShape {
      const linkedAt = input.now ?? ((new Date().toISOString() as unknown) as IsoDateTimeString);
      return {
        linkage_id: input.linkage_id,
        request_id: input.request_id,
        operation_id: input.operation_id,
        ...(input.attempt_id ? { attempt_id: input.attempt_id } : {}),
        ...(input.contour_target ? { contour_target: input.contour_target } : {}),
        publication_status: input.publication_status,
        publication_family: input.publication_family,
        ...(input.linked_audit_id ? { linked_audit_id: input.linked_audit_id } : {}),
        hook_status: input.linked_audit_id ? "publication_audit_linked" : "pending_publication_audit",
        warnings: input.warnings ?? [],
        linked_at: linkedAt
      };
    }
  };
};
