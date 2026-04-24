import type { IsoDateTimeString, OperationalContour } from "@orchestrator/core-foundation";
import {
  createExecutionAttemptLifecycleLinkageBuilder,
  type SurfaceResponseStatus
} from "@orchestrator/integration-contracts";
import {
  createExecutionAttemptLifecycleOutcomeAuditLinkageBuilder,
  createExecutionAttemptLifecycleTraceBuilder,
  createExecutionAttemptTransitionTraceBuilder
} from "@orchestrator/audit-eval";
import type {
  DeliveryRuntimeExecutionAttemptWarningShape,
  ExecutionAttemptAuthorityContextPlaceholderShape,
  ExecutionAttemptLifecycleInputShape,
  ExecutionAttemptLifecycleShape,
  ExecutionAttemptLifecycleSummaryShape,
  ExecutionAttemptReadinessExpectationShape,
  ExecutionAttemptStateContractShape,
  ExecutionAttemptTransitionContractShape
} from "./delivery-runtime-execution-attempt-lifecycle-types.js";
import {
  DELIVERY_RUNTIME_EXECUTION_ATTEMPT_ALLOWED_TRANSITIONS,
  DELIVERY_RUNTIME_EXECUTION_ATTEMPT_STATE_TO_RESULT_FAMILY,
  type DeliveryRuntimeExecutionAttemptFamily,
  type DeliveryRuntimeExecutionAttemptState,
  type DeliveryRuntimeExecutionAttemptTransitionExpectation
} from "./delivery-runtime-execution-attempt-lifecycle-vocabularies.js";
import type { DeliveryRuntimeHandoffShape } from "./delivery-runtime-handoff-types.js";

const toAttemptFamily = (runtimeHandoff: DeliveryRuntimeHandoffShape): DeliveryRuntimeExecutionAttemptFamily => {
  if (runtimeHandoff.runtime_handoff_family === "read_path_runtime_handoff") return "read_path_execution_attempt";
  if (runtimeHandoff.runtime_handoff_family === "pack_loop_runtime_handoff") return "pack_loop_execution_attempt";
  if (runtimeHandoff.runtime_handoff_family === "write_path_runtime_handoff") return "write_path_execution_attempt";
  if (runtimeHandoff.runtime_handoff_family === "handoff_runtime_handoff") return "handoff_execution_attempt";
  return "unknown_execution_attempt";
};

const toContourTarget = (attemptFamily: DeliveryRuntimeExecutionAttemptFamily): OperationalContour | "unknown" => {
  if (attemptFamily === "read_path_execution_attempt") return "read_path";
  if (attemptFamily === "pack_loop_execution_attempt") return "pack_loop";
  if (attemptFamily === "write_path_execution_attempt") return "write_path";
  if (attemptFamily === "handoff_execution_attempt") return "handoff";
  return "unknown";
};

const toInitialState = (runtimeHandoff: DeliveryRuntimeHandoffShape): DeliveryRuntimeExecutionAttemptState => {
  if (runtimeHandoff.handoff_status === "ready_to_handoff") return "queued";
  if (runtimeHandoff.handoff_status === "blocked") return "blocked";
  if (runtimeHandoff.handoff_status === "deferred") return "deferred";
  if (runtimeHandoff.handoff_status === "unavailable" || runtimeHandoff.handoff_status === "unsupported") {
    return "not_dispatchable";
  }
  return "queued";
};

const toReadinessExpectation = (
  state: DeliveryRuntimeExecutionAttemptState,
  runtimeHandoff: DeliveryRuntimeHandoffShape
): ExecutionAttemptReadinessExpectationShape => {
  if (state === "prepared") {
    return {
      readiness: "ready_for_future_runtime",
      handler_invocation_allowed_now: false,
      transport_delivery_allowed_now: false,
      provider_sdk_call_allowed_now: false,
      canonical_context_access_allowed_now: false,
      canonical_writeback_allowed_now: false,
      reason: "attempt is prepared as a contract only; future runtime may inspect it but no handler invocation is allowed now"
    };
  }

  if (state === "queued" && runtimeHandoff.handoff_status === "ready_to_handoff") {
    return {
      readiness: "requires_future_review",
      handler_invocation_allowed_now: false,
      transport_delivery_allowed_now: false,
      provider_sdk_call_allowed_now: false,
      canonical_context_access_allowed_now: false,
      canonical_writeback_allowed_now: false,
      reason: "attempt is queued over a ready handoff placeholder and still requires future runtime review"
    };
  }

  return {
    readiness: "not_ready_for_future_runtime",
    handler_invocation_allowed_now: false,
    transport_delivery_allowed_now: false,
    provider_sdk_call_allowed_now: false,
    canonical_context_access_allowed_now: false,
    canonical_writeback_allowed_now: false,
    reason: "attempt lifecycle state does not permit runtime progression"
  };
};

