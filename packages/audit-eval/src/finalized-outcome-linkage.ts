import type { AuditId, IsoDateTimeString, OperationalContour } from "@orchestrator/core-foundation";

export interface FinalizedOutcomeAuditWarning {
  code: string;
  message: string;
}

export interface FinalizedOutcomeAuditLinkageShape {
  linkage_id: string;
  request_id: string;
  operation_id: string;
  attempt_id?: string;
  contour_target?: OperationalContour;
  finalization_status: string;
  outcome_family: string;
  linked_audit_id?: AuditId;
  hook_status: "pending_finalized_audit" | "finalized_audit_linked";
  warnings: FinalizedOutcomeAuditWarning[];
  linked_at: IsoDateTimeString;
}

export interface FinalizedOutcomeAuditLinkageBuilder {
  build(input: {
    linkage_id: string;
    request_id: string;
    operation_id: string;
    finalization_status: string;
    outcome_family: string;
    attempt_id?: string;
    contour_target?: OperationalContour;
    linked_audit_id?: AuditId;
    warnings?: FinalizedOutcomeAuditWarning[];
    now?: IsoDateTimeString;
  }): FinalizedOutcomeAuditLinkageShape;
}

export const createFinalizedOutcomeAuditLinkageBuilder = (): FinalizedOutcomeAuditLinkageBuilder => {
  return {
    build(input): FinalizedOutcomeAuditLinkageShape {
      const linkedAt = input.now ?? ((new Date().toISOString() as unknown) as IsoDateTimeString);
      return {
        linkage_id: input.linkage_id,
        request_id: input.request_id,
        operation_id: input.operation_id,
        ...(input.attempt_id ? { attempt_id: input.attempt_id } : {}),
        ...(input.contour_target ? { contour_target: input.contour_target } : {}),
        finalization_status: input.finalization_status,
        outcome_family: input.outcome_family,
        ...(input.linked_audit_id ? { linked_audit_id: input.linked_audit_id } : {}),
        hook_status: input.linked_audit_id ? "finalized_audit_linked" : "pending_finalized_audit",
        warnings: input.warnings ?? [],
        linked_at: linkedAt
      };
    }
  };
};
