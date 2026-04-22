import type { ErrorFamily } from "@orchestrator/core-foundation";
import type { SurfaceErrorCode } from "@orchestrator/integration-contracts";

export const RUNTIME_SURFACE_ERROR_CODES = [
  "validation_failure",
  "missing_handler",
  "unsupported_surface",
  "unsupported_mode",
  "boundary_preservation_warning",
  "handler_contract_invalid",
  "canonical_linkage_missing",
  "internal_surface_failure"
] as const;

export type RuntimeSurfaceErrorCode = (typeof RUNTIME_SURFACE_ERROR_CODES)[number];

export interface RuntimeSurfaceErrorShape {
  error_code: RuntimeSurfaceErrorCode;
  error_family: ErrorFamily;
  message: string;
  retryable: boolean;
  details?: Record<string, unknown>;
}

export interface CanonicalRuntimeSurfaceErrorFamilyVocabulary {
  code: RuntimeSurfaceErrorCode;
  family: ErrorFamily;
  retryable: boolean;
}

export const CANONICAL_RUNTIME_SURFACE_ERROR_FAMILIES: CanonicalRuntimeSurfaceErrorFamilyVocabulary[] = [
  { code: "validation_failure", family: "invalid_input", retryable: false },
  { code: "missing_handler", family: "not_found", retryable: false },
  { code: "unsupported_surface", family: "unsupported_capability", retryable: false },
  { code: "unsupported_mode", family: "unsupported_capability", retryable: false },
  { code: "boundary_preservation_warning", family: "internal_orchestration_failure", retryable: true },
  { code: "handler_contract_invalid", family: "invalid_input", retryable: false },
  { code: "canonical_linkage_missing", family: "scope_denial", retryable: false },
  { code: "internal_surface_failure", family: "internal_orchestration_failure", retryable: true }
];

export type RuntimeToSurfaceErrorCodeMapping = Record<RuntimeSurfaceErrorCode, SurfaceErrorCode>;

export const RUNTIME_TO_SURFACE_ERROR_CODE_MAP: RuntimeToSurfaceErrorCodeMapping = {
  validation_failure: "validation_failure",
  missing_handler: "not_found",
  unsupported_surface: "unsupported_capability",
  unsupported_mode: "unsupported_capability",
  boundary_preservation_warning: "internal_failure",
  handler_contract_invalid: "validation_failure",
  canonical_linkage_missing: "scope_denial",
  internal_surface_failure: "internal_failure"
};
