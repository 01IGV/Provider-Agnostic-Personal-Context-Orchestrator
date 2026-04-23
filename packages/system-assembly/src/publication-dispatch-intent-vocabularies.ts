export const PUBLICATION_DISPATCH_INTENT_FAMILIES = [
  "read_path_dispatch_intent",
  "pack_loop_dispatch_intent",
  "write_path_dispatch_intent",
  "handoff_dispatch_intent",
  "unknown_dispatch_intent"
] as const;

export type PublicationDispatchIntentFamily = (typeof PUBLICATION_DISPATCH_INTENT_FAMILIES)[number];

export const PUBLICATION_DISPATCH_TARGET_FAMILIES = [
  "mcp_handler_target",
  "api_handler_target",
  "hybrid_handler_target",
  "unknown_handler_target"
] as const;

export type PublicationDispatchTargetFamily = (typeof PUBLICATION_DISPATCH_TARGET_FAMILIES)[number];

export const PUBLICATION_DISPATCH_INTENT_STATUSES = [
  "dispatch_allowed",
  "dispatch_blocked",
  "dispatch_deferred",
  "dispatch_unsupported",
  "dispatch_incomplete"
] as const;

export type PublicationDispatchIntentStatus = (typeof PUBLICATION_DISPATCH_INTENT_STATUSES)[number];

export const PUBLICATION_DISPATCH_INTENT_WARNING_CODES = [
  "dispatch_intent_family_ambiguous",
  "dispatch_target_ambiguous",
  "dispatch_eligibility_incomplete_target",
  "dispatch_intent_blocked",
  "dispatch_intent_deferred",
  "dispatch_intent_unsupported",
  "dispatch_intent_incomplete",
  "surface_dispatch_intent_envelope_emitted",
  "integration_dispatch_intent_linkage_emitted"
] as const;

export type PublicationDispatchIntentWarningCode = (typeof PUBLICATION_DISPATCH_INTENT_WARNING_CODES)[number];

export const DISPATCH_INTENT_STATUS_TO_SURFACE_STATUS: Record<
  PublicationDispatchIntentStatus,
  "success" | "accepted" | "partial" | "rejected" | "error"
> = {
  dispatch_allowed: "success",
  dispatch_blocked: "rejected",
  dispatch_deferred: "accepted",
  dispatch_unsupported: "error",
  dispatch_incomplete: "error"
};
