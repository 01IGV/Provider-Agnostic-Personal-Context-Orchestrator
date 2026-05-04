export const NARROW_LOCAL_REAL_SOURCE_READ_BOUNDARY_KINDS = [
  "contract_only_narrow_local_real_source_read_boundary"
] as const;
export type NarrowLocalRealSourceReadBoundaryKind =
  (typeof NARROW_LOCAL_REAL_SOURCE_READ_BOUNDARY_KINDS)[number];

export const NARROW_LOCAL_REAL_SOURCE_READ_ROOT_KINDS = [
  "repo_relative_allowlisted_root"
] as const;
export type NarrowLocalRealSourceReadRootKind =
  (typeof NARROW_LOCAL_REAL_SOURCE_READ_ROOT_KINDS)[number];

export const NARROW_LOCAL_REAL_SOURCE_READ_REF_KINDS = [
  "repo_relative_allowlisted_file_ref",
  "repo_relative_allowlisted_doc_ref"
] as const;
export type NarrowLocalRealSourceReadRefKind =
  (typeof NARROW_LOCAL_REAL_SOURCE_READ_REF_KINDS)[number];

export const NARROW_LOCAL_REAL_SOURCE_READ_WARNING_CODES = [
  "narrow_local_real_source_read_boundary_contract_only",
  "narrow_local_real_source_read_boundary_live_reads_denied",
  "narrow_local_real_source_read_boundary_direct_agent_file_access_denied",
  "narrow_local_real_source_read_boundary_receipt_required"
] as const;
export type NarrowLocalRealSourceReadWarningCode =
  (typeof NARROW_LOCAL_REAL_SOURCE_READ_WARNING_CODES)[number];
