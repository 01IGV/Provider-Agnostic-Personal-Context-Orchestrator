import type { IsoDateTimeString } from "@orchestrator/core-foundation";
import {
  createDeterministicFirstExecutableAdjacentContourInvocationSeam
} from "./first-executable-adjacent-contour-invocation-seam.js";
import type {
  FirstExecutableAdjacentInvocationAuthorityContextPlaceholderShape,
  FirstExecutableAdjacentInvocationBoundaryShape,
  FirstExecutableAdjacentInvocationDenialFlagsShape
} from "./first-executable-adjacent-contour-invocation-seam-types.js";
import type {
  InvocationDenialProofAuthorityContextPlaceholderShape,
  InvocationDenialProofBuilder,
  InvocationDenialProofDenialAssertionsShape,
  InvocationDenialProofFailureCode,
  InvocationDenialProofFailureShape,
  InvocationDenialProofInputShape,
  InvocationDenialProofReadinessAssertionShape,
  InvocationDenialProofSummaryShape,
  InvocationDenialProofVerificationSummaryShape
} from "./invocation-denial-proof-integration-types.js";

const DEFAULT_INVOCATION_DENIAL_PROOF_TIME = "2026-04-24T00:00:00.000Z" as IsoDateTimeString;

const proofIdForSeam = (seam: FirstExecutableAdjacentInvocationBoundaryShape): string =>
  `${seam.boundary_id}:invocation-denial-proof`;

const carryAuthorityContext = (
  source: FirstExecutableAdjacentInvocationAuthorityContextPlaceholderShape
): InvocationDenialProofAuthorityContextPlaceholderShape => ({
  ...(source.authority_context_id ? { authority_context_id: source.authority_context_id } : {}),
  ...(source.subject_identity_ref ? { subject_identity_ref: source.subject_identity_ref } : {}),
  ...(source.delegated_authority_ref ? { delegated_authority_ref: source.delegated_authority_ref } : {}),
  ...(source.provenance_chain_ref ? { provenance_chain_ref: source.provenance_chain_ref } : {}),
  control_plane_boundary: source.control_plane_boundary,
  runtime_boundary: source.runtime_boundary
});

const denialAssertionsFromSeam = (
  flags: FirstExecutableAdjacentInvocationDenialFlagsShape
): InvocationDenialProofDenialAssertionsShape => ({
  actual_contour_execution_allowed_now: flags.actual_contour_execution_allowed_now,
  runtime_handler_invocation_allowed_now: flags.runtime_handler_invocation_allowed_now,
  provider_sdk_call_allowed_now: flags.provider_sdk_call_allowed_now,
  concrete_persistence_write_allowed_now: flags.concrete_persistence_write_allowed_now,
  direct_canonical_context_access_allowed_now: flags.direct_canonical_context_access_allowed_now,
  direct_canonical_writeback_allowed_now: flags.direct_canonical_writeback_allowed_now,
  dispatch_execution_allowed_now: flags.dispatch_execution_allowed_now,
  publication_delivery_allowed_now: flags.publication_delivery_allowed_now,
  delivery_runtime_allowed_now: flags.delivery_runtime_allowed_now,
  transport_execution_allowed_now: flags.transport_execution_allowed_now,
  real_model_call_allowed_now: flags.real_model_call_allowed_now,
  real_storage_write_allowed_now: flags.real_storage_write_allowed_now
});

const readinessAssertionsFromSeam = (
  seam: FirstExecutableAdjacentInvocationBoundaryShape
): InvocationDenialProofReadinessAssertionShape => ({
  invocation_readiness_id: seam.invocation_readiness.invocation_readiness_id,
  readiness_status: seam.invocation_readiness.readiness_status,
  execution_layer_handoff_allowed_now: seam.invocation_readiness.execution_layer_handoff_allowed_now,
  actual_execution_allowed_now: seam.invocation_readiness.actual_execution_allowed_now
});

const createFailure = (input: {
  code: InvocationDenialProofFailureCode;
  path: string;
  expected: boolean;
  actual: unknown;
  message: string;
}): InvocationDenialProofFailureShape => ({
  code: input.code,
  path: input.path,
  expected: input.expected,
  actual: input.actual,
  message: input.message
});

