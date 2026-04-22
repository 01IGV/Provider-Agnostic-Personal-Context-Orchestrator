export const ADAPTER_PROVIDER_FAMILIES = [
  "openai_compatible",
  "anthropic_compatible",
  "google_compatible",
  "local_open_weights",
  "custom_runtime"
] as const;

export type AdapterProviderFamily = (typeof ADAPTER_PROVIDER_FAMILIES)[number];

export const ADAPTER_RUNTIME_HOST_TYPES = [
  "mcp_host",
  "api_runtime",
  "hybrid_runtime",
  "workflow_engine",
  "embedded_sdk"
] as const;

export type AdapterRuntimeHostType = (typeof ADAPTER_RUNTIME_HOST_TYPES)[number];

export const PROJECTION_STRATEGIES = [
  "canonical_preserving_direct",
  "schema_wrapped_projection",
  "budget_constrained_projection",
  "tool_limited_projection",
  "structured_output_guarded_projection"
] as const;

export type ProjectionStrategy = (typeof PROJECTION_STRATEGIES)[number];

export const ADAPTER_CONSTRAINT_FLAGS = [
  "tight_context_budget",
  "limited_tool_calling",
  "strict_schema_wrapping",
  "unstable_structured_output",
  "single_turn_bias",
  "resource_discovery_limited"
] as const;

export type AdapterConstraintFlag = (typeof ADAPTER_CONSTRAINT_FLAGS)[number];

export const ADAPTER_WARNING_CODES = [
  "projection_budget_pressure",
  "tool_projection_omission",
  "semantic_compaction",
  "normalization_loss_risk",
  "constraint_fallback"
] as const;

export type AdapterWarningCode = (typeof ADAPTER_WARNING_CODES)[number];

export const SEMANTIC_PRESERVATION_NOTE_CODES = [
  "bundle_semantics_preserved",
  "tool_semantics_preserved",
  "writeback_linkage_preserved",
  "handoff_semantics_preserved",
  "partial_semantic_risk"
] as const;

export type SemanticPreservationNoteCode = (typeof SEMANTIC_PRESERVATION_NOTE_CODES)[number];

export const ADAPTER_ERROR_CODES = [
  "projection_failure",
  "normalization_failure",
  "unsupported_capability",
  "semantic_preservation_failure",
  "provider_response_invalid",
  "writeback_envelope_invalid"
] as const;

export type AdapterErrorCode = (typeof ADAPTER_ERROR_CODES)[number];
