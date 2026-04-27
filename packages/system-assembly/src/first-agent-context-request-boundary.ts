import { asCanonicalId, type IsoDateTimeString } from "@orchestrator/core-foundation";
import {
  createAgentContextRequestBoundaryBuilder,
  type AgentContextAuthorityEnvelopeShape
} from "@orchestrator/integration-contracts";
import {
  createDeterministicAuthorityBoundaryDenialProofSummary
} from "./authority-boundary-denial-proof-integration.js";
import type { AuthorityBoundaryDenialProofSummaryShape } from "./authority-boundary-denial-proof-integration-types.js";
import type {
  FirstAgentContextRequestBoundaryBuilder,
  FirstAgentContextRequestBoundaryInputShape,
  FirstAgentContextRequestBoundaryResultShape
} from "./first-agent-context-request-boundary-types.js";

const DEFAULT_AGENT_CONTEXT_REQUEST_TIME = "2026-04-27T00:00:00.000Z" as IsoDateTimeString;

const assertAuthorityBoundaryDenialProofDefaultDeny = (
  proof: AuthorityBoundaryDenialProofSummaryShape
): true => {
  const allDenied =
    proof.auth_iam_adjacent === true &&
    proof.authority_boundary === true &&
    proof.identity_boundary === true &&
    proof.delegation_boundary === true &&
    proof.provenance_boundary === true &&
    proof.permission_boundary === true &&
    proof.authentication_implemented === false &&
    proof.authorization_implemented === false &&
    proof.iam_provider_integrated === false &&
    proof.session_management_implemented === false &&
    proof.token_validation_implemented === false &&
    proof.policy_engine_integrated === false &&
    proof.permission_grant_issued === false &&
    proof.runtime_permission_granted === false &&
    proof.mcp_route_permission_granted === false &&
    proof.api_route_permission_granted === false &&
    proof.actual_contour_execution_allowed_now === false &&
    proof.denial_flags_all_false === true &&
    proof.failure_count === 0;

  if (!allDenied) {
    throw new Error("Authority-boundary denial proof is not default-deny; cannot derive agent context request boundary.");
  }

  return true;
};

const authorityEnvelopeFromProof = (
  proof: AuthorityBoundaryDenialProofSummaryShape
): AgentContextAuthorityEnvelopeShape => ({
  authority_boundary_id: proof.authority_boundary_id,
  authority_boundary_denial_proof_id: proof.proof_id,
  permission_scope_ref: `${proof.authority_boundary_id}:permission-scope-placeholder`,
  policy_context_ref: `${proof.authority_boundary_id}:policy-context-placeholder`,
  audit_trace_ref: `${proof.authority_boundary_id}:audit-trace-placeholder`,
  auth_iam_adjacent: true,
  authority_boundary: true,
  permission_boundary: true,
  permission_grant_issued: false,
  runtime_permission_granted: false,
  mcp_route_permission_granted: false,
  api_route_permission_granted: false
});

export const createFirstAgentContextRequestBoundaryBuilder = (): FirstAgentContextRequestBoundaryBuilder => ({
  create(input: FirstAgentContextRequestBoundaryInputShape): FirstAgentContextRequestBoundaryResultShape {
    const proof = input.authority_boundary_denial_proof;
    const now = input.now ?? proof.generated_at ?? DEFAULT_AGENT_CONTEXT_REQUEST_TIME;
    assertAuthorityBoundaryDenialProofDefaultDeny(proof);

    const builder = createAgentContextRequestBoundaryBuilder();
    const request = builder.createRequest({
      agent_context_request_id: `${proof.proof_id}:agent-context-request`,
      requester: {
        requester_ref: "deterministic-ai-agent-requester",
        subject_id: asCanonicalId<"subject_id">("subject:deterministic-agent-context-request")
      },
      intent: {
        request_kind: "get_context_bundle",
        task_signal: "deterministic request for bounded context package",
        read_mode_hint: "planning",
        depth_hint: "standard",
        requested_scope_hints: [asCanonicalId<"scope_id">("scope:deterministic-agent-context-request")],
        requested_visibility: "subject_scoped",
        target_runtime: "agent_context_contract_surface"
      },
      authority: authorityEnvelopeFromProof(proof),
      created_at: now
    });

    const response = builder.createResponse({
      request,
      bounded_context_package_ref: `${request.agent_context_request_id}:bounded-context-package-placeholder`,
      context_bundle_ref: `${request.agent_context_request_id}:context-bundle-placeholder`,
      provenance_envelope_ref: `${request.agent_context_request_id}:provenance-envelope-placeholder`,
      permission_envelope_ref: `${request.agent_context_request_id}:permission-envelope-placeholder`,
      audit_envelope_ref: `${request.agent_context_request_id}:audit-envelope-placeholder`,
      response_payload: {
        contract_only: true,
        bounded_context_materialized_now: false,
        runtime_execution_allowed_now: false
      },
      served_at: now
    });

    return { request, response };
  }
});

export const createDeterministicFirstAgentContextRequestBoundary = (input?: {
  authority_boundary_denial_proof?: AuthorityBoundaryDenialProofSummaryShape;
  now?: IsoDateTimeString;
}): FirstAgentContextRequestBoundaryResultShape =>
  createFirstAgentContextRequestBoundaryBuilder().create({
    authority_boundary_denial_proof: input?.authority_boundary_denial_proof ?? createDeterministicAuthorityBoundaryDenialProofSummary(),
    ...(input?.now ? { now: input.now } : {})
  });
