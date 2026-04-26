import type {
  RuntimeAdjacentHandlerBoundaryBuilder,
  RuntimeAdjacentHandlerBoundaryBuilderInputShape,
  RuntimeAdjacentHandlerBoundaryDenialFlagsShape,
  RuntimeAdjacentHandlerBoundaryReadinessShape,
  RuntimeAdjacentHandlerBoundaryShape,
  RuntimeAdjacentHandlerBoundarySummaryShape,
  RuntimeAdjacentHandlerBoundaryWarningShape
} from "./runtime-adjacent-handler-boundary-types.js";
import type {
  RuntimeAdjacentHandlerBoundaryDenialReason,
  RuntimeAdjacentHandlerBoundaryStatus
} from "./runtime-adjacent-handler-boundary-vocabularies.js";

const defaultDenialFlags = (): RuntimeAdjacentHandlerBoundaryDenialFlagsShape => ({
  handler_invocation_allowed_now: false,
  handler_execution_allowed_now: false,
  runtime_dispatch_allowed_now: false,
  provider_sdk_call_allowed_now: false,
  transport_execution_allowed_now: false,
  concrete_persistence_write_allowed_now: false,
  direct_canonical_context_access_allowed_now: false,
  direct_canonical_writeback_allowed_now: false,
  actual_contour_execution_allowed_now: false,
  runtime_permission_granted: false,
  real_model_call_allowed_now: false,
  real_storage_write_allowed_now: false
});

const defaultDenialReasons = (
  status: RuntimeAdjacentHandlerBoundaryStatus
): RuntimeAdjacentHandlerBoundaryDenialReason[] => [
  "runtime_handler_boundary_contract_only",
  "handler_invocation_denied_by_default",
  "handler_execution_denied_by_default",
  "runtime_dispatch_denied_by_default",
  "provider_sdk_call_denied_by_default",
  "transport_execution_denied_by_default",
  "concrete_persistence_write_denied_by_default",
  "direct_canonical_context_access_denied_by_default",
  "direct_canonical_writeback_denied_by_default",
  "actual_contour_execution_denied_by_default",
  "runtime_permission_denied_by_default",
  "source_invocation_denial_proof_required",
  ...(status === "handler_boundary_not_permitted" ? ["unknown_contour_target_not_permitted" as const] : [])
];

const defaultWarnings = (): RuntimeAdjacentHandlerBoundaryWarningShape[] => [
  {
    code: "runtime_adjacent_not_runtime_execution",
    message: "Handler boundary is runtime-adjacent contract shape only; no runtime execution is performed."
  },
  {
    code: "handler_boundary_not_handler_invocation",
    message: "Handler boundary does not invoke a handler."
  },
  {
    code: "runtime_permission_still_denied",
    message: "Runtime permission remains denied by default."
  },
  {
    code: "provider_sdk_call_still_denied",
    message: "Provider SDK calls remain denied by default."
  },
  {
    code: "transport_execution_still_denied",
    message: "Transport execution remains denied by default."
  },
  {
    code: "concrete_persistence_write_still_denied",
    message: "Concrete persistence writes remain denied by default."
  },
  {
    code: "canonical_context_access_still_denied",
    message: "Direct canonical context access remains denied by default."
  },
  {
    code: "canonical_writeback_still_denied",
    message: "Direct canonical writeback remains denied by default."
  },
  {
    code: "authority_context_placeholder_only",
    message: "Authority, identity, and delegation are preserved as placeholder references only."
  },
  {
    code: "provenance_context_placeholder_only",
    message: "Provenance is preserved as a placeholder reference only."
  },
  {
    code: "source_invocation_denial_proof_reference_only",
    message: "Source invocation denial proof is referenced only and does not grant runtime permission."
  }
];

const defaultGuardrails = (): string[] => [
  "This boundary is closer to runtime than invocation denial proof but is still non-executable.",
  "Actual handler invocation is denied by default.",
  "Runtime dispatch is denied by default.",
  "Provider SDK calls, transport execution, concrete persistence, model calls, and storage writes are denied by default.",
  "Authority, identity, delegation, and provenance remain shape-level references only.",
  "This boundary is not runtime permission and not evidence of actual contour execution."
];

