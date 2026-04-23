export const PUBLICATION_CHANNEL_FAMILIES = [
  "mcp_channel",
  "api_channel",
  "hybrid_channel",
  "unknown_channel"
] as const;

export type PublicationChannelFamily = (typeof PUBLICATION_CHANNEL_FAMILIES)[number];

export const CHANNEL_ELIGIBILITY_STATUSES = [
  "eligible",
  "ineligible",
  "unsupported",
  "partially_bindable",
  "unknown"
] as const;

export type ChannelEligibilityStatus = (typeof CHANNEL_ELIGIBILITY_STATUSES)[number];

export const EGRESS_GATE_STATUSES = [
  "allowed",
  "blocked",
  "deferred",
  "unsupported",
  "partially_bindable",
  "incomplete"
] as const;

export type EgressGateStatus = (typeof EGRESS_GATE_STATUSES)[number];

export const EGRESS_GATING_WARNING_CODES = [
  "channel_family_ambiguous",
  "channel_capability_mismatch",
  "channel_binding_partial",
  "egress_gate_blocked",
  "egress_gate_deferred",
  "egress_gate_unsupported",
  "egress_gate_incomplete",
  "channel_bound_surface_envelope_emitted",
  "channel_bound_integration_envelope_emitted"
] as const;

export type EgressGatingWarningCode = (typeof EGRESS_GATING_WARNING_CODES)[number];

export const EGRESS_GATE_STATUS_TO_SURFACE_STATUS: Record<
  EgressGateStatus,
  "success" | "accepted" | "partial" | "rejected" | "error"
> = {
  allowed: "success",
  blocked: "rejected",
  deferred: "partial",
  unsupported: "error",
  partially_bindable: "partial",
  incomplete: "error"
};
