import type { IsoDateTimeString } from "@orchestrator/core-foundation";
import type { RuntimePublicationDispatchIntentFamily } from "./publication-dispatch-intent-envelopes.js";
import type { RuntimeSurfaceErrorShape } from "./errors.js";

export const RUNTIME_DELIVERY_PRECHECK_FAMILIES = [
  "read_path_delivery_precheck",
  "pack_loop_delivery_precheck",
  "write_path_delivery_precheck",
  "handoff_delivery_precheck",
  "unknown_delivery_precheck"
] as const;

export type RuntimeDeliveryPrecheckFamily = (typeof RUNTIME_DELIVERY_PRECHECK_FAMILIES)[number];

export const RUNTIME_TARGET_HANDLER_FAMILIES = [
  "mcp_handler_family",
  "api_handler_family",
  "hybrid_handler_family",
  "unknown_handler_family"
] as const;

export type RuntimeTargetHandlerFamily = (typeof RUNTIME_TARGET_HANDLER_FAMILIES)[number];

export const RUNTIME_DELIVERY_PRECHECK_STATUSES = [
  "ready",
  "blocked",
  "deferred",
  "unavailable",
  "unsupported",
  "partially_ready"
] as const;

export type RuntimeDeliveryPrecheckStatus = (typeof RUNTIME_DELIVERY_PRECHECK_STATUSES)[number];

export interface RuntimeHandlerBoundaryExpectationShape {
  target_handler_family: RuntimeTargetHandlerFamily;
  handler_boundary: "mcp_handler_boundary" | "api_handler_boundary" | "hybrid_handler_boundary" | "unknown_handler_boundary";
  expected_dispatch_mode: "synchronous" | "asynchronous" | "mixed" | "unknown";
  required_dispatch_capabilities: string[];
  readiness_status: RuntimeDeliveryPrecheckStatus;
}

export interface RuntimeDeliveryPrecheckWarning {
  code: string;
  message: string;
}

export interface RuntimeDeliveryPrecheckEnvelopeShape {
  request_id: string;
  operation_id: string;
  dispatch_intent_id: string;
  dispatch_intent_family: RuntimePublicationDispatchIntentFamily;
  precheck_family: RuntimeDeliveryPrecheckFamily;
  precheck_status: RuntimeDeliveryPrecheckStatus;
  target_handler_family: RuntimeTargetHandlerFamily;
  dispatch_status_hint: "success" | "accepted" | "partial" | "rejected" | "error";
  handler_boundary_expectation: RuntimeHandlerBoundaryExpectationShape;
  precheck_payload: Record<string, unknown>;
  warnings: RuntimeDeliveryPrecheckWarning[];
  error?: RuntimeSurfaceErrorShape;
  prepared_at: IsoDateTimeString;
}
