import type { GovernanceDecisionEngine } from "@orchestrator/governance";
import type { HandoffPrimitivePipeline } from "@orchestrator/handoff";
import type { OperationContractShape } from "@orchestrator/integration-contracts";
import type { PackLoopPrimitivePipeline } from "@orchestrator/pack-loop";
import type { ProviderAdapterPipeline } from "@orchestrator/provider-adapters";
import type { ReadPathPrimitivePipeline } from "@orchestrator/read-path";
import type { RuntimeSurfaceContractConsistencyReport, RuntimeSurfaceRegistryShape } from "@orchestrator/runtime-surface";
import type { WritePathPrimitivePipeline } from "@orchestrator/write-path";
import type {
  ArtifactReferenceStore,
  AuditStore,
  BundleStore,
  EvaluationStore,
  EventStore,
  HandoffStore,
  IndexStore,
  MemoryStore,
  RelationStore,
  StateStore,
  SummaryStore
} from "@orchestrator/persistence-contracts";
import type { CapabilityRegistrationShape, DependencyBoundaryContract, ModuleWiringShape } from "./types.js";

export interface CoreModuleServiceWiring {
  read_path_pipeline?: ReadPathPrimitivePipeline;
  pack_loop_pipeline?: PackLoopPrimitivePipeline;
  write_path_pipeline?: WritePathPrimitivePipeline;
  handoff_pipeline?: HandoffPrimitivePipeline;
  governance_decision_engine?: GovernanceDecisionEngine;
  provider_adapter_pipeline?: ProviderAdapterPipeline;
  runtime_surface_registry?: RuntimeSurfaceRegistryShape;
  runtime_surface_contract_consistency?: RuntimeSurfaceContractConsistencyReport;
}

export interface StoreContractWiring {
  event_store?: EventStore;
  memory_store?: MemoryStore;
  state_store?: StateStore;
  artifact_reference_store?: ArtifactReferenceStore;
  bundle_store?: BundleStore;
  handoff_store?: HandoffStore;
  summary_store?: SummaryStore;
  audit_store?: AuditStore;
  evaluation_store?: EvaluationStore;
  relation_store?: RelationStore;
  index_store?: IndexStore;
}

export interface ServiceWiringShape {
  core: CoreModuleServiceWiring;
  stores: StoreContractWiring;
  operations: OperationContractShape[];
}

export interface ModuleWiringPrimitive {
  wire(input: {
    module_id: string;
    provides_dependency_tokens: string[];
    requires_dependency_tokens: string[];
    optional_dependency_tokens?: string[];
    boundary: DependencyBoundaryContract;
  }): ModuleWiringShape;
}

export const createModuleWiringPrimitive = (): ModuleWiringPrimitive => {
  return {
    wire(input): ModuleWiringShape {
      return {
        module_id: input.module_id,
        provides_dependency_tokens: input.provides_dependency_tokens,
        requires_dependency_tokens: input.requires_dependency_tokens,
        optional_dependency_tokens: input.optional_dependency_tokens ?? [],
        boundary: input.boundary
      };
    }
  };
};

export interface CapabilityRegistrationPrimitive {
  register(input: {
    capability_id: string;
    source_module_id: string;
    linked_operations: OperationContractShape[];
    visibility?: CapabilityRegistrationShape["visibility"];
    state?: CapabilityRegistrationShape["state"];
  }): CapabilityRegistrationShape;
}

export const createCapabilityRegistrationPrimitive = (): CapabilityRegistrationPrimitive => {
  return {
    register(input): CapabilityRegistrationShape {
      return {
        capability_id: input.capability_id,
        source_module_id: input.source_module_id,
        linked_operations: input.linked_operations,
        visibility: input.visibility ?? "internal",
        state: input.state ?? "registered"
      };
    }
  };
};
