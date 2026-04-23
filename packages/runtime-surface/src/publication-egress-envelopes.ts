import type { IsoDateTimeString } from "@orchestrator/core-foundation";
import type { RuntimeSurfaceErrorShape } from "./errors.js";

export const RUNTIME_PUBLICATION_OUTCOME_FAMILIES = [
  "read_path_publication",
  "pack_loop_publication",
  "write_path_publication",
  "handoff_publication",
  "unknown_publication"
] as const;

export type RuntimePublicationOutcomeFamily = (typeof RUNTIME_PUBLICATION_OUTCOME_FAMILIES)[number];

export const RUNTIME_PUBLICATION_STATUSES = [
  "publication_ready",
  "publication_blocked",
  "publication_deferred",
  "publication_partial",
  "publication_incomplete",
  "publication_failed"
] as const;

export type RuntimePublicationStatus = (typeof RUNTIME_PUBLICATION_STATUSES)[number];

export interface RuntimePublicationWarning {
  code: string;
  message: string;
}

export interface RuntimeSurfaceDeliveryReadyEnvelopeShape {
  request_id: string;
  operation_id: string;
  publication_family: RuntimePublicationOutcomeFamily;
  publication_status: RuntimePublicationStatus;
  delivery_status_hint: "success" | "accepted" | "partial" | "rejected" | "error";
  delivery_payload: Record<string, unknown>;
  warnings: RuntimePublicationWarning[];
  error?: RuntimeSurfaceErrorShape;
  prepared_at: IsoDateTimeString;
}
