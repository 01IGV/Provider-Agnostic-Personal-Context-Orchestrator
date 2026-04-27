import type {
  LocalDeterministicContextSourceAdapterBuilder,
  LocalDeterministicContextSourceAdapterBuilderInputShape,
  LocalDeterministicContextSourceAdapterResultShape,
  LocalDeterministicContextSourceExecutionPostureShape,
  LocalDeterministicContextSourceWarningShape,
  LocalDeterministicBoundedContextMaterializationInputShape
} from "./local-deterministic-context-source-adapter-types.js";
import type { BoundedContextResponseEnvelopeShape } from "./agent-context-request-boundary-types.js";

const defaultExecutionPosture = (): LocalDeterministicContextSourceExecutionPostureShape => ({
  local_only: true,
  deterministic: true,
  contract_only: true,
  network_access_allowed_now: false,
  provider_sdk_call_allowed_now: false,
  transport_execution_allowed_now: false,
  concrete_persistence_read_allowed_now: false,
  concrete_persistence_write_allowed_now: false,
  real_model_call_allowed_now: false,
  real_storage_write_allowed_now: false,
  runtime_handler_bound: false,
  actual_contour_execution_allowed_now: false
});

const defaultWarnings = (): LocalDeterministicContextSourceWarningShape[] => [
  {
    code: "local_source_adapter_contract_only",
    message: "Local deterministic context source adapter is a contract shape only."
  },
  {
    code: "local_source_adapter_non_networked",
    message: "No network, provider SDK, or transport execution is allowed by this adapter contract."
  },
  {
    code: "local_source_adapter_non_persistent",
    message: "No concrete persistence read/write or storage write is performed by this adapter contract."
  },
  {
    code: "local_source_adapter_not_runtime_execution",
    message: "Bounded context materialization is contract-level and does not invoke runtime handlers or contours."
  },
  {
    code: "local_source_adapter_permission_denied_by_default",
    message: "No permission grant or runtime permission is issued by this adapter contract."
  }
];

export const createLocalDeterministicContextSourceAdapterBuilder =
  (): LocalDeterministicContextSourceAdapterBuilder => ({
    createAdapterResult(
      input: LocalDeterministicContextSourceAdapterBuilderInputShape
    ): LocalDeterministicContextSourceAdapterResultShape {
      return {
        adapter_result_id: input.adapter_result_id,
        adapter_status: input.adapter_status ?? "local_context_source_ready",
        materialization_boundary:
          input.materialization_boundary ?? "contract_only_local_deterministic_context_materialization",
        authority: input.authority,
        execution_posture: defaultExecutionPosture(),
        source_items: [...input.source_items].sort(
          (left, right) => left.deterministic_order - right.deterministic_order
        ),
        provenance_envelope_ref: input.provenance_envelope_ref,
        permission_envelope_ref: input.permission_envelope_ref,
        audit_envelope_ref: input.audit_envelope_ref,
        generated_at: input.generated_at,
        ...(input.correlation_id ? { correlation_id: input.correlation_id } : {}),
        warnings: input.warnings ?? defaultWarnings()
      };
    },

    materializeResponse(
      input: LocalDeterministicBoundedContextMaterializationInputShape
    ): BoundedContextResponseEnvelopeShape {
      const { request, adapter_result } = input;

      return {
        bounded_context_response_id: `${request.agent_context_request_id}:local-deterministic-bounded-context-response`,
        agent_context_request_id: request.agent_context_request_id,
        response_status:
          adapter_result.adapter_status === "local_context_source_ready"
            ? "bounded_context_ready"
            : "bounded_context_not_available",
        response_boundary: "contract_only_bounded_context_response",
        authority: request.authority,
        execution_posture: request.execution_posture,
        bounded_context_package_ref:
          input.bounded_context_package_ref ??
          `${request.agent_context_request_id}:local-deterministic-bounded-context-package`,
        context_bundle_ref:
          input.context_bundle_ref ??
          `${request.agent_context_request_id}:local-deterministic-context-bundle`,
        provenance_envelope_ref: adapter_result.provenance_envelope_ref,
        permission_envelope_ref: adapter_result.permission_envelope_ref,
        audit_envelope_ref: adapter_result.audit_envelope_ref,
        response_payload: {
          contract_only: true,
          bounded_context_materialized_from_local_deterministic_source: true,
          adapter_result_id: adapter_result.adapter_result_id,
          source_item_count: adapter_result.source_items.length,
          source_items: adapter_result.source_items,
          local_source_execution_posture: adapter_result.execution_posture
        },
        warnings: [
          ...request.warnings,
          ...adapter_result.warnings.map((warning) => ({
            code: "agent_context_contract_only" as const,
            message: warning.message
          }))
        ],
        served_at: input.served_at,
        ...(request.correlation_id ? { correlation_id: request.correlation_id } : {})
      };
    }
  });