const toSurfaceStatus = (state: DeliveryRuntimeExecutionAttemptState): SurfaceResponseStatus => {
  if (state === "prepared") return "success";
  if (state === "queued" || state === "deferred") return "accepted";
  if (state === "blocked" || state === "not_dispatchable") return "rejected";
  return "error";
};

const buildWarnings = (input: {
  attemptFamily: DeliveryRuntimeExecutionAttemptFamily;
  state: DeliveryRuntimeExecutionAttemptState;
  runtimeHandoff: DeliveryRuntimeHandoffShape;
  authorityContext: ExecutionAttemptAuthorityContextPlaceholderShape;
}): DeliveryRuntimeExecutionAttemptWarningShape[] => {
  return [
    ...(input.attemptFamily === "unknown_execution_attempt"
      ? [{ code: "attempt_family_ambiguous", message: "execution attempt family resolved to unknown_execution_attempt" } as const]
      : []),
    ...(input.runtimeHandoff.handoff_status !== "ready_to_handoff"
      ? [
          {
            code: "attempt_started_from_non_ready_handoff",
            message: "execution attempt lifecycle was derived from a non-ready runtime handoff placeholder"
          } as const
        ]
      : []),
    ...(input.state === "not_dispatchable"
      ? [{ code: "attempt_not_dispatchable", message: "execution attempt is contractually not dispatchable" } as const]
      : []),
    {
      code: "attempt_runtime_boundary_only",
      message: "execution attempt lifecycle is contract-only and does not invoke handlers or transport"
    },
    {
      code: "attempt_authority_context_placeholder_only",
      message: `authority context placeholder is shape-only (${input.authorityContext.control_plane_boundary})`
    },
    {
      code: "attempt_provenance_context_placeholder_only",
      message: "provenance context is carried only as an optional reference placeholder"
    },
    {
      code: "attempt_delegation_context_placeholder_only",
      message: "delegation context is carried only as an optional reference placeholder"
    },
    { code: "attempt_runtime_surface_lifecycle_envelope_emitted", message: "runtime-surface lifecycle envelope emitted" },
    { code: "attempt_integration_lifecycle_linkage_emitted", message: "integration lifecycle linkage emitted" },
    { code: "attempt_audit_lifecycle_linkage_emitted", message: "audit/eval lifecycle linkage emitted" }
  ];
};

const transitionExpectation = (input: {
  from: DeliveryRuntimeExecutionAttemptState;
  to: DeliveryRuntimeExecutionAttemptState;
}): DeliveryRuntimeExecutionAttemptTransitionExpectation => {
  const allowed = DELIVERY_RUNTIME_EXECUTION_ATTEMPT_ALLOWED_TRANSITIONS[input.from].includes(input.to);
  if (!allowed) return "invalid_contract_transition";
  if (input.to === "blocked") return "blocked_contract_transition";
  if (input.to === "deferred") return "deferred_contract_transition";
  if (["aborted", "expired", "cancelled", "not_dispatchable"].includes(input.to)) return "terminal_contract_transition";
  return "allowed_contract_transition";
};

const createTransition = (input: {
  attemptId: string;
  from: DeliveryRuntimeExecutionAttemptState;
  to: DeliveryRuntimeExecutionAttemptState;
  now: IsoDateTimeString;
}): ExecutionAttemptTransitionContractShape => {
  const expectation = transitionExpectation({ from: input.from, to: input.to });
  const valid = expectation !== "invalid_contract_transition";
  return {
    transition_id: `${input.attemptId}:transition:${input.from}:to:${input.to}`,
    attempt_id: input.attemptId,
    from_state: input.from,
    to_state: input.to,
    transition_expectation: expectation,
    valid_transition: valid,
    transition_reason: valid
      ? "contractual lifecycle transition is allowed without runtime execution"
      : "contractual lifecycle transition is invalid and must not be interpreted as execution",
    warnings: valid
      ? []
      : [{ code: "attempt_transition_invalid", message: `transition from ${input.from} to ${input.to} is not contractually allowed` }],
    transitioned_at: input.now
  };
};

