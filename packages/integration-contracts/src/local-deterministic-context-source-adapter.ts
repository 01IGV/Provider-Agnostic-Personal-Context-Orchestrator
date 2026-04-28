import type {
  BoundedContextPackageEnvelopeShape,
  BoundedContextPackageExecutionPostureShape,
  LocalDeterministicContextSourceAdapterBuilder,
  LocalDeterministicContextSourceAdapterBuilderInputShape,
  LocalDeterministicContextSourceAdapterResultShape,
  LocalDeterministicContextSourceExecutionPostureShape,
  LocalDeterministicContextSourceWarningShape,
  LocalDeterministicBoundedContextMaterializationInputShape,
  LocalV0SourceMaterializationReceiptPostureShape,
  LocalV0SourceMaterializationReceiptShape
} from "./local-deterministic-context-source-adapter-types.js";
import type { BoundedContextResponseEnvelopeShape } from "./agent-context-request-boundary-types.js";
import type { AgentContextRequestBoundaryShape } from "./agent-context-request-boundary-types.js";

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

const boundedPackageExecutionPosture = (): BoundedContextPackageExecutionPostureShape => ({
  contract_only: true,
  deterministic: true,
  local_only: true,
  canonical_persistence_read_performed: false,
  provider_response_included: false,
  model_output_included: false,
  storage_content_included: false,
  contour_execution_result_included: false,
  runtime_permission_granted: false,
  actual_contour_execution_allowed_now: false
});

const sourceMaterializationReceiptPosture =
  (): LocalV0SourceMaterializationReceiptPostureShape => ({
    contract_only: true,
    deterministic: true,
    local_only: true,
    allowlisted_source_catalog: true,
    direct_agent_repo_file_access_allowed_now: false,
    live_source_read_performed: false,
    arbitrary_file_read_allowed_now: false,
    user_selected_path_read_allowed_now: false,
    directory_traversal_allowed_now: false,
    runtime_permission_granted: false,
    actual_contour_execution_allowed_now: false
  });

const createBoundedContextPackageEnvelope = (
  request: AgentContextRequestBoundaryShape,
  adapter_result: LocalDeterministicContextSourceAdapterResultShape
): BoundedContextPackageEnvelopeShape => ({
  bounded_context_package_id: `${request.agent_context_request_id}:local-deterministic-bounded-context-package`,
  package_version: "bounded-context-package-envelope/v1",
  agent_context_request_id: request.agent_context_request_id,
  adapter_result_id: adapter_result.adapter_result_id,
  package_boundary: "contract_only_bounded_context_package",
  authority: request.authority,
  execution_posture: boundedPackageExecutionPosture(),
  package_items: adapter_result.source_items.map((item) => ({
    package_item_id: `${request.agent_context_request_id}:bounded-context-package-item:${item.deterministic_order}`,
    source_item_id: item.source_item_id,
    source_ref: item.source_ref,
    source_kind: item.source_kind,
    deterministic_order: item.deterministic_order,
    content_digest: item.content_digest,
    provenance_ref: item.provenance_ref,
    permission_ref: item.permission_ref,
    audit_ref: item.audit_ref
  })),
  source_item_count: adapter_result.source_items.length,
  provenance_envelope_ref: adapter_result.provenance_envelope_ref,
  permission_envelope_ref: adapter_result.permission_envelope_ref,
  audit_envelope_ref: adapter_result.audit_envelope_ref,
  generated_at: adapter_result.generated_at,
  ...(request.correlation_id ? { correlation_id: request.correlation_id } : {})
});

const createLocalV0SourceMaterializationReceipt = (
  request: AgentContextRequestBoundaryShape,
  adapter_result: LocalDeterministicContextSourceAdapterResultShape
): LocalV0SourceMaterializationReceiptShape => ({
  receipt_id: `${request.agent_context_request_id}:local-v0-source-materialization-receipt`,
  receipt_version: "local-v0-source-materialization-receipt/v1",
  agent_context_request_id: request.agent_context_request_id,
  adapter_result_id: adapter_result.adapter_result_id,
  source_catalog_ref: "local-v0-source-catalog/v1",
  materialization_boundary: adapter_result.materialization_boundary,
  requested_scope_ids: request.intent.requested_scope_hints,
  selected_scope_ids: adapter_result.source_items.map((item) => item.scope_id),
  selected_source_refs: adapter_result.source_items.map((item) => item.source_ref),
  selected_source_item_count: adapter_result.source_items.length,
  receipt_items: adapter_result.source_items.map((item) => ({
    receipt_item_id: `${request.agent_context_request_id}:local-v0-source-materialization-receipt-item:${item.deterministic_order}`,
    source_item_id: item.source_item_id,
    scope_id: item.scope_id,
    source_ref: item.source_ref,
    source_kind: item.source_kind,
    deterministic_order: item.deterministic_order,
    content_digest: item.content_digest,
    provenance_ref: item.provenance_ref,
    permission_ref: item.permission_ref,
    audit_ref: item.audit_ref
  })),
  provenance_envelope_ref: adapter_result.provenance_envelope_ref,
  permission_envelope_ref: adapter_result.permission_envelope_ref,
  audit_envelope_ref: adapter_result.audit_envelope_ref,
  execution_posture: sourceMaterializationReceiptPosture(),
  generated_at: adapter_result.generated_at,
  ...(request.correlation_id ? { correlation_id: request.correlation_id } : {})
});

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

    createBoundedContextPackageEnvelope(
      request,
      adapter_result
    ): BoundedContextPackageEnvelopeShape {
      return createBoundedContextPackageEnvelope(request, adapter_result);
    },

    materializeResponse(
      input: LocalDeterministicBoundedContextMaterializationInputShape
    ): BoundedContextResponseEnvelopeShape {
      const { request, adapter_result } = input;
      const packageEnvelope =
        input.package_envelope ?? createBoundedContextPackageEnvelope(request, adapter_result);
      const sourceMaterializationReceipt = createLocalV0SourceMaterializationReceipt(
        request,
        adapter_result
      );

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
          packageEnvelope.bounded_context_package_id,
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
          bounded_context_package: packageEnvelope,
          source_materialization_receipt: sourceMaterializationReceipt,
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
