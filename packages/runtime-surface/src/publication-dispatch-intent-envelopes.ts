import type { IsoDateTimeString } from "@orchestrator/core-foundation";
import type { RuntimePublicationChannelFamily } from "./channel-bound-publication-envelopes.js";
import type { RuntimeSurfaceErrorShape } from "./errors.js";

export const RUNTIME_PUBLICATION_DISPATCH_INTENT_FAMILIES = [
  "read_path_dispatch_intent",
  "pack_loop_dispatch_intent",
  "write_path_dispatch_intent",
  "handoff_dispatch_intent",
  "unknown_dispatch_intent"
] as const;

export type RuntimePublicationDispatchIntentFamily = (typeof RUNTIME_PUBLICATION_DISPATCH_INTENT_FAMILIES)[number];

export const RUNTIME_PUBLICATION_DISPATCH_TARGET_FAMILIES = [
  "mcp_handler_target",
  "api_handler_target",
  "hybrid_handler_target",
  "unknown_handler_target"
] as const;

export type RuntimePublicationDispatchTargetFamily = (typeof RUNTIME_PUBLICATION_DISPATCH_TARGET_FAMILIES)[number];

export const RUNTIME_PUBLICATION_DISPATCH_INTENT_STATUSES = [
  "dispatch_allowed",
  "dispatch_blocked",
  "dispatch_deferred",
  "dispatch_unsupported",
  "dispatch_incomplete"
] as const;

export type RuntimePublicationDispatchIntentStatus = (typeof RUNTIME_PUBLICATION_DISPATCH_INTENT_STATUSES)[number];

export interface RuntimeDispatchIntentHandlerBoundaryExpectationShape {
  expected_handler_boundary: "mcp_handler_boundary" | "api_handler_boundary" | "hybrid_handler_boundary" | "unknown_handler_boundary";
  required_dispatch_capabilities: string[];
  expected_dispatch_mode: "synchronous" | "asynchronous" | "mixed" | "unknown";
}

export interface RuntimePublicationDispatchIntentWarning {
  code: string;
  message: string;
}

export interface RuntimePublicationDispatchIntentEnvelopeShape {
  request_id: string;
  operation_id: string;
  publication_family: string;
  channel_family: RuntimePublicationChannelFamily;
  dispatch_intent_family: RuntimePublicationDispatchIntentFamily;
  dispatch_intent_status: RuntimePublicationDispatchIntentStatus;
  dispatch_target_family: RuntimePublicationDispatchTargetFamily;
  dispatch_status_hint: "success" | "accepted" | "partial" | "rejected" | "error";
  handler_boundary_expectation: RuntimeDispatchIntentHandlerBoundaryExpectationShape;
  dispatch_payload: Record<string, unknown>;
  warnings: RuntimePublicationDispatchIntentWarning[];
  error?: RuntimeSurfaceErrorShape;
  prepared_at: IsoDateTimeString;
}
