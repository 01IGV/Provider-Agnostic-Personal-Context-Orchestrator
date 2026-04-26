import type { IsoDateTimeString } from "@orchestrator/core-foundation";
import type { RuntimeAdjacentHandlerBoundaryShape } from "@orchestrator/runtime-surface";
import {
  createDeterministicFirstRuntimeAdjacentHandlerBoundary
} from "./first-runtime-adjacent-handler-boundary.js";
import type {
  HandlerBoundaryDenialProofAuthorityContextPlaceholderShape,
  HandlerBoundaryDenialProofBuilder,
  HandlerBoundaryDenialProofDenialAssertionsShape,
  HandlerBoundaryDenialProofFailureCode,
  HandlerBoundaryDenialProofFailureShape,
  HandlerBoundaryDenialProofInputShape,
  HandlerBoundaryDenialProofIntentAssertionsShape,
  HandlerBoundaryDenialProofReadinessAssertionsShape,
  HandlerBoundaryDenialProofSummaryShape,
  HandlerBoundaryDenialProofVerificationSummaryShape
} from "./handler-boundary-denial-proof-integration-types.js";

const DEFAULT_HANDLER_BOUNDARY_DENIAL_PROOF_TIME = "2026-04-24T00:00:00.000Z" as IsoDateTimeString;

const proofIdForBoundary = (boundary: RuntimeAdjacentHandlerBoundaryShape): string =>
  `${boundary.handler_boundary_id}:handler-boundary-denial-proof`;

const carryAuthorityContext = (
  source: RuntimeAdjacentHandlerBoundaryShape["authority_context_placeholder"]
): HandlerBoundaryDenialProofAuthorityContextPlaceholderShape => ({
  ...(source.authority_context_id ? { authority_context_id: source.authority_context_id } : {}),
  ...(source.subject_identity_ref ? { subject_identity_ref: source.subject_identity_ref } : {}),
  ...(source.delegated_authority_ref ? { delegated_authority_ref: source.delegated_authority_ref } : {}),
  ...(source.provenance_chain_ref ? { provenance_chain_ref: source.provenance_chain_ref } : {}),
  control_plane_boundary: source.control_plane_boundary,
  runtime_boundary: source.runtime_boundary
});

const denialAssertionsFromBoundary = (
  boundary: RuntimeAdjacentHandlerBoundaryShape
): HandlerBoundaryDenialProofDenialAssertionsShape => ({
  handler_invocation_allowed_now: boundary.denial_flags.handler_invocation_allowed_now,
  handler_execution_allowed_now: boundary.denial_flags.handler_execution_allowed_now,
  runtime_dispatch_allowed_now: boundary.denial_flags.runtime_dispatch_allowed_now,
  provider_sdk_call_allowed_now: boundary.denial_flags.provider_sdk_call_allowed_now,
  transport_execution_allowed_now: boundary.denial_flags.transport_execution_allowed_now,
  concrete_persistence_write_allowed_now: boundary.denial_flags.concrete_persistence_write_allowed_now,
  direct_canonical_context_access_allowed_now: boundary.denial_flags.direct_canonical_context_access_allowed_now,
  direct_canonical_writeback_allowed_now: boundary.denial_flags.direct_canonical_writeback_allowed_now,
  actual_contour_execution_allowed_now: boundary.denial_flags.actual_contour_execution_allowed_now,
  runtime_permission_granted: boundary.denial_flags.runtime_permission_granted,
  real_model_call_allowed_now: boundary.denial_flags.real_model_call_allowed_now,
  real_storage_write_allowed_now: boundary.denial_flags.real_storage_write_allowed_now
});

const readinessAssertionsFromBoundary = (
  boundary: RuntimeAdjacentHandlerBoundaryShape
): HandlerBoundaryDenialProofReadinessAssertionsShape => ({
  handler_boundary_readiness_id: boundary.handler_boundary_readiness.handler_boundary_readiness_id,
  readiness_status: boundary.handler_boundary_readiness.readiness_status,
  handler_invocation_allowed_now: boundary.handler_boundary_readiness.handler_invocation_allowed_now,
  handler_execution_allowed_now: boundary.handler_boundary_readiness.handler_execution_allowed_now,
  runtime_dispatch_allowed_now: boundary.handler_boundary_readiness.runtime_dispatch_allowed_now,
  runtime_permission_granted: boundary.handler_boundary_readiness.runtime_permission_granted
});

const intentAssertionsFromBoundary = (
  boundary: RuntimeAdjacentHandlerBoundaryShape
): HandlerBoundaryDenialProofIntentAssertionsShape => ({
  handler_boundary_intent_id: boundary.handler_boundary_intent.handler_boundary_intent_id,
  intent_status: boundary.handler_boundary_intent.intent_status,
  runtime_adjacent: boundary.handler_boundary_intent.runtime_adjacent,
  runtime_handler_boundary: boundary.handler_boundary_intent.runtime_handler_boundary,
  handler_execution_allowed_now: boundary.handler_boundary_intent.handler_execution_allowed_now,
  runtime_permission_granted: boundary.handler_boundary_intent.runtime_permission_granted
});

