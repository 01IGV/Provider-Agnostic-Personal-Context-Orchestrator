import type { IsoDateTimeString } from "@orchestrator/core-foundation";
import type { RuntimeSurfaceErrorShape } from "./errors.js";

export const RUNTIME_FINALIZED_OUTCOME_FAMILIES = ["read_path", "pack_loop", "write_path", "handoff", "unknown"] as const;

export type RuntimeFinalizedOutcomeFamily = (typeof RUNTIME_FINALIZED_OUTCOME_FAMILIES)[number];

export const RUNTIME_FINALIZED_OUTCOME_STATUSES = [
  "completed_finalized",
  "partial_finalized",
  "blocked_finalized",
  "deferred_finalized",
  "failed_finalized",
  "incomplete_finalization"
] as const;

export type RuntimeFinalizedOutcomeStatus = (typeof RUNTIME_FINALIZED_OUTCOME_STATUSES)[number];

export interface RuntimeSurfaceFinalizationWarning {
  code: string;
  message: string;
}

export interface RuntimeSurfaceFinalizedEnvelopeShape {
  request_id: string;
  operation_id: string;
  outcome_family: RuntimeFinalizedOutcomeFamily;
  finalization_status: RuntimeFinalizedOutcomeStatus;
  surface_status: "success" | "accepted" | "partial" | "rejected" | "error";
  finalized_payload: Record<string, unknown>;
  completion_artifact_metadata?: Record<string, unknown>;
  warnings: RuntimeSurfaceFinalizationWarning[];
  error?: RuntimeSurfaceErrorShape;
  finalized_at: IsoDateTimeString;
}
