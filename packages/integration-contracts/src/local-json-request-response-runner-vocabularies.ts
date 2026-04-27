export const LOCAL_JSON_REQUEST_RESPONSE_RUNNER_KINDS = [
  "local_json_request_response_runner_shape"
] as const;
export type LocalJsonRequestResponseRunnerKind =
  (typeof LOCAL_JSON_REQUEST_RESPONSE_RUNNER_KINDS)[number];

export const LOCAL_JSON_REQUEST_RESPONSE_RUNNER_STATUSES = [
  "local_json_runner_shape_ready",
  "local_json_runner_shape_denied"
] as const;
export type LocalJsonRequestResponseRunnerStatus =
  (typeof LOCAL_JSON_REQUEST_RESPONSE_RUNNER_STATUSES)[number];

export const LOCAL_JSON_REQUEST_RESPONSE_RUNNER_BOUNDARIES = [
  "local_deterministic_json_runner_shape_only"
] as const;
export type LocalJsonRequestResponseRunnerBoundary =
  (typeof LOCAL_JSON_REQUEST_RESPONSE_RUNNER_BOUNDARIES)[number];

export const LOCAL_JSON_REQUEST_RESPONSE_RUNNER_INPUT_KINDS = [
  "agent_context_request_json_fixture"
] as const;
export type LocalJsonRequestResponseRunnerInputKind =
  (typeof LOCAL_JSON_REQUEST_RESPONSE_RUNNER_INPUT_KINDS)[number];

export const LOCAL_JSON_REQUEST_RESPONSE_RUNNER_OUTPUT_KINDS = [
  "verified_protocol_surface_adapter_json_fixture"
] as const;
export type LocalJsonRequestResponseRunnerOutputKind =
  (typeof LOCAL_JSON_REQUEST_RESPONSE_RUNNER_OUTPUT_KINDS)[number];
