export const ERROR_FAMILIES = [
  "invalid_input",
  "unsupported_capability",
  "policy_rejection",
  "scope_denial",
  "candidate_rejected",
  "not_found",
  "expired_artifact",
  "transient_service_failure",
  "internal_orchestration_failure",
  "provider_adapter_failure"
] as const;

export type ErrorFamily = (typeof ERROR_FAMILIES)[number];
