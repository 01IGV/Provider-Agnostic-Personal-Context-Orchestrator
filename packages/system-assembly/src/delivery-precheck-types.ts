import type { AuditId, IsoDateTimeString } from "@orchestrator/core-foundation";
import type {
  DeliveryPrecheckAuditLinkageShape,
  DeliveryPrecheckTraceShape
} from "@orchestrator/audit-eval";
import type {
  DeliveryPrecheckLinkageShape,
  SurfaceResponseStatus
} from "@orchestrator/integration-contracts";
import type {
  RuntimeDeliveryPrecheckEnvelopeShape,
  RuntimeDeliveryPrecheckStatus,
  RuntimeTargetHandlerFamily
} from "@orchestrator/runtime-surface";
import type { PublicationDispatchIntentShape } from "./publication-dispatch-intent-types.js";
import type {
  DeliveryPrecheckFamily,
  DeliveryPrecheckStatus,
  DeliveryPrecheckWarningCode,
  TargetHandlerFamily
} from "./delivery-precheck-vocabularies.js";

export interface DeliveryPrecheckWarningShape {
  code: DeliveryPrecheckWarningCode;
  message: string;
}

export interface HandlerReadinessShape {
  target_handler_family: TargetHandlerFamily;
  handler_boundary: "mcp_handler_boundary" | "api_handler_boundary" | "hybrid_handler_boundary" | "unknown_handler_boundary";
  readiness: "ready" | "unavailable" | "unsupported" | "partially_ready" | "unknown";
  reason: string;
  warnings: DeliveryPrecheckWarningShape[];
}

export interface ChannelReadinessShape {
  channel_family: PublicationDispatchIntentShape["dispatch_target_expectation"]["expected_channel_family"];
  readiness: "ready" | "unavailable" | "unsupported" | "partially_ready" | "unknown";
  reason: string;
  warnings: DeliveryPrecheckWarningShape[];
}

export interface DeliveryCapabilityFitShape {
  required_capabilities: string[];
  available_capabilities: string[];
  fit: "fit" | "partial_fit" | "no_fit" | "unknown_fit";
  reason: string;
  warnings: DeliveryPrecheckWarningShape[];
}

export interface HandlerBoundaryExpectationShape {
  target_handler_family: TargetHandlerFamily;
  handler_boundary: "mcp_handler_boundary" | "api_handler_boundary" | "hybrid_handler_boundary" | "unknown_handler_boundary";
  expected_dispatch_mode: PublicationDispatchIntentShape["dispatch_target_expectation"]["expected_dispatch_mode"];
  required_dispatch_capabilities: string[];
  readiness_status: DeliveryPrecheckStatus;
  warnings: DeliveryPrecheckWarningShape[];
}

export interface DeliveryTargetExpectationShape {
  precheck_family: DeliveryPrecheckFamily;
  channel_family: PublicationDispatchIntentShape["dispatch_target_expectation"]["expected_channel_family"];
  target_handler_family: TargetHandlerFamily;
  handler_boundary_expectation: HandlerBoundaryExpectationShape;
  warnings: DeliveryPrecheckWarningShape[];
}

export interface PrecheckToHandlerBoundaryLinkageShape {
  linkage_id: string;
  dispatch_intent_id: string;
  request_id: string;
  operation_id: string;
  precheck_family: DeliveryPrecheckFamily;
  target_handler_family: TargetHandlerFamily;
  linked_at: IsoDateTimeString;
  warnings: DeliveryPrecheckWarningShape[];
}

export interface DeliveryPrecheckStatusMappingShape {
  precheck_status: DeliveryPrecheckStatus;
  runtime_status: RuntimeDeliveryPrecheckStatus;
  surface_status: SurfaceResponseStatus;
}

export interface ReadyPrecheckContractShape {
  status: "ready";
  reason: string;
  payload: Record<string, unknown>;
}

export interface BlockedPrecheckContractShape {
  status: "blocked";
  reason: string;
  payload: Record<string, unknown>;
}

export interface DeferredPrecheckContractShape {
  status: "deferred";
  reason: string;
  payload: Record<string, unknown>;
}

export interface UnavailablePrecheckContractShape {
  status: "unavailable";
  reason: string;
  payload: Record<string, unknown>;
}

export interface UnsupportedPrecheckContractShape {
  status: "unsupported";
  reason: string;
  payload: Record<string, unknown>;
}

export interface PartiallyReadyPrecheckContractShape {
  status: "partially_ready";
  reason: string;
  payload: Record<string, unknown>;
}

export interface DeliveryPrecheckInputShape {
  dispatch_intent: PublicationDispatchIntentShape;
  now?: IsoDateTimeString;
  linked_audit_id?: AuditId;
}

export interface DeliveryPrecheckShape {
  precheck_id: string;
  request_id: string;
  operation_id: string;
  dispatch_intent_id: string;
  precheck_family: DeliveryPrecheckFamily;
  precheck_status: DeliveryPrecheckStatus;
  status_mapping: DeliveryPrecheckStatusMappingShape;
  handler_readiness: HandlerReadinessShape;
  channel_readiness: ChannelReadinessShape;
  delivery_capability_fit: DeliveryCapabilityFitShape;
  delivery_target_expectation: DeliveryTargetExpectationShape;
  precheck_handler_boundary_linkage: PrecheckToHandlerBoundaryLinkageShape;
  ready_precheck?: ReadyPrecheckContractShape;
  blocked_precheck?: BlockedPrecheckContractShape;
  deferred_precheck?: DeferredPrecheckContractShape;
  unavailable_precheck?: UnavailablePrecheckContractShape;
  unsupported_precheck?: UnsupportedPrecheckContractShape;
  partially_ready_precheck?: PartiallyReadyPrecheckContractShape;
  runtime_precheck_envelope: RuntimeDeliveryPrecheckEnvelopeShape;
  integration_precheck_linkage: DeliveryPrecheckLinkageShape<Record<string, unknown>>;
  precheck_trace: DeliveryPrecheckTraceShape;
  precheck_audit_linkage: DeliveryPrecheckAuditLinkageShape;
  warnings: DeliveryPrecheckWarningShape[];
  prepared_at: IsoDateTimeString;
}

export interface DeliveryPrecheckSummaryShape {
  total: number;
  ready: number;
  blocked: number;
  deferred: number;
  unavailable: number;
  unsupported: number;
  partially_ready: number;
  by_target_handler_family: Record<RuntimeTargetHandlerFamily, number>;
  warnings: DeliveryPrecheckWarningShape[];
}
