import type {
  LocalJsonRequestResponseRunnerBuilder,
  LocalJsonRequestResponseRunnerExecutionPostureShape,
  LocalJsonRequestResponseRunnerRequestBuilderInputShape,
  LocalJsonRequestResponseRunnerRequestEnvelopeShape,
  LocalJsonRequestResponseRunnerResponseBuilderInputShape,
  LocalJsonRequestResponseRunnerResponseEnvelopeShape,
  LocalJsonRequestResponseRunnerSummaryShape
} from "./local-json-request-response-runner-types.js";

const defaultExecutionPosture = (): LocalJsonRequestResponseRunnerExecutionPostureShape => ({
  local_json_only: true,
  deterministic: true,
  fixture_driven: true,
  runner_shape_only: true,
  mcp_server_implemented: false,
  mcp_tool_registered: false,
  mcp_resource_registered: false,
  api_route_registered: false,
  api_controller_registered: false,
  runtime_handler_bound: false,
  network_access_allowed_now: false,
  provider_sdk_call_allowed_now: false,
  transport_execution_allowed_now: false,
  concrete_persistence_read_allowed_now: false,
  concrete_persistence_write_allowed_now: false,
  real_model_call_allowed_now: false,
  real_storage_write_allowed_now: false,
  runtime_permission_granted: false,
  actual_contour_execution_allowed_now: false
});

const defaultRequestNotes = (): string[] => [
  "Local JSON runner request is a fixture-driven contract shape only.",
  "No file IO, network access, MCP/API route, runtime handler, provider call, persistence, model call, storage write, permission grant, or contour execution is performed."
];

const defaultResponseNotes = (): string[] => [
  "Local JSON runner response carries a verified protocol-surface adapter JSON fixture.",
  "The response is machine-readable and deterministic, but it is not runtime execution."
];

export const createLocalJsonRequestResponseRunnerBuilder =
  (): LocalJsonRequestResponseRunnerBuilder => ({
    createRequest(
      input: LocalJsonRequestResponseRunnerRequestBuilderInputShape
    ): LocalJsonRequestResponseRunnerRequestEnvelopeShape {
      return {
        runner_request_id: input.runner_request_id,
        runner_kind: "local_json_request_response_runner_shape",
        runner_status: "local_json_runner_shape_ready",
        runner_boundary: "local_deterministic_json_runner_shape_only",
        operation_id: "local_json_request_response_runner_shape",
        operation_version: "local-json-request-response-runner-shape/v1",
        input_kind: "agent_context_request_json_fixture",
        requested_output_kind: "verified_protocol_surface_adapter_json_fixture",
        request_json: input.request_json,
        execution_posture: defaultExecutionPosture(),
        created_at: input.created_at,
        ...(input.correlation_id ? { correlation_id: input.correlation_id } : {}),
        notes: input.notes ?? defaultRequestNotes()
      };
    },

    createResponse(
      input: LocalJsonRequestResponseRunnerResponseBuilderInputShape
    ): LocalJsonRequestResponseRunnerResponseEnvelopeShape {
      const { runner_request, response_json, response_summary_json } = input;

      return {
        runner_response_id: `${runner_request.runner_request_id}:verified-response-json`,
        runner_request_id: runner_request.runner_request_id,
        runner_status: "local_json_runner_shape_ready",
        output_kind: "verified_protocol_surface_adapter_json_fixture",
        refs: {
          agent_context_request_id: runner_request.request_json.agent_context_request_id,
          bounded_context_response_id: response_json.refs.bounded_context_response_id,
          bounded_context_package_id: response_json.refs.bounded_context_package_id,
          protocol_adapter_shape_id: response_json.adapter_shape_id,
          verification_result: response_json.refs.verification_result
        },
        response_json,
        response_summary_json,
        execution_posture: runner_request.execution_posture,
        json_serializable: true,
        served_at: input.served_at,
        ...(runner_request.correlation_id ? { correlation_id: runner_request.correlation_id } : {}),
        notes: input.notes ?? defaultResponseNotes()
      };
    },

    summarize(
      input: LocalJsonRequestResponseRunnerResponseEnvelopeShape
    ): LocalJsonRequestResponseRunnerSummaryShape {
      return {
        runner_request_id: input.runner_request_id,
        runner_response_id: input.runner_response_id,
        agent_context_request_id: input.refs.agent_context_request_id,
        bounded_context_response_id: input.refs.bounded_context_response_id,
        bounded_context_package_id: input.refs.bounded_context_package_id,
        protocol_adapter_shape_id: input.refs.protocol_adapter_shape_id,
        local_json_only: input.execution_posture.local_json_only,
        deterministic: input.execution_posture.deterministic,
        fixture_driven: input.execution_posture.fixture_driven,
        runner_shape_only: input.execution_posture.runner_shape_only,
        runtime_permission_granted: input.execution_posture.runtime_permission_granted,
        actual_contour_execution_allowed_now:
          input.execution_posture.actual_contour_execution_allowed_now
      };
    }
  });
