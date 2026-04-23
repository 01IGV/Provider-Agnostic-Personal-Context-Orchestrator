import type { AuditId, IsoDateTimeString, OperationalContour } from "@orchestrator/core-foundation";

export interface ReconciledOutcomeAuditWarning {
  code: string;
  message: string;
}

export interface ReconciledOutcomeAuditLinkageShape {
  linkage_id: string;
  request_id: string;
  operation_id: string;
  attempt_id?: string;
  contour_target?: OperationalContour;
  reconciled_status: string;
  expected_result_kind: string;
  linked_audit_id?: AuditId;
  hook_status: "pending_audit_reconciliation" | "audit_reconciliation_linked";
  warnings: ReconciledOutcomeAuditWarning[];
  linked_at: IsoDateTimeString;
}

export interface ReconciledOutcomeAuditLinkageBuilder {
  build(input: {
    linkage_id: string;
    request_id: string;
    operation_id: string;
    reconciled_status: string;
    expected_result_kind: string;
    attempt_id?: string;
    contour_target?: OperationalContour;
    linked_audit_id?: AuditId;
    warnings?: ReconciledOutcomeAuditWarning[];
    now?: IsoDateTimeString;
  }): ReconciledOutcomeAuditLinkageShape;
}

export const createReconciledOutcomeAuditLinkageBuilder = (): ReconciledOutcomeAuditLinkageBuilder => {
  return {
    build(input): ReconciledOutcomeAuditLinkageShape {
      const linkedAt = input.now ?? ((new Date().toISOString() as unknown) as IsoDateTimeString);
      return {
        linkage_id: input.linkage_id,
        request_id: input.request_id,
        operation_id: input.operation_id,
        ...(input.attempt_id ? { attempt_id: input.attempt_id } : {}),
        ...(input.contour_target ? { contour_target: input.contour_target } : {}),
        reconciled_status: input.reconciled_status,
        expected_result_kind: input.expected_result_kind,
        ...(input.linked_audit_id ? { linked_audit_id: input.linked_audit_id } : {}),
        hook_status: input.linked_audit_id ? "audit_reconciliation_linked" : "pending_audit_reconciliation",
        warnings: input.warnings ?? [],
        linked_at: linkedAt
      };
    }
  };
};
