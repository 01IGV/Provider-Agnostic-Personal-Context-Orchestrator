import type { IsoDateTimeString } from "@orchestrator/core-foundation";
import type { RuntimeDeliveryPrecheckFamily } from "./delivery-precheck-envelopes.js";
import type { RuntimeSurfaceErrorShape } from "./errors.js";

export const RUNTIME_DELIVERY_RUNTIME_HANDOFF_FAMILIES = [
  "read_path_runtime_handoff",
  "pack_loop_runtime_handoff",
  "write_path_runtime_handoff",
  "handoff_runtime_handoff",
  "unknown_runtime_handoff"
] as const;

export type RuntimeDeliveryRuntimeHandoffFamily = (typeof RUNTIME_DELIVERY_RUNTIME_HANDOFF_FAMILIES)[number];

export const RUNTIME_HANDOFF_TARGET_FAMILIES = [
  "mcp_runtime_target",
  "api_runtime_target",
  "hybrid_runtime_target",
  "unknown_runtime_target"
] as const;

export type RuntimeHandoffTargetFamilyShape = (typeof RUNTIME_HANDOFF_TARGET_FAMILIES)[number];

export const RUNTIME_DELIVERY_RUNTIME_HANDOFF_STATUSES = [
  "ready_to_handoff",
  "blocked",
  "deferred",
  "unavailable",
  "unsupported",
  "partially_ready"
] as const;

export type RuntimeDeliveryRuntimeHandoffStatus = (typeof RUNTIME_DELIVERY_RUNTIME_HANDOFF_STATUSES)[number];

export interface RuntimeHandoffTargetExpectationShape {
  target_family: RuntimeHandoffTargetFamilyShape;
  expected_runtime_surface: "mcp_runtime_surface" | "api_runtime_surface" | "hybrid_runtime_surface" | "unknown_runtime_surface";
  expected_channel_family: string;
  expected_handler_boundary: "mcp_handler_boundary" | "api_handler_boundary" | "hybrid_handler_boundary" | "unknown_handler_boundary";
  required_capabilities: string[];
}

export interface RuntimeHandlerInvocationPlaceholderShape {
  placeholder_id: string;
  target_handler_family: RuntimeHandoffTargetFamilyShape;
  handler_boundary: "mcp_handler_boundary" | "api_handler_boundary" | "hybrid_handler_boundary" | "unknown_handler_boundary";
  invocation_mode: "synchronous" | "asynchronous" | "mixed" | "unknown";
  required_capabilities: string[];
  placeholder_payload: Record<string, unknown>;
}

export interface RuntimeDeliveryRuntimeHandoffWarning {
  code: string;
  message: string;
}

export interface RuntimeDeliveryRuntimeHandoffPlaceholderEnvelopeShape {
  request_id: string;
  operation_id: string;
  precheck_id: string;
  dispatch_intent_id: string;
  runtime_handoff_family: RuntimeDeliveryRuntimeHandoffFamily;
  runtime_handoff_status: RuntimeDeliveryRuntimeHandoffStatus;
  runtime_target_family: RuntimeHandoffTargetFamilyShape;
  dispatch_status_hint: "success" | "accepted" | "partial" | "rejected" | "error";
  precheck_family?: RuntimeDeliveryPrecheckFamily;
  runtime_target_expectation: RuntimeHandoffTargetExpectationShape;
  handler_invocation_placeholder: RuntimeHandlerInvocationPlaceholderShape;
  placeholder_payload: Record<string, unknown>;
  warnings: RuntimeDeliveryRuntimeHandoffWarning[];
  error?: RuntimeSurfaceErrorShape;
  prepared_at: IsoDateTimeString;
}
