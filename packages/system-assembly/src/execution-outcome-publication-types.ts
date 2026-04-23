import type { AuditId, IsoDateTimeString } from "@orchestrator/core-foundation";
import type { PublicationOutcomeAuditLinkageShape } from "@orchestrator/audit-eval";
import type { PublicationEgressResponseLinkageShape, SurfaceResponseStatus } from "@orchestrator/integration-contracts";
import type { RuntimeSurfaceDeliveryReadyEnvelopeShape } from "@orchestrator/runtime-surface";
import type { ExecutionOutcomeFinalizationShape } from "./execution-outcome-finalization-types.js";
import type {
  ExecutionPublicationOutcomeFamily,
  ExecutionPublicationStatus,
  ExecutionPublicationWarningCode
} from "./execution-outcome-publication-vocabularies.js";

export interface ExecutionPublicationWarningShape {
  code: ExecutionPublicationWarningCode;
  message: string;
}

export interface FinalizedOutcomeToPublicationLinkageShape {
  linkage_id: string;
  finalization_id: string;
  request_id: string;
  operation_id: string;
  finalized_outcome_family: ExecutionOutcomeFinalizationShape["finalized_outcome_family"];
  publication_family: ExecutionPublicationOutcomeFamily;
  linked_at: IsoDateTimeString;
  warnings: ExecutionPublicationWarningShape[];
}

export interface PublicationStatusMappingShape {
  publication_status: ExecutionPublicationStatus;
  surface_status: SurfaceResponseStatus;
  publication_family: ExecutionPublicationOutcomeFamily;
}

export interface BlockedPublicationContractShape {
  status: "publication_blocked";
  reason: string;
  payload: Record<string, unknown>;
}

export interface DeferredPublicationContractShape {
  status: "publication_deferred";
  reason: string;
  payload: Record<string, unknown>;
}

export interface PartialOrIncompletePublicationContractShape {
  status: "publication_partial" | "publication_incomplete";
  reason: string;
  payload: Record<string, unknown>;
}

export interface ExecutionOutcomePublicationInputShape {
  finalization_result: ExecutionOutcomeFinalizationShape;
  now?: IsoDateTimeString;
  linked_audit_id?: AuditId;
}

export interface ExecutionOutcomePublicationShape {
  publication_id: string;
  request_id: string;
  operation_id: string;
  publication_family: ExecutionPublicationOutcomeFamily;
  publication_status: ExecutionPublicationStatus;
  finalized_linkage: FinalizedOutcomeToPublicationLinkageShape;
  status_mapping: PublicationStatusMappingShape;
  blocked_publication?: BlockedPublicationContractShape;
  deferred_publication?: DeferredPublicationContractShape;
  partial_or_incomplete_publication?: PartialOrIncompletePublicationContractShape;
  delivery_ready_surface_envelope: RuntimeSurfaceDeliveryReadyEnvelopeShape;
  integration_ready_egress_envelope: PublicationEgressResponseLinkageShape<Record<string, unknown>>;
  publication_audit_linkage: PublicationOutcomeAuditLinkageShape;
  warnings: ExecutionPublicationWarningShape[];
  prepared_at: IsoDateTimeString;
}

export interface ExecutionOutcomePublicationSummaryShape {
  total: number;
  publication_ready: number;
  publication_blocked: number;
  publication_deferred: number;
  publication_partial: number;
  publication_incomplete: number;
  publication_failed: number;
  warnings: ExecutionPublicationWarningShape[];
}
