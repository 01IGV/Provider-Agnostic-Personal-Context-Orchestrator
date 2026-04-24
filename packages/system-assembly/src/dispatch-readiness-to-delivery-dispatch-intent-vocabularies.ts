export const DELIVERY_DISPATCH_INTENT_FAMILIES = [
  "read_path_delivery_dispatch_intent",
  "pack_loop_delivery_dispatch_intent",
  "write_path_delivery_dispatch_intent",
  "handoff_delivery_dispatch_intent",
  "unknown_delivery_dispatch_intent"
] as const;

export type DeliveryDispatchIntentFamily =
  (typeof DELIVERY_DISPATCH_INTENT_FAMILIES)[number];

export const DELIVERY_DISPATCH_INTENT_STATUSES = [
  "queued_delivery_dispatch_intent",
  "prepared_delivery_dispatch_intent",
  "blocked_delivery_dispatch_intent",
  "deferred_delivery_dispatch_intent",
  "aborted_delivery_dispatch_intent",
  "expired_delivery_dispatch_intent",
  "cancelled_delivery_dispatch_intent",
  "not_dispatchable_delivery_dispatch_intent"
] as const;

export type DeliveryDispatchIntentStatus =
  (typeof DELIVERY_DISPATCH_INTENT_STATUSES)[number];

export const DELIVERY_DISPATCH_INTENT_RESULTS = [
  "delivery_dispatch_intent_placeholder_queued",
  "delivery_dispatch_intent_placeholder_ready",
  "delivery_dispatch_intent_placeholder_blocked",
  "delivery_dispatch_intent_placeholder_deferred",
  "delivery_dispatch_intent_placeholder_terminal",
  "delivery_dispatch_intent_placeholder_not_dispatchable"
] as const;

export type DeliveryDispatchIntentResult =
  (typeof DELIVERY_DISPATCH_INTENT_RESULTS)[number];

export const DELIVERY_DISPATCH_INTENT_WARNING_CODES = [
  "delivery_dispatch_intent_family_ambiguous",
  "delivery_dispatch_intent_status_mismatch",
  "delivery_dispatch_intent_runtime_boundary_only",
  "delivery_dispatch_intent_not_actual_dispatch_execution",
  "delivery_dispatch_intent_not_actual_publication_delivery",
  "delivery_dispatch_intent_not_actual_handler_result",
  "delivery_dispatch_intent_not_actual_delivery_result",
  "delivery_dispatch_intent_not_provider_transport_result",
  "delivery_dispatch_intent_authority_context_placeholder_only",
  "delivery_dispatch_intent_provenance_context_placeholder_only",
  "delivery_dispatch_intent_delegation_context_placeholder_only",
  "delivery_dispatch_intent_runtime_surface_envelope_emitted",
  "delivery_dispatch_intent_integration_linkage_emitted",
  "delivery_dispatch_intent_audit_linkage_emitted"
] as const;

export type DeliveryDispatchIntentWarningCode =
  (typeof DELIVERY_DISPATCH_INTENT_WARNING_CODES)[number];

export const DISPATCH_READINESS_STATUS_TO_DELIVERY_DISPATCH_INTENT_STATUS = {
  queued_dispatch_readiness: "queued_delivery_dispatch_intent",
  prepared_dispatch_readiness: "prepared_delivery_dispatch_intent",
  blocked_dispatch_readiness: "blocked_delivery_dispatch_intent",
  deferred_dispatch_readiness: "deferred_delivery_dispatch_intent",
  aborted_dispatch_readiness: "aborted_delivery_dispatch_intent",
  expired_dispatch_readiness: "expired_delivery_dispatch_intent",
  cancelled_dispatch_readiness: "cancelled_delivery_dispatch_intent",
  not_dispatchable_dispatch_readiness: "not_dispatchable_delivery_dispatch_intent"
} as const;
