export const ASSEMBLY_ENVIRONMENTS = [
  "local_dev",
  "shared_server",
  "desktop_host",
  "ci_validation",
  "contract_test"
] as const;

export type AssemblyEnvironment = (typeof ASSEMBLY_ENVIRONMENTS)[number];

export const ASSEMBLY_MODES = [
  "contracts_only",
  "dry_wiring",
  "composition_only",
  "integration_ready"
] as const;

export type AssemblyMode = (typeof ASSEMBLY_MODES)[number];

export const ASSEMBLY_WARNING_CODES = [
  "missing_dependency",
  "optional_dependency_missing",
  "boundary_violation",
  "capability_unregistered",
  "configuration_gap",
  "module_not_wired"
] as const;

export type AssemblyWarningCode = (typeof ASSEMBLY_WARNING_CODES)[number];

export const MISSING_DEPENDENCY_CODES = [
  "missing_read_path_pipeline",
  "missing_pack_loop_pipeline",
  "missing_write_path_pipeline",
  "missing_handoff_pipeline",
  "missing_provider_adapter_pipeline",
  "missing_governance_decision_engine",
  "missing_runtime_configuration"
] as const;

export type MissingDependencyCode = (typeof MISSING_DEPENDENCY_CODES)[number];

export const CAPABILITY_REGISTRATION_STATES = ["registered", "disabled", "hidden"] as const;
export type CapabilityRegistrationState = (typeof CAPABILITY_REGISTRATION_STATES)[number];
