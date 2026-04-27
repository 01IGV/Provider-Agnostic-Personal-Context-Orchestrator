export const LOCAL_DETERMINISTIC_CONTEXT_SOURCE_KINDS = [
  "inline_seeded_context",
  "local_fixture_context"
] as const;
export type LocalDeterministicContextSourceKind = (typeof LOCAL_DETERMINISTIC_CONTEXT_SOURCE_KINDS)[number];

export const LOCAL_DETERMINISTIC_CONTEXT_SOURCE_ADAPTER_STATUSES = [
  "local_context_source_ready",
  "local_context_source_denied",
  "local_context_source_not_available"
] as const;
export type LocalDeterministicContextSourceAdapterStatus =
  (typeof LOCAL_DETERMINISTIC_CONTEXT_SOURCE_ADAPTER_STATUSES)[number];

export const LOCAL_DETERMINISTIC_CONTEXT_MATERIALIZATION_BOUNDARIES = [
  "contract_only_local_deterministic_context_materialization",
  "denial_only_local_deterministic_context_materialization"
] as const;
export type LocalDeterministicContextMaterializationBoundary =
  (typeof LOCAL_DETERMINISTIC_CONTEXT_MATERIALIZATION_BOUNDARIES)[number];

export const LOCAL_DETERMINISTIC_CONTEXT_SOURCE_WARNING_CODES = [
  "local_source_adapter_contract_only",
  "local_source_adapter_non_networked",
  "local_source_adapter_non_persistent",
  "local_source_adapter_not_runtime_execution",
  "local_source_adapter_permission_denied_by_default"
] as const;
export type LocalDeterministicContextSourceWarningCode =
  (typeof LOCAL_DETERMINISTIC_CONTEXT_SOURCE_WARNING_CODES)[number];
