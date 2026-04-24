import type { AuditId, IsoDateTimeString, OperationalContour } from "@orchestrator/core-foundation";
import type {
  DeliveryDispatchPrecheckAuditLinkageShape,
  DeliveryDispatchPrecheckTraceShape
} from "@orchestrator/audit-eval";
import type { DeliveryDispatchPrecheckLinkageShape } from "@orchestrator/integration-contracts";
import type { RuntimeDeliveryDispatchPrecheckEnvelopeShape } from "@orchestrator/runtime-surface";
import type { DeliveryDispatchIntentShape } from "./dispatch-readiness-to-delivery-dispatch-intent-types.js";
import type {
  DeliveryDispatchPrecheckFamily,
  DeliveryDispatchPrecheckResult,
  DeliveryDispatchPrecheckStatus,
  DeliveryDispatchPrecheckWarningCode
} from "./delivery-dispatch-intent-to-delivery-dispatch-precheck-vocabularies.js";

export interface DeliveryDispatchPrecheckWarningShape {
  code: DeliveryDispatchPrecheckWarningCode;
  message: string;
}

export interface DeliveryDispatchPrecheckInputShape {
  delivery_dispatch_intent: DeliveryDispatchIntentShape;
  linked_audit_id?: AuditId;
  now?: IsoDateTimeString;
}

export interface DeliveryDispatchPrecheckFamilyMappingShape {
  delivery_dispatch_intent_family: DeliveryDispatchIntentShape["delivery_dispatch_intent_family"];
  contour_target: OperationalContour | "unknown";
  delivery_dispatch_precheck_family: DeliveryDispatchPrecheckFamily;
}

export interface DeliveryDispatchIntentPrecheckMappingShape {
  delivery_dispatch_intent_status: DeliveryDispatchIntentShape["delivery_dispatch_intent_status"];
  dispatch_readiness_status: DeliveryDispatchIntentShape["dispatch_readiness_status"];
  publication_preparation_status: DeliveryDispatchIntentShape["publication_preparation_status"];
  normalized_outcome_status: DeliveryDispatchIntentShape["normalized_outcome_status"];
  lifecycle_state: DeliveryDispatchIntentShape["lifecycle_state"];
  delivery_dispatch_precheck_status: DeliveryDispatchPrecheckStatus;
  delivery_dispatch_precheck_result: DeliveryDispatchPrecheckResult;
  mapping_boundary: "delivery_dispatch_intent_placeholder_to_delivery_dispatch_precheck_placeholder";
}

export interface DeliveryDispatchPrecheckBoundaryShape {
  delivery_dispatch_precheck_id: string;
  delivery_dispatch_intent_id: string;
  dispatch_readiness_id: string;
  publication_preparation_id: string;
  normalized_outcome_id: string;
  attempt_id: string;
  boundary_status: "delivery_dispatch_precheck_contract_only_future_dispatch_boundary";
  allowed_now: {
    delivery_dispatch_intent_to_delivery_dispatch_precheck_mapping: true;
    runtime_surface_delivery_dispatch_precheck_envelope_emission: true;
    integration_delivery_dispatch_precheck_linkage_emission: true;
    audit_eval_delivery_dispatch_precheck_linkage_emission: true;
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

export interface DeliveryDispatchPrecheckShape {
  delivery_dispatch_precheck_id: string;
  delivery_dispatch_intent_id: string;
  dispatch_readiness_id: string;
  publication_preparation_id: string;
  normalized_outcome_id: string;
  attempt_id: string;
  request_id: string;
  operation_id: string;
  source_precheck_id: string;
  source_dispatch_intent_id: string;
  runtime_handoff_id: string;
  delivery_dispatch_precheck_family: DeliveryDispatchPrecheckFamily;
  delivery_dispatch_precheck_status: DeliveryDispatchPrecheckStatus;
  delivery_dispatch_precheck_result: DeliveryDispatchPrecheckResult;
  delivery_dispatch_intent_family: DeliveryDispatchIntentShape["delivery_dispatch_intent_family"];
  delivery_dispatch_intent_status: DeliveryDispatchIntentShape["delivery_dispatch_intent_status"];
  dispatch_readiness_family: DeliveryDispatchIntentShape["dispatch_readiness_family"];
  dispatch_readiness_status: DeliveryDispatchIntentShape["dispatch_readiness_status"];
  publication_preparation_family: DeliveryDispatchIntentShape["publication_preparation_family"];
  publication_preparation_status: DeliveryDispatchIntentShape["publication_preparation_status"];
  normalized_outcome_family: DeliveryDispatchIntentShape["normalized_outcome_family"];
  normalized_outcome_status: DeliveryDispatchIntentShape["normalized_outcome_status"];
  lifecycle_state: DeliveryDispatchIntentShape["lifecycle_state"];
  contour_target: OperationalContour | "unknown";
  family_mapping: DeliveryDispatchPrecheckFamilyMappingShape;
  status_mapping: DeliveryDispatchIntentPrecheckMappingShape;
  authority_context_placeholder: DeliveryDispatchIntentShape["authority_context_placeholder"];
  delivery_dispatch_precheck_boundary: DeliveryDispatchPrecheckBoundaryShape;
  runtime_surface_delivery_dispatch_precheck_envelope: RuntimeDeliveryDispatchPrecheckEnvelopeShape;
  integration_delivery_dispatch_precheck_linkage: DeliveryDispatchPrecheckLinkageShape<Record<string, unknown>>;
  delivery_dispatch_precheck_trace: DeliveryDispatchPrecheckTraceShape;
  delivery_dispatch_precheck_audit_linkage: DeliveryDispatchPrecheckAuditLinkageShape;
  warnings: DeliveryDispatchPrecheckWarningShape[];
  created_at: IsoDateTimeString;
}

export interface DeliveryDispatchPrecheckSummaryShape {
  total: number;
  queued: number;
  prepared: number;
  blocked: number;
  deferred: number;
  aborted: number;
  expired: number;
  cancelled: number;
  not_dispatchable: number;
  by_delivery_dispatch_precheck_family: Record<DeliveryDispatchPrecheckFamily, number>;
  warnings: DeliveryDispatchPrecheckWarningShape[];
}
