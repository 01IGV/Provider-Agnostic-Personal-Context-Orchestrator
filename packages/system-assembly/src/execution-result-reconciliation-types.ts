import type { AuditId, IsoDateTimeString } from "@orchestrator/core-foundation";
import type {
  ReconciledIntegrationResponseLinkageShape,
  SurfaceResponseStatus
} from "@orchestrator/integration-contracts";
import type { ReconciledOutcomeAuditLinkageShape } from "@orchestrator/audit-eval";
import type { RuntimeSurfaceReconciledOutcomeShape } from "@orchestrator/runtime-surface";
import type { ExecutionHandoffResultShape } from "./execution-handoff-types.js";
import type {
  ExecutionOutcomeFamily,
  ReconciledOutcomeStatus,
  ReconciliationWarningCode
} from "./execution-result-reconciliation-vocabularies.js";

export interface ReconciliationWarningShape {
  code: ReconciliationWarningCode;
  message: string;
}

export interface ExecutionOutcomeFamilyShape {
  request_id: string;
  operation_id: string;
  contour_target?: "read_path" | "pack_loop" | "write_path" | "handoff";
  expected_result_kind?: string;
  outcome_family: ExecutionOutcomeFamily;
}

export interface AttemptResultReconciliationShape {
  reconciliation_id: string;
  handoff_result_id: string;
  request_id: string;
  operation_id: string;
  handoff_status: ExecutionHandoffResultShape["status"];
  reconciled_status: ReconciledOutcomeStatus;
  warnings: ReconciliationWarningShape[];
}

export interface ReconciledExecutionPlaceholderOutcomeShape {
  request_id: string;
  operation_id: string;
  attempt_id?: string;
  reconciled_status: ReconciledOutcomeStatus;
  expected_result_kind?: string;
  placeholder_payload: Record<string, unknown>;
}

export interface RuntimeSurfaceFacingReconciledResultShape {
  runtime_surface_outcome: RuntimeSurfaceReconciledOutcomeShape;
  surface_status: SurfaceResponseStatus;
  warnings: ReconciliationWarningShape[];
}

export interface IntegrationFacingReconciledResponseLinkageShape {
  integration_response: ReconciledIntegrationResponseLinkageShape<Record<string, unknown>>;
  warnings: ReconciliationWarningShape[];
}

export interface ReconciledOutcomeAuditLinkageContractShape {
  audit_linkage: ReconciledOutcomeAuditLinkageShape;
  warnings: ReconciliationWarningShape[];
}

export interface ExecutionResultReconciliationInputShape {
  handoff_result: ExecutionHandoffResultShape;
  now?: IsoDateTimeString;
  linked_audit_id?: AuditId;
}

export interface ExecutionResultReconciliationShape {
  reconciliation_id: string;
  request_id: string;
  operation_id: string;
  outcome_family: ExecutionOutcomeFamilyShape;
  attempt_reconciliation: AttemptResultReconciliationShape;
  placeholder_outcome: ReconciledExecutionPlaceholderOutcomeShape;
  runtime_surface_result: RuntimeSurfaceFacingReconciledResultShape;
  integration_response_linkage: IntegrationFacingReconciledResponseLinkageShape;
  audit_linkage: ReconciledOutcomeAuditLinkageContractShape;
  warnings: ReconciliationWarningShape[];
  reconciled_at: IsoDateTimeString;
}

export interface ExecutionResultReconciliationSummaryShape {
  total: number;
  completed_placeholders: number;
  ready_placeholders: number;
  blocked_placeholders: number;
  deferred_placeholders: number;
  failed_or_incomplete: number;
  warnings: ReconciliationWarningShape[];
}