const createStateContract = (input: {
  state: DeliveryRuntimeExecutionAttemptState;
  reason: string;
  payload: Record<string, unknown>;
}): ExecutionAttemptStateContractShape => {
  return {
    state: input.state,
    reason: input.reason,
    terminal: ["aborted", "expired", "cancelled", "not_dispatchable"].includes(input.state),
    payload: input.payload
  };
};

export interface ExecutionAttemptLifecycleBuilder {
  create(input: ExecutionAttemptLifecycleInputShape): ExecutionAttemptLifecycleShape;
}

export interface ExecutionAttemptLifecycleSummaryBuilder {
  summarize(input: { attempts: ExecutionAttemptLifecycleShape[] }): ExecutionAttemptLifecycleSummaryShape;
}

export const createExecutionAttemptLifecycleBuilder = (): ExecutionAttemptLifecycleBuilder => {
  const integrationBuilder = createExecutionAttemptLifecycleLinkageBuilder();
  const lifecycleTraceBuilder = createExecutionAttemptLifecycleTraceBuilder();
  const outcomeAuditBuilder = createExecutionAttemptLifecycleOutcomeAuditLinkageBuilder();
  const transitionTraceBuilder = createExecutionAttemptTransitionTraceBuilder();

  return {
    create(input: ExecutionAttemptLifecycleInputShape): ExecutionAttemptLifecycleShape {
      const now = input.now ?? ((new Date().toISOString() as unknown) as IsoDateTimeString);
      const runtimeHandoff = input.runtime_handoff;
      const attemptFamily = toAttemptFamily(runtimeHandoff);
      const contourTarget = toContourTarget(attemptFamily);
      const lifecycleState = input.requested_initial_state ?? toInitialState(runtimeHandoff);
      const resultFamily = DELIVERY_RUNTIME_EXECUTION_ATTEMPT_STATE_TO_RESULT_FAMILY[lifecycleState];
      const attemptId = `${runtimeHandoff.runtime_handoff_id}:execution-attempt`;
      const authorityContext: ExecutionAttemptAuthorityContextPlaceholderShape = {
        ...(input.authority_context_placeholder?.authority_context_id
          ? { authority_context_id: input.authority_context_placeholder.authority_context_id }
          : {}),
        ...(input.authority_context_placeholder?.subject_identity_ref
          ? { subject_identity_ref: input.authority_context_placeholder.subject_identity_ref }
          : {}),
        ...(input.authority_context_placeholder?.delegated_authority_ref
          ? { delegated_authority_ref: input.authority_context_placeholder.delegated_authority_ref }
          : {}),
        ...(input.authority_context_placeholder?.provenance_chain_ref
          ? { provenance_chain_ref: input.authority_context_placeholder.provenance_chain_ref }
          : {}),
        control_plane_boundary: "gateway_control_plane_authority",
        runtime_boundary: "delivery_runtime_no_direct_context_authority",
        notes: input.authority_context_placeholder?.notes ?? [
          "identity, delegation, and provenance are carried as references only",
          "this lifecycle contract does not implement auth, IAM, policy engine, or direct canonical context access"
        ]
      };
      const warnings = buildWarnings({ attemptFamily, state: lifecycleState, runtimeHandoff, authorityContext });
      const payload: Record<string, unknown> = {
        attempt_id: attemptId,
        runtime_handoff_id: runtimeHandoff.runtime_handoff_id,
        precheck_id: runtimeHandoff.precheck_id,
        dispatch_intent_id: runtimeHandoff.dispatch_intent_id,
        runtime_handoff_status: runtimeHandoff.handoff_status,
        lifecycle_state: lifecycleState,
        result_family: resultFamily,
        attempt_family: attemptFamily,
        contour_target: contourTarget
      };
      const stateContract = createStateContract({
        state: lifecycleState,
        reason: "execution-attempt lifecycle contract derived from delivery-runtime handoff placeholder",
        payload
      });
      const transitionContracts = DELIVERY_RUNTIME_EXECUTION_ATTEMPT_ALLOWED_TRANSITIONS[lifecycleState].map((to) =>
        createTransition({ attemptId, from: lifecycleState, to, now })
      );
      const readinessExpectation = toReadinessExpectation(lifecycleState, runtimeHandoff);
      const futureRuntimeBoundary = {
        future_handler_runtime_linkage_id: `${attemptId}:future-handler-runtime-boundary`,
        runtime_handoff_id: runtimeHandoff.runtime_handoff_id,
        attempt_id: attemptId,
        boundary_status: "contract_only_future_runtime_boundary" as const,
        allowed_now: {
          lifecycle_contract_mapping: true as const,
          transition_contract_mapping: true as const,
          runtime_surface_envelope_emission: true as const,
          integration_linkage_emission: true as const,
          audit_eval_linkage_emission: true as const
        },
        disallowed_now: {
          handler_invocation: true as const,
          transport_delivery: true as const,
          provider_sdk_execution: true as const,
          concrete_persistence_write: true as const,
          canonical_context_direct_access: true as const,
          canonical_context_direct_writeback: true as const
        }
      };
      const runtimeSurfaceEnvelope = {
        attempt_id: attemptId,
        request_id: runtimeHandoff.request_id,
        operation_id: runtimeHandoff.operation_id,
        precheck_id: runtimeHandoff.precheck_id,
        dispatch_intent_id: runtimeHandoff.dispatch_intent_id,
        runtime_handoff_id: runtimeHandoff.runtime_handoff_id,
        attempt_family: attemptFamily,
        contour_target: contourTarget,
        lifecycle_state: lifecycleState,
        result_family: resultFamily,
        runtime_handoff_status: runtimeHandoff.handoff_status,
        runtime_target_family: runtimeHandoff.runtime_target_expectation.target_family,
        readiness_expectation: readinessExpectation.readiness,
        future_runtime_boundary: {
          handler_invocation_allowed_now: false as const,
          transport_delivery_allowed_now: false as const,
          provider_sdk_call_allowed_now: false as const,
          canonical_context_access_allowed_now: false as const,
          canonical_writeback_allowed_now: false as const
        },
        authority_context_placeholder: {
          ...(authorityContext.authority_context_id ? { authority_context_id: authorityContext.authority_context_id } : {}),
          ...(authorityContext.subject_identity_ref ? { subject_identity_ref: authorityContext.subject_identity_ref } : {}),
          ...(authorityContext.delegated_authority_ref ? { delegated_authority_ref: authorityContext.delegated_authority_ref } : {}),
          ...(authorityContext.provenance_chain_ref ? { provenance_chain_ref: authorityContext.provenance_chain_ref } : {}),
          control_plane_boundary: authorityContext.control_plane_boundary,
          runtime_boundary: authorityContext.runtime_boundary
        },
        transition_expectations: transitionContracts.map((transition) => ({
          transition_id: transition.transition_id,
          attempt_id: transition.attempt_id,
          from_state: transition.from_state,
          to_state: transition.to_state,
          transition_expectation: transition.transition_expectation,
          transition_reason: transition.transition_reason,
          warnings: transition.warnings,
          transitioned_at: transition.transitioned_at
        })),
        warnings,
        emitted_at: now
      };
      const surfaceStatus = toSurfaceStatus(lifecycleState);
      const integrationLifecycleLinkage = integrationBuilder.build({
        linkage_id: `${attemptId}:integration-lifecycle-linkage`,
        request_id: runtimeHandoff.request_id,
        operation_id: runtimeHandoff.operation_id,
        precheck_id: runtimeHandoff.precheck_id,
        dispatch_intent_id: runtimeHandoff.dispatch_intent_id,
        runtime_handoff_id: runtimeHandoff.runtime_handoff_id,
        attempt_id: attemptId,
        attempt_family: attemptFamily,
        contour_target: contourTarget,
        lifecycle_state: lifecycleState,
        result_family: resultFamily,
        integration_response_status: surfaceStatus,
        canonical_response: {
          request_id: runtimeHandoff.request_id,
          operation_id: runtimeHandoff.operation_id,
          status: surfaceStatus,
          result: payload,
          warnings,
          served_at: now
        },
        typed_surface_response: {
          envelope: {
            request_id: runtimeHandoff.request_id,
            operation_id: runtimeHandoff.operation_id,
            status: surfaceStatus,
            result: payload,
            warnings,
            served_at: now
          }
        },
        warnings,
        now
      });
      const transitionTraces = transitionContracts.map((transition) =>
        transitionTraceBuilder.build({
          transition_trace_id: `${transition.transition_id}:trace`,
          attempt_id: transition.attempt_id,
          from_state: transition.from_state,
          to_state: transition.to_state,
          transition_expectation: transition.transition_expectation,
          valid_transition: transition.valid_transition,
          warnings: transition.warnings,
          now
        })
      );
      const lifecycleTrace = lifecycleTraceBuilder.build({
        trace_id: `${attemptId}:lifecycle-trace`,
        request_id: runtimeHandoff.request_id,
        operation_id: runtimeHandoff.operation_id,
        precheck_id: runtimeHandoff.precheck_id,
        dispatch_intent_id: runtimeHandoff.dispatch_intent_id,
        runtime_handoff_id: runtimeHandoff.runtime_handoff_id,
        attempt_id: attemptId,
        attempt_family: attemptFamily,
        contour_target: contourTarget,
        lifecycle_state: lifecycleState,
        result_family: resultFamily,
        transition_ids: transitionContracts.map((transition) => transition.transition_id),
        warnings,
        now
      });
      const outcomeAuditLinkage = outcomeAuditBuilder.build({
        linkage_id: `${attemptId}:outcome-audit-linkage`,
        request_id: runtimeHandoff.request_id,
        operation_id: runtimeHandoff.operation_id,
        runtime_handoff_id: runtimeHandoff.runtime_handoff_id,
        attempt_id: attemptId,
        lifecycle_state: lifecycleState,
        result_family: resultFamily,
        ...(input.linked_audit_id ? { linked_audit_id: input.linked_audit_id } : {}),
        warnings,
        now
      });

      return {
        attempt_id: attemptId,
        request_id: runtimeHandoff.request_id,
        operation_id: runtimeHandoff.operation_id,
        precheck_id: runtimeHandoff.precheck_id,
        dispatch_intent_id: runtimeHandoff.dispatch_intent_id,
        runtime_handoff_id: runtimeHandoff.runtime_handoff_id,
        attempt_family: attemptFamily,
        contour_target: contourTarget,
        lifecycle_state: lifecycleState,
        result_family: resultFamily,
        runtime_handoff_status: runtimeHandoff.handoff_status,
        runtime_target_family: runtimeHandoff.runtime_target_expectation.target_family,
        authority_context_placeholder: authorityContext,
        readiness_expectation: readinessExpectation,
        state_contract: stateContract,
        transition_contracts: transitionContracts,
        future_runtime_boundary: futureRuntimeBoundary,
        runtime_surface_lifecycle_envelope: runtimeSurfaceEnvelope,
        integration_lifecycle_linkage: integrationLifecycleLinkage,
        lifecycle_trace: lifecycleTrace,
        outcome_audit_linkage: outcomeAuditLinkage,
        transition_traces: transitionTraces,
        inherited_runtime_handoff_warnings: runtimeHandoff.warnings,
        warnings,
        created_at: now
      };
    }
  };
};

