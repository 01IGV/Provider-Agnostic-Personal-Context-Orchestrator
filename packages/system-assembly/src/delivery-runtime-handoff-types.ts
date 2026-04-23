import type { AuditId, IsoDateTimeString } from "@orchestrator/core-foundation";
import type {
  DeliveryRuntimeHandoffAuditLinkageShape,
  DeliveryRuntimeHandoffTraceShape
} from "@orchestrator/audit-eval";
import type {
  DeliveryRuntimeHandoffLinkageShape,
  SurfaceResponseStatus
} from "@orchestrator/integration-contracts";
import type {
  RuntimeDeliveryRuntimeHandoffPlaceholderEnvelopeShape,
  RuntimeDeliveryRuntimeHandoffStatus,
  RuntimeHandoffTargetFamilyShape
} from "@orchestrator/runtime-surface";
import type { DeliveryPrecheckShape } from "./delivery-precheck-types.js";
import type {
  DeliveryRuntimeHandoffFamily,
  DeliveryRuntimeHandoffStatus,
  DeliveryRuntimeHandoffWarningCode,
  RuntimeHandoffTargetFamily
} from "./delivery-runtime-handoff-vocabularies.js";

export interface DeliveryRuntimeHandoffWarningShape {
  code: DeliveryRuntimeHandoffWarningCode;
  message: string;
}

export interface HandlerInvocationPlaceholderShape {
  placeholder_id: string;
  dispatch_intent_id: string;
  precheck_id: string;
  target_handler_family: RuntimeHandoffTargetFamily;
  handler_boundary: DeliveryPrecheckShape["delivery_target_expectation"]["handler_boundary_expectation"]["handler_boundary"];
  invocation_mode: DeliveryPrecheckShape["delivery_target_expectation"]["handler_boundary_expectation"]["expected_dispatch_mode"];
  required_capabilities: string[];
  placeholder_payload: Record<string, unknown>;
  warnings: DeliveryRuntimeHandoffWarningShape[];
}

export interface RuntimeTargetExpectationShape {
  target_family: RuntimeHandoffTargetFamily;
  expected_runtime_surface: "mcp_runtime_surface" | "api_runtime_surface" | "hybrid_runtime_surface" | "unknown_runtime_surface";
  expected_channel_family: DeliveryPrecheckShape["delivery_target_expectation"]["channel_family"];
  expected_handler_boundary: DeliveryPrecheckShape["delivery_target_expectation"]["handler_boundary_expectation"]["handler_boundary"];
  required_capabilities: string[];
  warnings: DeliveryRuntimeHandoffWarningShape[];
}

export interface DeliveryPrecheckToRuntimeHandoffLinkageShape {
  linkage_id: string;
  precheck_id: string;
  dispatch_intent_id: string;
  request_id: string;
  operation_id: string;
  runtime_handoff_family: DeliveryRuntimeHandoffFamily;
  runtime_target_family: RuntimeHandoffTargetFamily;
  linked_at: IsoDateTimeString;
  warnings: DeliveryRuntimeHandoffWarningShape[];
}

export interface RuntimeHandoffStatusMappingShape {
  handoff_status: DeliveryRuntimeHandoffStatus;
  runtime_status: RuntimeDeliveryRuntimeHandoffStatus;
  surface_status: SurfaceResponseStatus;
}

export interface ReadyToHandoffContractShape {
  status: "ready_to_handoff";
  reason: string;
  payload: Record<string, unknown>;
}

export interface BlockedRuntimeHandoffContractShape {
  status: "blocked";
  reason: string;
  payload: Record<string, unknown>;
}

export interface DeferredRuntimeHandoffContractShape {
  status: "deferred";
  reason: string;
  payload: Record<string, unknown>;
}

export interface UnavailableRuntimeHandoffContractShape {
  status: "unavailable";
  reason: string;
  payload: Record<string, unknown>;
}

export interface UnsupportedRuntimeHandoffContractShape {
  status: "unsupported";
  reason: string;
  payload: Record<string, unknown>;
}

export interface PartiallyReadyRuntimeHandoffContractShape {
  status: "partially_ready";
  reason: string;
  payload: Record<string, unknown>;
}

export interface DeliveryRuntimeHandoffInputShape {
  delivery_precheck: DeliveryPrecheckShape;
  now?: IsoDateTimeString;
  linked_audit_id?: AuditId;
}

export interface DeliveryRuntimeHandoffShape {
  runtime_handoff_id: string;
  request_id: string;
  operation_id: string;
  precheck_id: string;
  dispatch_intent_id: string;
  runtime_handoff_family: DeliveryRuntimeHandoffFamily;
  runtime_target_expectation: RuntimeTargetExpectationShape;
  handoff_status: DeliveryRuntimeHandoffStatus;
  status_mapping: RuntimeHandoffStatusMappingShape;
  precheck_to_runtime_handoff_linkage: DeliveryPrecheckToRuntimeHandoffLinkageShape;
  handler_invocation_placeholder: HandlerInvocationPlaceholderShape;
  ready_to_handoff?: ReadyToHandoffContractShape;
  blocked_handoff?: BlockedRuntimeHandoffContractShape;
  deferred_handoff?: DeferredRuntimeHandoffContractShape;
  unavailable_handoff?: UnavailableRuntimeHandoffContractShape;
  unsupported_handoff?: UnsupportedRuntimeHandoffContractShape;
  partially_ready_handoff?: PartiallyReadyRuntimeHandoffContractShape;
  runtime_handoff_placeholder_envelope: RuntimeDeliveryRuntimeHandoffPlaceholderEnvelopeShape;
  integration_handoff_linkage: DeliveryRuntimeHandoffLinkageShape<Record<string, unknown>>;
  runtime_handoff_trace: DeliveryRuntimeHandoffTraceShape;
  runtime_handoff_audit_linkage: DeliveryRuntimeHandoffAuditLinkageShape;
  warnings: DeliveryRuntimeHandoffWarningShape[];
  prepared_at: IsoDateTimeString;
}

export interface DeliveryRuntimeHandoffSummaryShape {
  total: number;
  ready_to_handoff: number;
  blocked: number;
  deferred: number;
  unavailable: number;
  unsupported: number;
  partially_ready: number;
  by_runtime_target_family: Record<RuntimeHandoffTargetFamilyShape, number>;
  warnings: DeliveryRuntimeHandoffWarningShape[];
}