const createFailure = (input: {
  code: HandlerBoundaryDenialProofFailureCode;
  path: string;
  expected: true | false;
  actual: unknown;
  message: string;
}): HandlerBoundaryDenialProofFailureShape => ({
  code: input.code,
  path: input.path,
  expected: input.expected,
  actual: input.actual,
  message: input.message
});

const findFailuresFromSummary = (
  summary: HandlerBoundaryDenialProofSummaryShape
): HandlerBoundaryDenialProofFailureShape[] => {
  const failures: HandlerBoundaryDenialProofFailureShape[] = [];

  const addFalseCheck = (input: {
    code: HandlerBoundaryDenialProofFailureCode;
    path: string;
    actual: unknown;
    message: string;
  }): void => {
    if (input.actual !== false) {
      failures.push(createFailure({ ...input, expected: false }));
    }
  };

  const addTrueCheck = (input: {
    code: HandlerBoundaryDenialProofFailureCode;
    path: string;
    actual: unknown;
    message: string;
  }): void => {
    if (input.actual !== true) {
      failures.push(createFailure({ ...input, expected: true }));
    }
  };

  addTrueCheck({
    code: "handler_boundary_not_runtime_adjacent",
    path: "runtime_adjacent",
    actual: summary.runtime_adjacent,
    message: "Handler boundary denial proof must remain runtime-adjacent."
  });
  addTrueCheck({
    code: "handler_boundary_not_runtime_handler_boundary",
    path: "runtime_handler_boundary",
    actual: summary.runtime_handler_boundary,
    message: "Handler boundary denial proof must remain a runtime handler boundary."
  });
  addFalseCheck({
    code: "handler_execution_not_false",
    path: "handler_execution_allowed_now",
    actual: summary.handler_execution_allowed_now,
    message: "Handler execution must remain denied."
  });
  addFalseCheck({
    code: "runtime_permission_not_false",
    path: "runtime_permission_granted",
    actual: summary.runtime_permission_granted,
    message: "Runtime permission must remain denied."
  });
  addFalseCheck({
    code: "actual_contour_execution_not_false",
    path: "actual_contour_execution_allowed_now",
    actual: summary.actual_contour_execution_allowed_now,
    message: "Actual contour execution must remain denied."
  });
  addTrueCheck({
    code: "denial_flags_not_all_false",
    path: "denial_flags_all_false",
    actual: summary.denial_flags_all_false,
    message: "Handler boundary denial proof must confirm all denial flags are false."
  });

  addFalseCheck({
    code: "handler_invocation_allowed",
    path: "denial_assertions.handler_invocation_allowed_now",
    actual: summary.denial_assertions.handler_invocation_allowed_now,
    message: "Handler invocation must remain denied."
  });
  addFalseCheck({
    code: "handler_execution_allowed",
    path: "denial_assertions.handler_execution_allowed_now",
    actual: summary.denial_assertions.handler_execution_allowed_now,
    message: "Handler execution must remain denied."
  });
  addFalseCheck({
    code: "runtime_dispatch_allowed",
    path: "denial_assertions.runtime_dispatch_allowed_now",
    actual: summary.denial_assertions.runtime_dispatch_allowed_now,
    message: "Runtime dispatch must remain denied."
  });
  addFalseCheck({
    code: "provider_sdk_call_allowed",
    path: "denial_assertions.provider_sdk_call_allowed_now",
    actual: summary.denial_assertions.provider_sdk_call_allowed_now,
    message: "Provider SDK calls must remain denied."
  });
  addFalseCheck({
    code: "transport_execution_allowed",
    path: "denial_assertions.transport_execution_allowed_now",
    actual: summary.denial_assertions.transport_execution_allowed_now,
    message: "Transport execution must remain denied."
  });
  addFalseCheck({
    code: "concrete_persistence_write_allowed",
    path: "denial_assertions.concrete_persistence_write_allowed_now",
    actual: summary.denial_assertions.concrete_persistence_write_allowed_now,
    message: "Concrete persistence writes must remain denied."
  });
  addFalseCheck({
    code: "direct_canonical_context_access_allowed",
    path: "denial_assertions.direct_canonical_context_access_allowed_now",
    actual: summary.denial_assertions.direct_canonical_context_access_allowed_now,
    message: "Direct canonical context access must remain denied."
  });
  addFalseCheck({
    code: "direct_canonical_writeback_allowed",
    path: "denial_assertions.direct_canonical_writeback_allowed_now",
    actual: summary.denial_assertions.direct_canonical_writeback_allowed_now,
    message: "Direct canonical writeback must remain denied."
  });
  addFalseCheck({
    code: "actual_contour_execution_allowed",
    path: "denial_assertions.actual_contour_execution_allowed_now",
    actual: summary.denial_assertions.actual_contour_execution_allowed_now,
    message: "Actual contour execution must remain denied."
  });
  addFalseCheck({
    code: "real_model_call_allowed",
    path: "denial_assertions.real_model_call_allowed_now",
    actual: summary.denial_assertions.real_model_call_allowed_now,
    message: "Real model calls must remain denied."
  });
  addFalseCheck({
    code: "real_storage_write_allowed",
    path: "denial_assertions.real_storage_write_allowed_now",
    actual: summary.denial_assertions.real_storage_write_allowed_now,
    message: "Real storage writes must remain denied."
  });

  addTrueCheck({
    code: "source_invocation_denial_not_verified",
    path: "source_invocation_assertions.source_invocation_denial_verified",
    actual: summary.source_invocation_assertions.source_invocation_denial_verified,
    message: "Source invocation denial proof must remain verified."
  });
  addTrueCheck({
    code: "source_invocation_not_executable_adjacent",
    path: "source_invocation_assertions.source_invocation_executable_adjacent",
    actual: summary.source_invocation_assertions.source_invocation_executable_adjacent,
    message: "Source invocation denial proof must remain executable-adjacent."
  });
  addFalseCheck({
    code: "source_invocation_executable_now_not_false",
    path: "source_invocation_assertions.source_invocation_executable_now",
    actual: summary.source_invocation_assertions.source_invocation_executable_now,
    message: "Source invocation proof must not allow execution now."
  });
  addFalseCheck({
    code: "source_invocation_runtime_permission_not_false",
    path: "source_invocation_assertions.source_invocation_runtime_permission_granted",
    actual: summary.source_invocation_assertions.source_invocation_runtime_permission_granted,
    message: "Source invocation proof must not grant runtime permission."
  });
  addTrueCheck({
    code: "source_invocation_denial_flags_not_false",
    path: "source_invocation_assertions.source_invocation_denial_flags_all_false",
    actual: summary.source_invocation_assertions.source_invocation_denial_flags_all_false,
    message: "Source invocation proof must confirm denial flags are all false."
  });

  addFalseCheck({
    code: "handler_boundary_intent_execution_allowed",
    path: "intent_assertions.handler_execution_allowed_now",
    actual: summary.intent_assertions.handler_execution_allowed_now,
    message: "Handler boundary intent must not allow handler execution."
  });
  addFalseCheck({
    code: "runtime_permission_not_false",
    path: "intent_assertions.runtime_permission_granted",
    actual: summary.intent_assertions.runtime_permission_granted,
    message: "Handler boundary intent must not grant runtime permission."
  });
  addFalseCheck({
    code: "handler_boundary_readiness_invocation_allowed",
    path: "readiness_assertions.handler_invocation_allowed_now",
    actual: summary.readiness_assertions.handler_invocation_allowed_now,
    message: "Handler boundary readiness must not allow handler invocation."
  });
  addFalseCheck({
    code: "handler_boundary_readiness_execution_allowed",
    path: "readiness_assertions.handler_execution_allowed_now",
    actual: summary.readiness_assertions.handler_execution_allowed_now,
    message: "Handler boundary readiness must not allow handler execution."
  });
  addFalseCheck({
    code: "handler_boundary_readiness_dispatch_allowed",
    path: "readiness_assertions.runtime_dispatch_allowed_now",
    actual: summary.readiness_assertions.runtime_dispatch_allowed_now,
    message: "Handler boundary readiness must not allow runtime dispatch."
  });
  addFalseCheck({
    code: "handler_boundary_readiness_runtime_permission_not_false",
    path: "readiness_assertions.runtime_permission_granted",
    actual: summary.readiness_assertions.runtime_permission_granted,
    message: "Handler boundary readiness must not grant runtime permission."
  });

  return failures;
};

