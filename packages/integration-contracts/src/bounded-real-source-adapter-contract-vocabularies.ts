export const BOUNDED_REAL_SOURCE_ADAPTER_CAPABILITY_BOUNDARIES = [
  "declaration_only_bounded_real_source_capability"
] as const;
export type BoundedRealSourceAdapterCapabilityBoundary =
  (typeof BOUNDED_REAL_SOURCE_ADAPTER_CAPABILITY_BOUNDARIES)[number];

export const BOUNDED_REAL_SOURCE_ADAPTER_CONTRACT_BOUNDARIES = [
  "contract_only_bounded_real_source_adapter"
] as const;
export type BoundedRealSourceAdapterContractBoundary =
  (typeof BOUNDED_REAL_SOURCE_ADAPTER_CONTRACT_BOUNDARIES)[number];

export const BOUNDED_REAL_SOURCE_ADAPTER_MATERIALIZATION_BOUNDARIES = [
  "contract_only_future_real_source_materialization_boundary"
] as const;
export type BoundedRealSourceAdapterMaterializationBoundary =
  (typeof BOUNDED_REAL_SOURCE_ADAPTER_MATERIALIZATION_BOUNDARIES)[number];

export const BOUNDED_REAL_SOURCE_ADAPTER_SOURCE_KINDS = [
  "repo_work_context_source_candidate",
  "repo_file_source_candidate",
  "local_artifact_source_candidate"
] as const;
export type BoundedRealSourceAdapterSourceKind =
  (typeof BOUNDED_REAL_SOURCE_ADAPTER_SOURCE_KINDS)[number];

export const BOUNDED_REAL_SOURCE_ADAPTER_WARNING_CODES = [
  "bounded_real_source_adapter_contract_only",
  "bounded_real_source_adapter_capability_declaration_only",
  "bounded_real_source_adapter_live_reads_denied",
  "bounded_real_source_adapter_direct_agent_file_access_denied",
  "bounded_real_source_adapter_receipt_required"
] as const;
export type BoundedRealSourceAdapterWarningCode =
  (typeof BOUNDED_REAL_SOURCE_ADAPTER_WARNING_CODES)[number];
