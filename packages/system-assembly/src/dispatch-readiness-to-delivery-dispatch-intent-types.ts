import type { AuditId, IsoDateTimeString, OperationalContour } from "@orchestrator/core-foundation";
import type {
  DeliveryDispatchIntentAuditLinkageShape,
  DeliveryDispatchIntentTraceShape
} from "@orchestrator/audit-eval";
import type { DeliveryDispatchIntentLinkageShape } from "@orchestrator/integration-contracts";
import type { RuntimeDeliveryDispatchIntentEnvelopeShape } from "@orchestrator/runtime-surface";
import type { PublicationDispatchReadinessShape } from "./publication-preparation-to-dispatch-readiness-types.js";
import type {
  DeliveryDispatchIntentFamily,
  DeliveryDispatchIntentResult,
  DeliveryDispatchIntentStatus,
  DeliveryDispatchIntentWarningCode
} from "./dispatch-readiness-to-delivery-dispatch-intent-vocabularies.js";

export interface DeliveryDispatchIntentWarningShape {
  code: DeliveryDispatchIntentWarningCode;
  message: string;
}

export interface DeliveryDispatchIntentInputShape {
  dispatch_readiness: PublicationDispatchReadinessShape;
  linked_audit_id?: AuditId;
  now?: IsoDateTimeString;
}

export interface DeliveryDispatchIntentFamilyMappingShape {
  dispatch_readiness_family: PublicationDispatchReadinessShape["dispatch_readiness_family"];
  contour_target: OperationalContour | "unknown";
  delivery_dispatch_intent_family: DeliveryDispatchIntentFamily;
}

export interface DispatchReadinessDeliveryDispatchIntentMappingShape {
  dispatch_readiness_status: PublicationDispatchReadinessShape["dispatch_readiness_status"];
  publication_preparation_status: PublicationDispatchReadinessShape["publication_preparation_status"];
  normalized_outcome_status: PublicationDispatchReadinessShape["normalized_outcome_status"];
  lifecycle_state: PublicationDispatchReadinessShape["lifecycle_state"];
  delivery_dispatch_intent_status: DeliveryDispatchIntentStatus;
  delivery_dispatch_intent_result: DeliveryDispatchIntentResult;
  mapping_boundary: "dispatch_readiness_placeholder_to_delivery_dispatch_intent_placeholder";
}

export interface DeliveryDispatchIntentBoundaryShape {
  delivery_dispatch_intent_id: string;
  dispatch_readiness_id: string;
  publication_preparation_id: string;
  normalized_outcome_id: string;
  attempt_id: string;
  boundary_status: "delivery_dispatch_intent_contract_only_future_dispatch_boundary";
  allowed_now: {
    dispatch_readiness_to_delivery_dispatch_intent_mapping: true;
    runtime_surface_delivery_dispatch_intent_envelope_emission: true;
    integration_delivery_dispatch_intent_linkage_emission: true;
    audit_eval_delivery_dispatch_intent_linkage_emission: true;
  };
  disallowed_now: {
    actual_dispatch_execution: true;
    actual_publication_delivery: true;
    handler_invocation: true;
    delivery_runtime_execution: true;
    transport_delivery: true;
    provider_sdk_execution: true;
    concrete_persistence_write: true;
    canonical_context_direct_access: true;
    canonical_context_direct_writeback: true;
  };
}

export interface DeliveryDispatchIntentShape {
  delivery_dispatch_intent_id: string;
  dispatch_readiness_id: string;
  publication_preparation_id: string;
  normalized_outcome_id: string;
  attempt_id: string;
  request_id: string;
  operation_id: string;
  precheck_id: string;
  source_dispatch_intent_id: string;
  runtime_handoff_id: string;
  delivery_dispatch_intent_family: DeliveryDispatchIntentFamily;
  delivery_dispatch_intent_status: DeliveryDispatchIntentStatus;
  delivery_dispatch_intent_result: DeliveryDispatchIntentResult;
  dispatch_readiness_family: PublicationDispatchReadinessShape["dispatch_readiness_family"];
  dispatch_readiness_status: PublicationDispatchReadinessShape["dispatch_readiness_status"];
  publication_preparation_family: PublicationDispatchReadinessShape["publication_preparation_family"];
  publication_preparation_status: PublicationDispatchReadinessShape["publication_preparation_status"];
  normalized_outcome_family: PublicationDispatchReadinessShape["normalized_outcome_family"];
  normalized_outcome_status: PublicationDispatchReadinessShape["normalized_outcome_status"];
  lifecycle_state: PublicationDispatchReadinessShape["lifecycle_state"];
  contour_target: OperationalContour | "unknown";
  family_mapping: DeliveryDispatchIntentFamilyMappingShape;
  status_mapping: DispatchReadinessDeliveryDispatchIntentMappingShape;
  authority_context_placeholder: PublicationDispatchReadinessShape["authority_context_placeholder"];
  delivery_dispatch_intent_boundary: DeliveryDispatchIntentBoundaryShape;
  runtime_surface_delivery_dispatch_intent_envelope: RuntimeDeliveryDispatchIntentEnvelopeShape;
  integration_delivery_dispatch_intent_linkage: DeliveryDispatchIntentLinkageShape<Record<string, unknown>>;
  delivery_dispatch_intent_trace: DeliveryDispatchIntentTraceShape;
  delivery_dispatch_intent_audit_linkage: DeliveryDispatchIntentAuditLinkageShape;
  warnings: DeliveryDispatchIntentWarningShape[];
  created_at: IsoDateTimeString;
}

export interface DeliveryDispatchIntentSummaryShape {
  total: number;
  queued: number;
  prepared: number;
  blocked: number;
  deferred: number;
  aborted: number;
  expired: number;
  cancelled: number;
  not_dispatchable: number;
  by_delivery_dispatch_intent_family: Record<DeliveryDispatchIntentFamily, number>;
  warnings: DeliveryDispatchIntentWarningShape[];
}