export const createHandlerBoundaryDenialProofBuilder = (): HandlerBoundaryDenialProofBuilder => ({
  create(input: HandlerBoundaryDenialProofInputShape): HandlerBoundaryDenialProofSummaryShape {
    const boundary = input.handler_boundary;
    const now = input.now ?? boundary.created_at ?? DEFAULT_HANDLER_BOUNDARY_DENIAL_PROOF_TIME;

    const summary: HandlerBoundaryDenialProofSummaryShape = {
      contract_version: "handler-boundary-denial-proof/v1",
      proof_id: proofIdForBoundary(boundary),
      proof_result: "handler_boundary_denial_default_deny_proven",
      proof_boundary: "machine_checkable_handler_boundary_denial_proof_only",
      source_handler_boundary_id: boundary.handler_boundary_id,
      source_invocation_denial_proof_id: boundary.source.source_invocation_denial_proof_id,
      source_invocation_seam_id: boundary.source.source_invocation_seam_id,
      source_contour_target: boundary.source.source_contour_target,
      source_handler_boundary_status: boundary.boundary_status,
      runtime_adjacent: true,
      runtime_handler_boundary: true,
      handler_execution_allowed_now: false,
      runtime_permission_granted: false,
      actual_contour_execution_allowed_now: false,
      denial_flags_all_false: true,
      source_invocation_assertions: {
        source_invocation_denial_contract_version: boundary.source.source_invocation_denial_contract_version,
        source_invocation_denial_verified: boundary.source.source_invocation_denial_verified,
        source_invocation_executable_adjacent: input.source_invocation_executable_adjacent ?? true,
        source_invocation_executable_now: input.source_invocation_executable_now ?? false,
        source_invocation_runtime_permission_granted: input.source_invocation_runtime_permission_granted ?? false,
        source_invocation_denial_flags_all_false: input.source_invocation_denial_flags_all_false ?? true
      },
      denial_assertions: denialAssertionsFromBoundary(boundary),
      readiness_assertions: readinessAssertionsFromBoundary(boundary),
      intent_assertions: intentAssertionsFromBoundary(boundary),
      authority_context_placeholder: carryAuthorityContext(boundary.authority_context_placeholder),
      failure_count: 0,
      failures: [],
      generated_at: now
    };

    this.assertDefaultDeny(summary);

    return summary;
  },

  findFailures(input: HandlerBoundaryDenialProofSummaryShape): HandlerBoundaryDenialProofFailureShape[] {
    return findFailuresFromSummary(input);
  },

  assertDefaultDeny(input: HandlerBoundaryDenialProofSummaryShape): true {
    const failures = findFailuresFromSummary(input);

    if (failures.length > 0) {
      throw new Error(`Handler boundary denial proof failed: ${JSON.stringify(failures)}`);
    }

    return true;
  }
});

