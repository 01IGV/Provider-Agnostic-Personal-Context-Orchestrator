import type { CapabilityClass, OperationFamily } from "@orchestrator/integration-contracts";
import type {
  HandlerDependencyRequirementShape,
  RuntimeHandlerCapabilityRequirementShape
} from "./handlers.js";
import type { RuntimeEntrypointType, RuntimeSurfaceFamily, RuntimeSurfaceMode } from "./vocabularies.js";

export interface HandlerCapabilityLinkageShape {
  handler_id: string;
  operation_id: string;
  operation_family: OperationFamily;
  capability_class: CapabilityClass;
  linked_entrypoint_types: RuntimeEntrypointType[];
  linked_surface_families: RuntimeSurfaceFamily[];
  linked_modes: RuntimeSurfaceMode[];
}

export interface RuntimeSurfaceRegistryEntryShape {
  handler_id: string;
  operation_id: string;
  operation_family: OperationFamily;
  entrypoint_types: RuntimeEntrypointType[];
  surface_families: RuntimeSurfaceFamily[];
  supported_modes: RuntimeSurfaceMode[];
  dependency_requirements: HandlerDependencyRequirementShape[];
  capability_requirements: RuntimeHandlerCapabilityRequirementShape[];
  capability_linkages: HandlerCapabilityLinkageShape[];
}

export interface RuntimeSurfaceRegistryShape {
  registry_id: string;
  version: string;
  entries: RuntimeSurfaceRegistryEntryShape[];
}

export interface RuntimeSurfaceRegistryLookup {
  operation_id: string;
  surface_family: RuntimeSurfaceFamily;
  surface_mode: RuntimeSurfaceMode;
  entrypoint_type: RuntimeEntrypointType;
}
