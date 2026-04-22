import type { OperationContractShape } from "@orchestrator/integration-contracts";
import { RUNTIME_TO_SURFACE_ERROR_CODE_MAP, type RuntimeSurfaceErrorCode } from "./errors.js";
import type { RuntimeSurfaceRegistryShape } from "./registry.js";
import type { RuntimeSurfaceFamily, RuntimeSurfaceMode } from "./vocabularies.js";

export const RUNTIME_SURFACE_CONSISTENCY_ISSUE_CODES = [
  "operation_contract_missing",
  "operation_family_mismatch",
  "capability_linkage_mismatch",
  "entrypoint_surface_mismatch"
] as const;

export type RuntimeSurfaceConsistencyIssueCode = (typeof RUNTIME_SURFACE_CONSISTENCY_ISSUE_CODES)[number];

export interface RuntimeSurfaceConsistencyIssue {
  code: RuntimeSurfaceConsistencyIssueCode;
  handler_id: string;
  operation_id: string;
  note: string;
}

export interface RuntimeSurfaceContractConsistencyReport {
  is_consistent: boolean;
  issues: RuntimeSurfaceConsistencyIssue[];
}

export interface RuntimeSurfaceContractConsistencyInput {
  operation_contracts: OperationContractShape[];
  runtime_surface_registry: RuntimeSurfaceRegistryShape;
}

const expectedSurfaceForEntrypointType = (entrypointType: "mcp" | "api" | "generic_runtime"): RuntimeSurfaceFamily => {
  if (entrypointType === "mcp") {
    return "mcp_entrypoint";
  }

  if (entrypointType === "api") {
    return "api_entrypoint";
  }

  return "generic_runtime_entrypoint";
};

const includesAnyMode = (left: RuntimeSurfaceMode[], right: RuntimeSurfaceMode[]): boolean => {
  return left.some((mode) => right.includes(mode));
};

export const validateRuntimeSurfaceContractConsistency = (
  input: RuntimeSurfaceContractConsistencyInput
): RuntimeSurfaceContractConsistencyReport => {
  const issues: RuntimeSurfaceConsistencyIssue[] = [];

  for (const entry of input.runtime_surface_registry.entries) {
    const operationContract = input.operation_contracts.find((contract) => contract.operation_id === entry.operation_id);

    if (!operationContract) {
      issues.push({
        code: "operation_contract_missing",
        handler_id: entry.handler_id,
        operation_id: entry.operation_id,
        note: "runtime-surface registry entry has no linked integration operation contract"
      });
      continue;
    }

    if (operationContract.operation_family !== entry.operation_family) {
      issues.push({
        code: "operation_family_mismatch",
        handler_id: entry.handler_id,
        operation_id: entry.operation_id,
        note: "operation family differs between runtime-surface registry and integration contract"
      });
    }

    for (const linkage of entry.capability_linkages) {
      const capabilityMismatch = linkage.capability_class !== operationContract.capability_class;
      const familyMismatch = linkage.operation_family !== operationContract.operation_family;
      const modeMismatch = !includesAnyMode(linkage.linked_modes, entry.supported_modes);

      if (capabilityMismatch || familyMismatch || modeMismatch) {
        issues.push({
          code: "capability_linkage_mismatch",
          handler_id: entry.handler_id,
          operation_id: entry.operation_id,
          note: "handler capability linkage is not aligned with operation contract or registry mode support"
        });
      }
    }

    for (const entrypointType of entry.entrypoint_types) {
      const expectedSurface = expectedSurfaceForEntrypointType(entrypointType);
      if (!entry.surface_families.includes(expectedSurface)) {
        issues.push({
          code: "entrypoint_surface_mismatch",
          handler_id: entry.handler_id,
          operation_id: entry.operation_id,
          note: `entrypoint type '${entrypointType}' requires surface family '${expectedSurface}'`
        });
      }
    }
  }

  return {
    is_consistent: issues.length === 0,
    issues
  };
};

export const mapRuntimeErrorToSurfaceErrorCode = (code: RuntimeSurfaceErrorCode) => {
  return RUNTIME_TO_SURFACE_ERROR_CODE_MAP[code];
};