export const createDeterministicHandlerBoundaryDenialProofSummary = (input?: {
  handler_boundary?: RuntimeAdjacentHandlerBoundaryShape;
  now?: IsoDateTimeString;
}): HandlerBoundaryDenialProofSummaryShape => {
  const boundary = input?.handler_boundary ?? createDeterministicFirstRuntimeAdjacentHandlerBoundary();

  return createHandlerBoundaryDenialProofBuilder().create({
    handler_boundary: boundary,
    ...(input?.now ? { now: input.now } : {})
  });
};

export const findHandlerBoundaryDenialProofFailures = (
  input: HandlerBoundaryDenialProofSummaryShape
): HandlerBoundaryDenialProofFailureShape[] => createHandlerBoundaryDenialProofBuilder().findFailures(input);

export const assertHandlerBoundaryDenialProofDefaultDeny = (
  input: HandlerBoundaryDenialProofSummaryShape
): true => createHandlerBoundaryDenialProofBuilder().assertDefaultDeny(input);

export const createHandlerBoundaryDenialProofVerificationSummary = (
  input: HandlerBoundaryDenialProofSummaryShape
): HandlerBoundaryDenialProofVerificationSummaryShape => {
  const failures = findHandlerBoundaryDenialProofFailures(input);

  if (failures.length > 0) {
    return {
      verification_result: "handler_boundary_denial_default_deny_failed",
      contract_version: input.contract_version,
      proof_id: input.proof_id,
      source_handler_boundary_id: input.source_handler_boundary_id,
      source_invocation_denial_proof_id: input.source_invocation_denial_proof_id,
      source_contour_target: input.source_contour_target,
      runtime_adjacent: input.runtime_adjacent,
      runtime_handler_boundary: input.runtime_handler_boundary,
      handler_execution_allowed_now: input.handler_execution_allowed_now,
      runtime_permission_granted: input.runtime_permission_granted,
      actual_contour_execution_allowed_now: input.actual_contour_execution_allowed_now,
      denial_flags_all_false: input.denial_flags_all_false,
      failure_count: failures.length
    };
  }

  return {
    verification_result: "handler_boundary_denial_default_deny_verified",
    contract_version: input.contract_version,
    proof_id: input.proof_id,
    source_handler_boundary_id: input.source_handler_boundary_id,
    source_invocation_denial_proof_id: input.source_invocation_denial_proof_id,
    source_contour_target: input.source_contour_target,
    runtime_adjacent: input.runtime_adjacent,
    runtime_handler_boundary: input.runtime_handler_boundary,
    handler_execution_allowed_now: input.handler_execution_allowed_now,
    runtime_permission_granted: input.runtime_permission_granted,
    actual_contour_execution_allowed_now: input.actual_contour_execution_allowed_now,
    denial_flags_all_false: input.denial_flags_all_false,
    failure_count: 0
  };
};
