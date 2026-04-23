import type { IsoDateTimeString } from "@orchestrator/core-foundation";
import type { RuntimeSurfaceErrorShape } from "./errors.js";

export const RUNTIME_RECONCILED_OUTCOME_FAMILIES = [
  "read_path",
  "pack_loop",
  "write_path",
  "handoff",
  "unknown"
] as const;

export type RuntimeReconciledOutcomeFamily = (typeof RUNTIME_RECONCILED_OUTCOME_FAMILIES)[number];

export const RUNTIME_RECONCILED_OUTCOME_STATUSES = [
  "completed_placeholder",
  "ready_placeholder",
  "blocked_placeholder",
  "deferred_placeholder",
  "failed_placeholder",
  "incomplete_outcome"
] as const;

export type RuntimeReconciledOutcomeStatus = (typeof RUNTIME_RECONCILED_OUTCOME_STATUSES)[number];

export interface RuntimeSurfaceReconciledWarning {
  code: string;
  message: string;
}

export interface RuntimeSurfaceReconciledOutcomeShape {
  request_id: string;
  operation_id: string;
  outcome_family: RuntimeReconciledOutcomeFamily;
  outcome_status: RuntimeReconciledOutcomeStatus;
  surface_status_hint: "success" | "accepted" | "partial" | "rejected" | "error";
  normalized: true;
  placeholder_payload: Record<string, unknown>;
  warnings: RuntimeSurfaceReconciledWarning[];
  error?: RuntimeSurfaceErrorShape;
  produced_at: IsoDateTimeString;
}
