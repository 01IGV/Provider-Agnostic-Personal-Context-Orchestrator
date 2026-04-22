import type { OperationContractShape } from "@orchestrator/integration-contracts";
import type { AssemblyEnvironment, AssemblyMode, AssemblyWarningCode, CapabilityRegistrationState, MissingDependencyCode } from "./vocabularies.js";

export interface AssemblyWarning {
  code: AssemblyWarningCode;
  message: string;
  module_id?: string;
}

export interface MissingDependency {
  code: MissingDependencyCode;
  dependency_token: string;
  required_by_module: string;
}

export interface RuntimeConfigurationShape {
  environment: AssemblyEnvironment;
  assembly_mode: AssemblyMode;
  strict_boundary_enforcement: boolean;
  enable_audit_contracts: boolean;
  enable_provider_projection: boolean;
  target_runtime?: string;
  target_provider?: string;
  feature_flags: Record<string, boolean>;
}

export interface NormalizedAssemblyConfiguration {
  environment: AssemblyEnvironment;
  assembly_mode: AssemblyMode;
  strict_boundary_enforcement: boolean;
  capability_filtering_enabled: boolean;
  audit_contracts_enabled: boolean;
  provider_projection_enabled: boolean;
  target_runtime?: string;
  target_provider?: string;
  feature_flags: Record<string, boolean>;
}

export interface DependencyBoundaryContract {
  boundary_id: string;
  allowed_dependency_tokens: string[];
  forbidden_dependency_tokens: string[];
}

export interface ModuleWiringShape {
  module_id: string;
  provides_dependency_tokens: string[];
  requires_dependency_tokens: string[];
  optional_dependency_tokens: string[];
  boundary: DependencyBoundaryContract;
}

export interface CapabilityRegistrationShape {
  capability_id: string;
  state: CapabilityRegistrationState;
  source_module_id: string;
  linked_operations: OperationContractShape[];
  visibility: "public" | "internal" | "restricted";
}

export interface DependencyRegistrySnapshot {
  registered_tokens: string[];
  missing_tokens: MissingDependency[];
}

export interface CompositionRootShape {
  root_id: string;
  configuration: NormalizedAssemblyConfiguration;
  modules: ModuleWiringShape[];
  capabilities: CapabilityRegistrationShape[];
}

export interface ModuleCompositionValidation {
  is_valid: boolean;
  missing_dependencies: MissingDependency[];
  boundary_violations: Array<{ module_id: string; forbidden_dependency_token: string }>;
  warnings: AssemblyWarning[];
}

export interface BootstrapContractShape {
  bootstrap_id: string;
  composition_root_id: string;
  registry_tokens_required: string[];
  capability_ids_required: string[];
}

export interface OrchestratorAssemblyResult {
  composition_root: CompositionRootShape;
  registry_snapshot: DependencyRegistrySnapshot;
  validation: ModuleCompositionValidation;
  bootstrap_contract: BootstrapContractShape;
  warnings: AssemblyWarning[];
}
