import type {
  LocalJsonFixtureRunnerCliBoundaryBuilder,
  LocalJsonFixtureRunnerCliBoundaryBuilderInputShape,
  LocalJsonFixtureRunnerCliBoundaryExecutionPostureShape,
  LocalJsonFixtureRunnerCliBoundaryShape,
  LocalJsonFixtureRunnerCliBoundarySummaryShape
} from "./local-json-fixture-runner-cli-boundary-types.js";

const defaultExecutionPosture = (): LocalJsonFixtureRunnerCliBoundaryExecutionPostureShape => ({
  cli_boundary: true,
  file_boundary: true,
  contract_only: true,
  deterministic: true,
  local_only: true,
  file_read_performed: false,
  file_write_performed: false,
  cli_process_spawned: false,
  process_execution_performed: false,
  mcp_server_implemented: false,
  mcp_tool_registered: false,
  mcp_resource_registered: false,
  api_route_registered: false,
  api_controller_registered: false,
  runtime_handler_bound: false,
  provider_sdk_call_allowed_now: false,
  transport_execution_allowed_now: false,
  concrete_persistence_read_allowed_now: false,
  concrete_persistence_write_allowed_now: false,
  real_model_call_allowed_now: false,
  real_storage_write_allowed_now: false,
  runtime_permission_granted: false,
  actual_contour_execution_allowed_now: false
});

const defaultNotes = (): string[] => [
  "Minimal local JSON fixture runner CLI boundary is a contract shape only.",
  "No fixture file is read or written, no CLI process is spawned, and no runtime/protocol/provider/persistence/model/storage/contour execution is performed."
];

export const createLocalJsonFixtureRunnerCliBoundaryBuilder =
  (): LocalJsonFixtureRunnerCliBoundaryBuilder => ({
    create(
      input: LocalJsonFixtureRunnerCliBoundaryBuilderInputShape
    ): LocalJsonFixtureRunnerCliBoundaryShape {
      return {
        cli_boundary_id: input.cli_boundary_id,
        boundary_kind: "minimal_local_json_fixture_runner_cli_boundary",
        boundary_status: "local_json_fixture_cli_boundary_ready",
        boundary_mode: "contract_only_cli_file_boundary",
        operation_id: "minimal_local_json_fixture_runner_cli_boundary",
        operation_version: "minimal-local-json-fixture-runner-cli-boundary/v1",
        input_fixture: input.input_fixture,
        output_fixture: input.output_fixture,
        refs: input.refs,
        execution_posture: defaultExecutionPosture(),
        runner_response: input.runner_response,
        runner_summary: input.runner_summary,
        created_at: input.created_at,
        ...(input.correlation_id ? { correlation_id: input.correlation_id } : {}),
        notes: input.notes ?? defaultNotes()
      };
    },

    summarize(
      input: LocalJsonFixtureRunnerCliBoundaryShape
    ): LocalJsonFixtureRunnerCliBoundarySummaryShape {
      return {
        cli_boundary_id: input.cli_boundary_id,
        runner_response_id: input.refs.runner_response_id,
        bounded_context_response_id: input.refs.bounded_context_response_id,
        bounded_context_package_id: input.refs.bounded_context_package_id,
        protocol_adapter_shape_id: input.refs.protocol_adapter_shape_id,
        local_json_fixture_runner_proof_id: input.refs.local_json_fixture_runner_proof_id,
        cli_boundary: input.execution_posture.cli_boundary,
        file_boundary: input.execution_posture.file_boundary,
        contract_only: input.execution_posture.contract_only,
        deterministic: input.execution_posture.deterministic,
        local_only: input.execution_posture.local_only,
        file_read_performed: input.execution_posture.file_read_performed,
        file_write_performed: input.execution_posture.file_write_performed,
        cli_process_spawned: input.execution_posture.cli_process_spawned,
        process_execution_performed: input.execution_posture.process_execution_performed,
        runtime_permission_granted: input.execution_posture.runtime_permission_granted,
        actual_contour_execution_allowed_now: input.execution_posture.actual_contour_execution_allowed_now
      };
    }
  });
