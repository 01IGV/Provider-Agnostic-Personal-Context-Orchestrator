import type {
  LocalJsonRequestResponseRunnerBuilder,
  LocalJsonRequestResponseRunnerExecutionPostureShape,
  LocalJsonRequestResponseRunnerRequestBuilderInputShape,
  LocalJsonRequestResponseRunnerRequestEnvelopeShape,
  LocalJsonRequestResponseRunnerResponseBuilderInputShape,
  LocalJsonRequestResponseRunnerResponseEnvelopeShape,
  LocalJsonRequestResponseRunnerSummaryShape,
  LocalJsonResponseObservationSummaryShape
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

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const createResponseObservationSummary = (
  runner_response_id: string,
  runner_request: LocalJsonRequestResponseRunnerRequestEnvelopeShape,
  response_json: LocalJsonRequestResponseRunnerResponseBuilderInputShape["response_json"]
): LocalJsonResponseObservationSummaryShape => {
  const payload = response_json.response.response_payload;
  const sourceItems = Array.isArray(payload.source_items) ? payload.source_items : [];
  const packageEnvelope =
    typeof payload.bounded_context_package === "object" && payload.bounded_context_package !== null
      ? payload.bounded_context_package
      : {};
  const packageItems =
    "package_items" in packageEnvelope && Array.isArray(packageEnvelope.package_items)
      ? packageEnvelope.package_items
      : [];
  const sourceMaterializationReceipt = isRecord(payload.source_materialization_receipt)
    ? payload.source_materialization_receipt
    : {};
  const sourceMaterializationReceiptPosture =
    isRecord(sourceMaterializationReceipt.execution_posture)
      ? sourceMaterializationReceipt.execution_posture
      : {};
  const sourceMaterializationReceiptId =
    typeof sourceMaterializationReceipt.receipt_id === "string"
      ? sourceMaterializationReceipt.receipt_id
      : undefined;
  const sourceMaterializationReceiptRef =
    sourceMaterializationReceipt.receipt_version ===
    "local-v0-source-materialization-receipt/v1"
      ? sourceMaterializationReceipt.receipt_version
      : undefined;
  const sourceMaterializationReceiptBoundary =
    typeof sourceMaterializationReceipt.materialization_boundary === "string"
      ? sourceMaterializationReceipt.materialization_boundary
      : undefined;
  const sourceMaterializationReceiptDirectFileAccess =
    sourceMaterializationReceiptPosture.direct_agent_repo_file_access_allowed_now === false
      ? false
      : undefined;
  const sourceMaterializationReceiptLiveRead =
    sourceMaterializationReceiptPosture.live_source_read_performed === false ? false : undefined;

  return {
    observation_result: "local_json_response_observation_summary_ready",
    agent_readable_contract: "agent-readable-local-json-response-observation/v1",
    agent_response_status: "bounded_context_ready_for_agent_use",
    runner_response_id,
    agent_context_request_id: response_json.refs.agent_context_request_id,
    bounded_context_response_id: response_json.refs.bounded_context_response_id,
    bounded_context_package_id: response_json.refs.bounded_context_package_id,
    protocol_adapter_shape_id: response_json.adapter_shape_id,
    response_status: response_json.response.response_status,
    selected_source_item_count: sourceItems.length,
    selected_source_refs: sourceItems
      .map((item) => item?.source_ref)
      .filter((sourceRef): sourceRef is string => typeof sourceRef === "string"),
    selected_scope_ids: sourceItems
      .map((item) => item?.scope_id)
      .filter((scopeId): scopeId is string => typeof scopeId === "string"),
    ...(sourceMaterializationReceiptId
      ? { source_materialization_receipt_id: sourceMaterializationReceiptId }
      : {}),
    ...(sourceMaterializationReceiptRef
      ? { source_materialization_receipt_ref: sourceMaterializationReceiptRef }
      : {}),
    ...(sourceMaterializationReceiptBoundary
      ? { source_materialization_receipt_boundary: sourceMaterializationReceiptBoundary }
      : {}),
    ...(sourceMaterializationReceiptDirectFileAccess === false
      ? {
          source_materialization_receipt_direct_agent_repo_file_access_allowed_now:
            sourceMaterializationReceiptDirectFileAccess
        }
      : {}),
    ...(sourceMaterializationReceiptLiveRead === false
      ? {
          source_materialization_receipt_live_source_read_performed:
            sourceMaterializationReceiptLiveRead
        }
      : {}),
    package_item_count: packageItems.length,
    local_json_only: runner_request.execution_posture.local_json_only,
    deterministic: runner_request.execution_posture.deterministic,
    fixture_driven: runner_request.execution_posture.fixture_driven,
    runtime_permission_granted: runner_request.execution_posture.runtime_permission_granted,
    actual_contour_execution_allowed_now:
      runner_request.execution_posture.actual_contour_execution_allowed_now,
    safe_agent_use_hints: [
      "read_selected_bounded_context",
      "use_selected_source_refs_for_grounding",
      "preserve_authority_provenance_permission_audit_refs",
      "treat_response_as_non_executing_context"
    ],
    denied_agent_action_hints: [
      "do_not_execute_runtime_handlers",
      "do_not_call_provider_sdks",
      "do_not_read_or_write_concrete_persistence",
      "do_not_issue_permission_grants",
      "do_not_perform_model_calls",
      "do_not_perform_storage_writes",
      "do_not_invoke_contours"
    ]
  };
};

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
      const runner_response_id = `${runner_request.runner_request_id}:verified-response-json`;

      return {
        runner_response_id,
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
        response_observation_summary_json: createResponseObservationSummary(
          runner_response_id,
          runner_request,
          response_json
        ),
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
