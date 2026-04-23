import type { AuditId, IsoDateTimeString } from "@orchestrator/core-foundation";
import type { FinalizedOutcomeAuditLinkageShape } from "@orchestrator/audit-eval";
import type { FinalizedIntegrationResponseLinkageShape, SurfaceResponseStatus } from "@orchestrator/integration-contracts";
import type { RuntimeSurfaceFinalizedEnvelopeShape } from "@orchestrator/runtime-surface";
import type { AcceptedCompletionIngressResultShape, ExecutionCompletionIngressResultShape } from "./execution-completion-ingress-types.js";
import type { ExecutionResultReconciliationShape } from "./execution-result-reconciliation-types.js";
import type {
  ExecutionFinalizationStatus,
  ExecutionFinalizedOutcomeFamily,
  ExecutionFinalizationWarningCode
} from "./execution-outcome-finalization-vocabularies.js";

export interface ExecutionFinalizationWarningShape {
  code: ExecutionFinalizationWarningCode;
  message: string;
}

export interface AcceptedCompletionToFinalizationLinkageShape {
  linkage_id: string;
  completion_ingress_result_id: string;
  reconciliation_id: string;
  request_id: string;
  operation_id: string;
  completion_family: AcceptedCompletionIngressResultShape["completion_envelope"]["completion_family"];
  linked_at: IsoDateTimeString;
  warnings: ExecutionFinalizationWarningShape[];
}

export interface FinalizationStatusMappingShape {
  finalization_status: ExecutionFinalizationStatus;
  surface_status: SurfaceResponseStatus;
  outcome_family: ExecutionFinalizedOutcomeFamily;
}

export interface FinalizedOutcomePlaceholderFamiliesShape {
  completed_placeholder?: Record<string, unknown>;
  blocked_placeholder?: Record<string, unknown>;
  deferred_placeholder?: Record<string, unknown>;
  failed_placeholder?: Record<string, unknown>;
}

export interface PartialFinalizationResultShape {
  status: "partial_finalized";
  reason: string;
  placeholder_families: FinalizedOutcomePlaceholderFamiliesShape;
}

export interface ExecutionOutcomeFinalizationInputShape {
  completion_ingress_result: ExecutionCompletionIngressResultShape;
  reconciliation_result: ExecutionResultReconciliationShape;
  now?: IsoDateTimeString;
  linked_audit_id?: AuditId;
}

export interface ExecutionOutcomeFinalizationShape {
  finalization_id: string;
  request_id: string;
  operation_id: string;
  finalization_status: ExecutionFinalizationStatus;
  finalized_outcome_family: ExecutionFinalizedOutcomeFamily;
  accepted_completion_linkage?: AcceptedCompletionToFinalizationLinkageShape;
  status_mapping: FinalizationStatusMappingShape;
  partial_finalization?: PartialFinalizationResultShape;
  finalized_surface_envelope: RuntimeSurfaceFinalizedEnvelopeShape;
  finalized_integration_envelope: FinalizedIntegrationResponseLinkageShape<Record<string, unknown>>;
  finalized_audit_linkage: FinalizedOutcomeAuditLinkageShape;
  warnings: ExecutionFinalizationWarningShape[];
  finalized_at: IsoDateTimeString;
}

export interface ExecutionOutcomeFinalizationSummaryShape {
  total: number;
  completed_finalized: number;
  partial_finalized: number;
  blocked_finalized: number;
  deferred_finalized: number;
  failed_finalized: number;
  incomplete_finalization: number;
  warnings: ExecutionFinalizationWarningShape[];
}
