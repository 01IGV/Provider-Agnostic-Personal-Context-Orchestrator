import type { IsoDateTimeString } from "@orchestrator/core-foundation";
import type { RuntimeSurfaceErrorShape } from "./errors.js";

export const RUNTIME_PUBLICATION_CHANNEL_FAMILIES = [
  "mcp_channel",
  "api_channel",
  "hybrid_channel",
  "unknown_channel"
] as const;

export type RuntimePublicationChannelFamily = (typeof RUNTIME_PUBLICATION_CHANNEL_FAMILIES)[number];

export const RUNTIME_EGRESS_GATE_STATUSES = [
  "allowed",
  "blocked",
  "deferred",
  "unsupported",
  "partially_bindable",
  "incomplete"
] as const;

export type RuntimeEgressGateStatus = (typeof RUNTIME_EGRESS_GATE_STATUSES)[number];

export interface RuntimeChannelBoundPublicationWarning {
  code: string;
  message: string;
}

export interface RuntimeChannelBoundDeliveryReadyEnvelopeShape {
  request_id: string;
  operation_id: string;
  publication_family: string;
  channel_family: RuntimePublicationChannelFamily;
  egress_gate_status: RuntimeEgressGateStatus;
  delivery_status_hint: "success" | "accepted" | "partial" | "rejected" | "error";
  delivery_payload: Record<string, unknown>;
  warnings: RuntimeChannelBoundPublicationWarning[];
  error?: RuntimeSurfaceErrorShape;
  prepared_at: IsoDateTimeString;
}