const buildReadiness = (input: {
  handler_boundary_id: string;
  source_invocation_denial_proof_id: string;
  source_contour_target: RuntimeAdjacentHandlerBoundaryShape["source"]["source_contour_target"];
  boundary_status: RuntimeAdjacentHandlerBoundaryStatus;
  denial_reasons: RuntimeAdjacentHandlerBoundaryDenialReason[];
}): RuntimeAdjacentHandlerBoundaryReadinessShape => ({
  handler_boundary_readiness_id: `${input.handler_boundary_id}:readiness`,
  handler_boundary_id: input.handler_boundary_id,
  source_invocation_denial_proof_id: input.source_invocation_denial_proof_id,
  source_contour_target: input.source_contour_target,
  boundary_status: input.boundary_status,
  readiness_status:
    input.boundary_status === "handler_boundary_candidate"
      ? "candidate_for_future_handler_runtime"
      : "not_ready_for_future_handler_runtime",
  handler_invocation_allowed_now: false,
  handler_execution_allowed_now: false,
  runtime_dispatch_allowed_now: false,
  runtime_permission_granted: false,
  denial_reasons: input.denial_reasons,
  notes: [
    "Readiness is runtime-adjacent only and does not permit handler invocation.",
    "Future runtime handoff remains explicitly denied in this boundary."
  ]
});

const resolveBoundaryStatus = (input: RuntimeAdjacentHandlerBoundaryBuilderInputShape): RuntimeAdjacentHandlerBoundaryStatus => {
  if (input.boundary_status) {
    return input.boundary_status;
  }

  return input.source.source_contour_target === "unknown"
    ? "handler_boundary_not_permitted"
    : "handler_boundary_candidate";
};

export const createRuntimeAdjacentHandlerBoundaryBuilder = (): RuntimeAdjacentHandlerBoundaryBuilder => ({
  create(input: RuntimeAdjacentHandlerBoundaryBuilderInputShape): RuntimeAdjacentHandlerBoundaryShape {
    const boundaryStatus = resolveBoundaryStatus(input);
    const denialReasons = input.denial_reasons ?? defaultDenialReasons(boundaryStatus);
    const guardrails = input.guardrail_notes ?? defaultGuardrails();
    const warnings = input.warnings ?? defaultWarnings();

    return {
      handler_boundary_id: input.handler_boundary_id,
      request_id: input.request_id,
      operation_id: input.operation_id,
      source: input.source,
      authority_context_placeholder: input.authority_context_placeholder,
      boundary_status: boundaryStatus,
      runtime_adjacent: true,
      runtime_handler_boundary: true,
      handler_execution_allowed_now: false,
      runtime_permission_granted: false,
      actual_contour_execution_allowed_now: false,
      handler_boundary_intent: {
        handler_boundary_intent_id: `${input.handler_boundary_id}:intent`,
        handler_boundary_id: input.handler_boundary_id,
        source_invocation_denial_proof_id: input.source.source_invocation_denial_proof_id,
        source_contour_target: input.source.source_contour_target,
        intent_status: "handler_boundary_intent_recorded",
        intent_boundary: "runtime_adjacent_handler_boundary_contract_only",
        runtime_adjacent: true,
        runtime_handler_boundary: true,
        handler_execution_allowed_now: false,
        runtime_permission_granted: false,
        notes: guardrails
      },
      handler_boundary_readiness: buildReadiness({
        handler_boundary_id: input.handler_boundary_id,
        source_invocation_denial_proof_id: input.source.source_invocation_denial_proof_id,
        source_contour_target: input.source.source_contour_target,
        boundary_status: boundaryStatus,
        denial_reasons: denialReasons
      }),
      denial_flags: defaultDenialFlags(),
      denial_reasons: denialReasons,
      warnings,
      guardrail_notes: guardrails,
      created_at: input.created_at
    };
  },

  summarize(input: RuntimeAdjacentHandlerBoundaryShape): RuntimeAdjacentHandlerBoundarySummaryShape {
    return {
      handler_boundary_id: input.handler_boundary_id,
      source_invocation_seam_id: input.source.source_invocation_seam_id,
      source_invocation_denial_proof_id: input.source.source_invocation_denial_proof_id,
      source_contour_target: input.source.source_contour_target,
      boundary_status: input.boundary_status,
      runtime_adjacent: true,
      runtime_handler_boundary: true,
      handler_execution_allowed_now: false,
      runtime_permission_granted: false,
      actual_contour_execution_allowed_now: false,
      denial_flags_all_false: true,
      guardrail_notes: input.guardrail_notes
    };
  }
});
