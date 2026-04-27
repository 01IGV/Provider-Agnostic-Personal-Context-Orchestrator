export const LOCAL_JSON_FIXTURE_RUNNER_CLI_BOUNDARY_KINDS = [
  "minimal_local_json_fixture_runner_cli_boundary"
] as const;
export type LocalJsonFixtureRunnerCliBoundaryKind =
  (typeof LOCAL_JSON_FIXTURE_RUNNER_CLI_BOUNDARY_KINDS)[number];

export const LOCAL_JSON_FIXTURE_RUNNER_CLI_BOUNDARY_STATUSES = [
  "local_json_fixture_cli_boundary_ready",
  "local_json_fixture_cli_boundary_denied"
] as const;
export type LocalJsonFixtureRunnerCliBoundaryStatus =
  (typeof LOCAL_JSON_FIXTURE_RUNNER_CLI_BOUNDARY_STATUSES)[number];

export const LOCAL_JSON_FIXTURE_RUNNER_CLI_BOUNDARY_MODES = [
  "contract_only_cli_file_boundary"
] as const;
export type LocalJsonFixtureRunnerCliBoundaryMode =
  (typeof LOCAL_JSON_FIXTURE_RUNNER_CLI_BOUNDARY_MODES)[number];
