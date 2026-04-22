import type { ErrorFamily } from "@orchestrator/core-foundation";
import type { SurfaceErrorCode } from "./vocabularies.js";

export interface SurfaceValidationFailureShape {
  error_code: "validation_failure";
  error_family: Extract<ErrorFamily, "invalid_input">;
  field_errors: Array<{ field: string; reason: string }>;
}

export interface SurfacePolicyRejectionShape {
  error_code: "policy_rejection";
  error_family: Extract<ErrorFamily, "policy_rejection">;
  policy_rule_keys: string[];
  reason: string;
}

export interface SurfaceScopeDenialShape {
  error_code: "scope_denial";
  error_family: Extract<ErrorFamily, "scope_denial">;
  requested_scope?: string;
  allowed_scopes?: string[];
}

export interface SurfaceNotFoundShape {
  error_code: "not_found";
  error_family: Extract<ErrorFamily, "not_found">;
  resource_type: string;
  resource_id: string;
}

export interface SurfaceExpiredShape {
  error_code: "expired";
  error_family: Extract<ErrorFamily, "expired_artifact">;
  artifact_id: string;
  expired_at?: string;
}

export interface SurfaceTransientFailureShape {
  error_code: "transient_failure";
  error_family: Extract<ErrorFamily, "transient_service_failure">;
  transient_reason: string;
  retry_after_ms?: number;
}

export interface SurfaceUnsupportedCapabilityShape {
  error_code: "unsupported_capability";
  error_family: Extract<ErrorFamily, "unsupported_capability">;
  capability_class: string;
}

export interface SurfaceInternalFailureShape {
  error_code: "internal_failure";
  error_family: Extract<ErrorFamily, "internal_orchestration_failure">;
  incident_ref?: string;
}

export type SurfaceErrorShape =
  | SurfaceValidationFailureShape
  | SurfacePolicyRejectionShape
  | SurfaceScopeDenialShape
  | SurfaceNotFoundShape
  | SurfaceExpiredShape
  | SurfaceTransientFailureShape
  | SurfaceUnsupportedCapabilityShape
  | SurfaceInternalFailureShape;

export interface CanonicalSurfaceErrorFamilyVocabulary {
  code: SurfaceErrorCode;
  family: ErrorFamily;
  retryable: boolean;
}

export const CANONICAL_SURFACE_ERROR_FAMILIES: CanonicalSurfaceErrorFamilyVocabulary[] = [
  { code: "validation_failure", family: "invalid_input", retryable: false },
  { code: "policy_rejection", family: "policy_rejection", retryable: false },
  { code: "scope_denial", family: "scope_denial", retryable: false },
  { code: "not_found", family: "not_found", retryable: false },
  { code: "expired", family: "expired_artifact", retryable: false },
  { code: "transient_failure", family: "transient_service_failure", retryable: true },
  { code: "unsupported_capability", family: "unsupported_capability", retryable: false },
  { code: "internal_failure", family: "internal_orchestration_failure", retryable: true }
];