const findFailuresFromUnknownSummary = (summary: InvocationDenialProofSummaryShape): InvocationDenialProofFailureShape[] => {
  const failures: InvocationDenialProofFailureShape[] = [];
  const addFalseCheck = (input: {
    code: InvocationDenialProofFailureCode;
    path: string;
    actual: unknown;
    message: string;
  }): void => {
    if (input.actual !== false) {
      failures.push(createFailure({ ...input, expected: false }));
    }
  };
  const addTrueCheck = (input: {
    code: InvocationDenialProofFailureCode;
    path: string;
    actual: unknown;
    message: string;
  }): void => {
    if (input.actual !== true) {
      failures.push(createFailure({ ...input, expected: true }));
    }
  };

  addTrueCheck({
    code: "invocation_not_executable_adjacent",
    path: "executable_adjacent",
    actual: summary.executable_adjacent,
    message: "Invocation denial proof must remain executable-adjacent."
  });
  addFalseCheck({
    code: "invocation_executable_now_not_false",
    path: "executable_now",
    actual: summary.executable_now,
    message: "Invocation denial proof must not permit execution now."
  });
  addFalseCheck({
    code: "runtime_permission_not_false",
    path: "runtime_permission_granted",
    actual: summary.runtime_permission_granted,
    message: "Invocation denial proof must not grant runtime permission."
  });
  addTrueCheck({
    code: "denial_flags_not_all_false",
    path: "denial_flags_all_false",
    actual: summary.denial_flags_all_false,
    message: "Invocation denial proof must confirm denial flags are all false."
  });
  addTrueCheck({
    code: "source_runtime_action_assertions_not_false",
    path: "source_runtime_action_assertions_all_false",
    actual: summary.source_runtime_action_assertions_all_false,
    message: "Source proof artifact runtime/action assertions must remain all false."
  });

  addFalseCheck({
    code: "actual_contour_execution_allowed",
    path: "denial_assertions.actual_contour_execution_allowed_now",
    actual: summary.denial_assertions.actual_contour_execution_allowed_now,
    message: "Actual contour execution must remain denied."
  });
  addFalseCheck({
    code: "runtime_handler_invocation_allowed",
    path: "denial_assertions.runtime_handler_invocation_allowed_now",
    actual: summary.denial_assertions.runtime_handler_invocation_allowed_now,
    message: "Runtime handler invocation must remain denied."
  });
  addFalseCheck({
    code: "provider_sdk_call_allowed",
    path: "denial_assertions.provider_sdk_call_allowed_now",
    actual: summary.denial_assertions.provider_sdk_call_allowed_now,
    message: "Provider SDK calls must remain denied."
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
    code: "dispatch_execution_allowed",
    path: "denial_assertions.dispatch_execution_allowed_now",
    actual: summary.denial_assertions.dispatch_execution_allowed_now,
    message: "Dispatch execution must remain denied."
  });
  addFalseCheck({
    code: "publication_delivery_allowed",
    path: "denial_assertions.publication_delivery_allowed_now",
    actual: summary.denial_assertions.publication_delivery_allowed_now,
    message: "Publication delivery must remain denied."
  });
  addFalseCheck({
    code: "delivery_runtime_allowed",
    path: "denial_assertions.delivery_runtime_allowed_now",
    actual: summary.denial_assertions.delivery_runtime_allowed_now,
    message: "Delivery runtime must remain denied."
  });
  addFalseCheck({
    code: "transport_execution_allowed",
    path: "denial_assertions.transport_execution_allowed_now",
    actual: summary.denial_assertions.transport_execution_allowed_now,
    message: "Transport execution must remain denied."
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
  addFalseCheck({
    code: "execution_layer_handoff_allowed",
    path: "readiness_assertions.execution_layer_handoff_allowed_now",
    actual: summary.readiness_assertions.execution_layer_handoff_allowed_now,
    message: "Execution-layer handoff must remain denied."
  });
  addFalseCheck({
    code: "actual_execution_allowed",
    path: "readiness_assertions.actual_execution_allowed_now",
    actual: summary.readiness_assertions.actual_execution_allowed_now,
    message: "Actual execution must remain denied."
  });

  return failures;
};

export const createInvocationDenialProofBuilder = (): InvocationDenialProofBuilder => ({
  create(input: InvocationDenialProofInputShape): InvocationDenialProofSummaryShape {
    const seam = input.invocation_seam;
    const now = input.now ?? seam.created_at ?? DEFAULT_INVOCATION_DENIAL_PROOF_TIME;
    const summary: InvocationDenialProofSummaryShape = {
      contract_version: "invocation-denial-proof/v1",
      proof_id: proofIdForSeam(seam),
      proof_result: "invocation_denial_default_deny_proven",
      proof_boundary: "machine_checkable_invocation_denial_proof_only",
      source_invocation_seam_id: seam.boundary_id,
      source_invocation_intent_id: seam.invocation_intent.invocation_intent_id,
      source_invocation_readiness_id: seam.invocation_readiness.invocation_readiness_id,
      source_proof_artifact_ref: seam.source_proof_reference.proof_id,
      source_proof_reference_id: seam.source_proof_reference.source_proof_reference_id,
      source_contour_target: seam.contour_target,
      source_seam_status: seam.boundary_status,
      source_runtime_action_assertions_all_false: seam.source_proof_reference.source_runtime_action_assertions_all_false,
      executable_adjacent: true,
      executable_now: false,
      runtime_permission_granted: false,
      denial_flags_all_false: true,
      denial_assertions: denialAssertionsFromSeam(seam.denial_flags),
      readiness_assertions: readinessAssertionsFromSeam(seam),
      authority_context_placeholder: carryAuthorityContext(seam.authority_context_placeholder),
      failure_count: 0,
      failures: [],
      generated_at: now
    };

    this.assertDefaultDeny(summary);

    return summary;
  },

  findFailures(input: InvocationDenialProofSummaryShape): InvocationDenialProofFailureShape[] {
    return findFailuresFromUnknownSummary(input);
  },

  assertDefaultDeny(input: InvocationDenialProofSummaryShape): true {
    const failures = findFailuresFromUnknownSummary(input);

    if (failures.length > 0) {
      throw new Error(`Invocation denial proof failed: ${JSON.stringify(failures)}`);
    }

    return true;
  }
});

export const createDeterministicInvocationDenialProofSummary = (input?: {
  invocation_seam?: FirstExecutableAdjacentInvocationBoundaryShape;
  now?: IsoDateTimeString;
}): InvocationDenialProofSummaryShape => {
  const seam = input?.invocation_seam ?? createDeterministicFirstExecutableAdjacentContourInvocationSeam();

  return createInvocationDenialProofBuilder().create({
    invocation_seam: seam,
    ...(input?.now ? { now: input.now } : {})
  });
};

export const findInvocationDenialProofFailures = (
  input: InvocationDenialProofSummaryShape
): InvocationDenialProofFailureShape[] => createInvocationDenialProofBuilder().findFailures(input);

export const assertInvocationDenialProofDefaultDeny = (
  input: InvocationDenialProofSummaryShape
): true => createInvocationDenialProofBuilder().assertDefaultDeny(input);

export const createInvocationDenialProofVerificationSummary = (
  input: InvocationDenialProofSummaryShape
): InvocationDenialProofVerificationSummaryShape => {
  const failures = findInvocationDenialProofFailures(input);

  if (failures.length > 0) {
    return {
      verification_result: "invocation_denial_default_deny_failed",
      contract_version: input.contract_version,
      proof_id: input.proof_id,
      source_invocation_seam_id: input.source_invocation_seam_id,
      source_contour_target: input.source_contour_target,
      executable_adjacent: input.executable_adjacent,
      executable_now: input.executable_now,
      runtime_permission_granted: input.runtime_permission_granted,
      denial_flags_all_false: input.denial_flags_all_false,
      failure_count: failures.length
    };
  }

  return {
    verification_result: "invocation_denial_default_deny_verified",
    contract_version: input.contract_version,
    proof_id: input.proof_id,
    source_invocation_seam_id: input.source_invocation_seam_id,
    source_contour_target: input.source_contour_target,
    executable_adjacent: input.executable_adjacent,
    executable_now: input.executable_now,
    runtime_permission_granted: input.runtime_permission_granted,
    denial_flags_all_false: input.denial_flags_all_false,
    failure_count: 0
  };
};