export const createExecutionAttemptLifecycleSummaryBuilder = (): ExecutionAttemptLifecycleSummaryBuilder => {
  return {
    summarize(input: { attempts: ExecutionAttemptLifecycleShape[] }): ExecutionAttemptLifecycleSummaryShape {
      return {
        total: input.attempts.length,
        queued: input.attempts.filter((item) => item.lifecycle_state === "queued").length,
        prepared: input.attempts.filter((item) => item.lifecycle_state === "prepared").length,
        blocked: input.attempts.filter((item) => item.lifecycle_state === "blocked").length,
        deferred: input.attempts.filter((item) => item.lifecycle_state === "deferred").length,
        aborted: input.attempts.filter((item) => item.lifecycle_state === "aborted").length,
        expired: input.attempts.filter((item) => item.lifecycle_state === "expired").length,
        cancelled: input.attempts.filter((item) => item.lifecycle_state === "cancelled").length,
        not_dispatchable: input.attempts.filter((item) => item.lifecycle_state === "not_dispatchable").length,
        by_attempt_family: {
          read_path_execution_attempt: input.attempts.filter((item) => item.attempt_family === "read_path_execution_attempt").length,
          pack_loop_execution_attempt: input.attempts.filter((item) => item.attempt_family === "pack_loop_execution_attempt").length,
          write_path_execution_attempt: input.attempts.filter((item) => item.attempt_family === "write_path_execution_attempt").length,
          handoff_execution_attempt: input.attempts.filter((item) => item.attempt_family === "handoff_execution_attempt").length,
          unknown_execution_attempt: input.attempts.filter((item) => item.attempt_family === "unknown_execution_attempt").length
        },
        warnings: input.attempts.flatMap((item) => item.warnings)
      };
    }
  };
};
