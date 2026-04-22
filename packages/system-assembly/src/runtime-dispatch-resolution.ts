import type {
  RuntimeOperationLookupResultShape,
  HandlerResolutionResultShape,
  InternalDispatchWarningShape
} from "./runtime-dispatch-types.js";
import type { RuntimeSurfaceRegistryLookup, RuntimeSurfaceRegistryShape } from "@orchestrator/runtime-surface";

export interface RuntimeOperationLookupInput {
  runtime_surface_registry?: RuntimeSurfaceRegistryShape;
  lookup: RuntimeSurfaceRegistryLookup;
}

export interface RuntimeOperationLookupPrimitive {
  lookup(input: RuntimeOperationLookupInput): RuntimeOperationLookupResultShape;
}

export interface HandlerResolutionPrimitive {
  resolve(input: { request_id: string; operation_lookup: RuntimeOperationLookupResultShape }): HandlerResolutionResultShape;
}

export const createRuntimeOperationLookupPrimitive = (): RuntimeOperationLookupPrimitive => {
  return {
    lookup(input: RuntimeOperationLookupInput): RuntimeOperationLookupResultShape {
      if (!input.runtime_surface_registry) {
        return {
          lookup: input.lookup,
          found: false,
          unsupported_path_code: "unsupported_operation",
          warnings: [
            {
              code: "registry_missing",
              message: "runtime-surface registry is not available in current assembly wiring"
            }
          ]
        };
      }

      const matchedEntry = input.runtime_surface_registry.entries.find(
        (entry) =>
          entry.operation_id === input.lookup.operation_id &&
          entry.entrypoint_types.includes(input.lookup.entrypoint_type) &&
          entry.surface_families.includes(input.lookup.surface_family) &&
          entry.supported_modes.includes(input.lookup.surface_mode)
      );

      if (!matchedEntry) {
        return {
          lookup: input.lookup,
          found: false,
          unsupported_path_code: "unsupported_operation",
          warnings: [
            {
              code: "dispatch_planning_deferred",
              message: "no runtime-surface registry entry matches operation/surface/mode lookup"
            }
          ]
        };
      }

      return {
        lookup: input.lookup,
        found: true,
        matched_entry: matchedEntry,
        warnings: []
      };
    }
  };
};

export const createHandlerResolutionPrimitive = (): HandlerResolutionPrimitive => {
  return {
    resolve(input: { request_id: string; operation_lookup: RuntimeOperationLookupResultShape }): HandlerResolutionResultShape {
      if (!input.operation_lookup.found || !input.operation_lookup.matched_entry) {
        const warnings: InternalDispatchWarningShape[] = [...input.operation_lookup.warnings];

        return {
          request_id: input.request_id,
          operation_id: input.operation_lookup.lookup.operation_id,
          status: "missing_handler",
          warnings
        };
      }

      return {
        request_id: input.request_id,
        operation_id: input.operation_lookup.matched_entry.operation_id,
        status: "resolved",
        handler_id: input.operation_lookup.matched_entry.handler_id,
        operation_family: input.operation_lookup.matched_entry.operation_family,
        dependency_requirements: input.operation_lookup.matched_entry.dependency_requirements,
        warnings: []
      };
    }
  };
};
