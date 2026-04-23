import type { AuditId, IsoDateTimeString } from "@orchestrator/core-foundation";
import type {
  CompletionIngressAuditLinkageShape,
  CompletionIngressTraceRecord,
  CompletionIngressTraceWarning
} from "@orchestrator/audit-eval";
import type { ExecutionHandoffResultShape } from "./execution-handoff-types.js";
import type { ExecutionResultReconciliationInputShape } from "./execution-result-reconciliation-types.js";
import type {
  CompletionArtifactFamily,
  CompletionIngressStatus,
  CompletionIngressWarningCode,
  CompletionRejectionReasonCode,
  CompletionValidationStatus
} from "./execution-completion-ingress-vocabularies.js";

export interface CompletionIngressWarningShape {
  code: CompletionIngressWarningCode;
  message: string;
}

export interface CompletionArtifactMetadataShape {
  artifact_id: string;
  artifact_kind: string;
  produced_at: IsoDateTimeString;
  producer_label?: string;
  artifact_version?: string;
}

export interface ExecutionCompletionEnvelopeShape {
  completion_envelope_id: string;
  request_id: string;
  operation_id: string;
  attempt_id?: string;
  contour_target?: "read_path" | "pack_loop" | "write_path" | "handoff";
  completion_family: CompletionArtifactFamily;
  artifact_metadata: CompletionArtifactMetadataShape;
  artifact_payload: Record<string, unknown>;
  warnings?: CompletionIngressWarningShape[];
  received_at?: IsoDateTimeString;
  source?: "future_execution_layer" | "external_integration" | "unknown_source";
}

export interface AttemptToCompletionLinkageShape {
  linkage_id: string;
  handoff_result_id: string;
  completion_envelope_id: string;
  request_id: string;
  operation_id: string;
  attempt_id?: string;
  linkage_status: "linked" | "missing_attempt" | "mismatched";
  linked_at: IsoDateTimeString;
  warnings: CompletionIngressWarningShape[];
}

export interface CompletionValidationResultShape {
  validation_id: string;
  status: CompletionValidationStatus;
  reasons: CompletionRejectionReasonCode[];
  warnings: CompletionIngressWarningShape[];
}

export interface CompletionToReconciliationIngressShape {
  ingress_id: string;
  request_id: string;
  operation_id: string;
  completion_family: CompletionArtifactFamily;
  reconciliation_input: ExecutionResultReconciliationInputShape;
  completion_payload: Record<string, unknown>;
  forwarded_at: IsoDateTimeString;
  notes: string[];
}

export interface AcceptedCompletionIngressResultShape {
  status: "accepted_completion";
  attempt_linkage: AttemptToCompletionLinkageShape;
  validation: CompletionValidationResultShape;
  completion_envelope: ExecutionCompletionEnvelopeShape;
  reconciliation_ingress: CompletionToReconciliationIngressShape;
}

export interface RejectedCompletionIngressResultShape {
  status: "rejected_completion";
  attempt_linkage: AttemptToCompletionLinkageShape;
  validation: CompletionValidationResultShape;
  completion_envelope: ExecutionCompletionEnvelopeShape;
}

export interface IncompleteCompletionIngressResultShape {
  status: "incomplete_completion";
  attempt_linkage: AttemptToCompletionLinkageShape;
  validation: CompletionValidationResultShape;
  completion_envelope: ExecutionCompletionEnvelopeShape;
}

export interface MismatchedCompletionIngressResultShape {
  status: "mismatched_completion";
  attempt_linkage: AttemptToCompletionLinkageShape;
  validation: CompletionValidationResultShape;
  completion_envelope: ExecutionCompletionEnvelopeShape;
}

export type ExecutionCompletionIngressOutcomeShape =
  | AcceptedCompletionIngressResultShape
  | RejectedCompletionIngressResultShape
  | IncompleteCompletionIngressResultShape
  | MismatchedCompletionIngressResultShape;

export interface ExecutionCompletionIngressInputShape {
  handoff_result: ExecutionHandoffResultShape;
  completion_envelope: ExecutionCompletionEnvelopeShape;
  now?: IsoDateTimeString;
  linked_audit_id?: AuditId;
}

export interface ExecutionCompletionIngressResultShape {
  ingress_result_id: string;
  status: CompletionIngressStatus;
  handoff_result_id: string;
  request_id: string;
  operation_id: string;
  completion_family: CompletionArtifactFamily;
  outcome: ExecutionCompletionIngressOutcomeShape;
  trace: CompletionIngressTraceRecord;
  trace_warnings: CompletionIngressTraceWarning[];
  audit_linkage: CompletionIngressAuditLinkageShape;
  warnings: CompletionIngressWarningShape[];
  processed_at: IsoDateTimeString;
}

export interface ExecutionCompletionIngressSummaryShape {
  total: number;
  accepted_completion: number;
  rejected_completion: number;
  incomplete_completion: number;
  mismatched_completion: number;
  warnings: CompletionIngressWarningShape[];
}
