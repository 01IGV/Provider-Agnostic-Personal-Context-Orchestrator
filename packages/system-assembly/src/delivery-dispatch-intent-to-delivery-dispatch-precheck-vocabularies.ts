export const DELIVERY_DISPATCH_PRECHECK_FAMILIES = [
  "read_path_delivery_dispatch_precheck",
  "pack_loop_delivery_dispatch_precheck",
  "write_path_delivery_dispatch_precheck",
  "handoff_delivery_dispatch_precheck",
  "unknown_delivery_dispatch_precheck"
] as const;

export type DeliveryDispatchPrecheckFamily =
  (typeof DELIVERY_DISPATCH_PRECHECK_FAMILIES)[number];

export const DELIVERY_DISPATCH_PRECHECK_STATUSES = [
  "queued_delivery_dispatch_precheck",
  "prepared_delivery_dispatch_precheck",
  "blocked_delivery_dispatch_precheck",
  "deferred_delivery_dispatch_precheck",
  "aborted_delivery_dispatch_precheck",
  "expired_delivery_dispatch_precheck",
  "cancelled_delivery_dispatch_precheck",
  "not_dispatchable_delivery_dispatch_precheck"
] as const;

export type DeliveryDispatchPrecheckStatus =
  (typeof DELIVERY_DISPATCH_PRECHECK_STATUSES)[number];

export const DELIVERY_DISPATCH_PRECHECK_RESULTS = [
  "delivery_dispatch_precheck_placeholder_queued",
  "delivery_dispatch_precheck_placeholder_ready",
  "delivery_dispatch_precheck_placeholder_blocked",
  "delivery_dispatch_precheck_placeholder_deferred",
  "delivery_dispatch_precheck_placeholder_terminal",
  "delivery_dispatch_precheck_placeholder_not_dispatchable"
] as const;

export type DeliveryDispatchPrecheckResult =
  (typeof DELIVERY_DISPATCH_PRECHECK_RESULTS)[number];

export const DELIVERY_DISPATCH_PRECHECK_WARNING_CODES = [
  "delivery_dispatch_precheck_family_ambiguous",
  "delivery_dispatch_precheck_status_mismatch",
  "delivery_dispatch_precheck_runtime_boundary_only",
  "delivery_dispatch_precheck_not_actual_dispatch_execution",
  "delivery_dispatch_precheck_not_actual_publication_delivery",
  "delivery_dispatch_precheck_not_actual_handler_result",
  "delivery_dispatch_precheck_not_actual_delivery_result",
  "delivery_dispatch_precheck_not_provider_transport_result",
  "delivery_dispatch_precheck_authority_context_placeholder_only",
  "delivery_dispatch_precheck_provenance_context_placeholder_only",
  "delivery_dispatch_precheck_delegation_context_placeholder_only",
  "delivery_dispatch_precheck_runtime_surface_envelope_emitted",
  "delivery_dispatch_precheck_integration_linkage_emitted",
  "delivery_dispatch_precheck_audit_linkage_emitted"
] as const;

export type DeliveryDispatchPrecheckWarningCode =
  (typeof DELIVERY_DISPATCH_PRECHECK_WARNING_CODES)[number];

export const DELIVERY_DISPATCH_INTENT_STATUS_TO_DELIVERY_DISPATCH_PRECHECK_STATUS = {
  queued_delivery_dispatch_intent: "queued_delivery_dispatch_precheck",
  prepared_delivery_dispatch_intent: "prepared_delivery_dispatch_precheck",
  blocked_delivery_dispatch_intent: "blocked_delivery_dispatch_precheck",
  deferred_delivery_dispatch_intent: "deferred_delivery_dispatch_precheck",
  aborted_delivery_dispatch_intent: "aborted_delivery_dispatch_precheck",
  expired_delivery_dispatch_intent: "expired_delivery_dispatch_precheck",
  cancelled_delivery_dispatch_intent: "cancelled_delivery_dispatch_precheck",
  not_dispatchable_delivery_dispatch_intent: "not_dispatchable_delivery_dispatch_precheck"
} as const;
