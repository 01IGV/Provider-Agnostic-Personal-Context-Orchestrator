export const DELIVERY_RUNTIME_HANDOFF_FAMILIES = [
  "read_path_runtime_handoff",
  "pack_loop_runtime_handoff",
  "write_path_runtime_handoff",
  "handoff_runtime_handoff",
  "unknown_runtime_handoff"
] as const;

export type DeliveryRuntimeHandoffFamily = (typeof DELIVERY_RUNTIME_HANDOFF_FAMILIES)[number];

export const RUNTIME_HANDOFF_TARGET_FAMILIES = [
  "mcp_runtime_target",
  "api_runtime_target",
  "hybrid_runtime_target",
  "unknown_runtime_target"
] as const;

export type RuntimeHandoffTargetFamily = (typeof RUNTIME_HANDOFF_TARGET_FAMILIES)[number];

export const DELIVERY_RUNTIME_HANDOFF_STATUSES = [
  "ready_to_handoff",
  "blocked",
  "deferred",
  "unavailable",
  "unsupported",
  "partially_ready"
] as const;

export type DeliveryRuntimeHandoffStatus = (typeof DELIVERY_RUNTIME_HANDOFF_STATUSES)[number];

export const DELIVERY_RUNTIME_HANDOFF_WARNING_CODES = [
  "runtime_handoff_family_ambiguous",
  "runtime_handoff_target_ambiguous",
  "runtime_handoff_placeholder_incomplete",
  "runtime_handoff_blocked",
  "runtime_handoff_deferred",
  "runtime_handoff_unavailable",
  "runtime_handoff_unsupported",
  "runtime_handoff_partially_ready",
  "runtime_surface_handoff_placeholder_envelope_emitted",
  "integration_handoff_placeholder_linkage_emitted"
] as const;

export type DeliveryRuntimeHandoffWarningCode = (typeof DELIVERY_RUNTIME_HANDOFF_WARNING_CODES)[number];

export const DELIVERY_RUNTIME_HANDOFF_STATUS_TO_SURFACE_STATUS: Record<
  DeliveryRuntimeHandoffStatus,
  "success" | "accepted" | "partial" | "rejected" | "error"
> = {
  ready_to_handoff: "success",
  blocked: "rejected",
  deferred: "accepted",
  unavailable: "error",
  unsupported: "error",
  partially_ready: "partial"
};
