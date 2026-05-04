import type { IsoDateTimeString } from "@orchestrator/core-foundation";
import { asCanonicalId } from "@orchestrator/core-foundation";
import {
  createNarrowLocalRealSourceReadBoundaryBuilder
} from "@orchestrator/integration-contracts";
import { createDeterministicFirstAgentContextRequestBoundary } from "./first-agent-context-request-boundary.js";
import { createDeterministicBoundedRealSourceAdapterContract } from "./bounded-real-source-adapter-contract.js";
import type {
  NarrowLocalRealSourceReadBoundaryContractsBuilder,
  NarrowLocalRealSourceReadBoundaryContractsInputShape,
  NarrowLocalRealSourceReadBoundaryContractsResultShape
} from "./narrow-local-real-source-read-boundary-contracts-types.js";

const DEFAULT_NARROW_LOCAL_REAL_SOURCE_READ_BOUNDARY_TIME =
  "2026-05-04T00:00:00.000Z" as IsoDateTimeString;

export const createNarrowLocalRealSourceReadBoundaryContractsBuilder =
  (): NarrowLocalRealSourceReadBoundaryContractsBuilder => ({
    create(
      input?: NarrowLocalRealSourceReadBoundaryContractsInputShape
    ): NarrowLocalRealSourceReadBoundaryContractsResultShape {
      const agentContextBoundary =
        input?.agent_context_boundary ?? createDeterministicFirstAgentContextRequestBoundary();
      const request = input?.request ?? agentContextBoundary.request;
      const now = input?.now ?? DEFAULT_NARROW_LOCAL_REAL_SOURCE_READ_BOUNDARY_TIME;
      const boundedContract =
        input?.bounded_real_source_adapter_contract ??
        createDeterministicBoundedRealSourceAdapterContract({ request, now })
          .bounded_real_source_adapter_contract;
      const readBoundary = createNarrowLocalRealSourceReadBoundaryBuilder().create({
        boundary_id: `${request.agent_context_request_id}:narrow-local-real-source-read-boundary`,
        agent_context_request_id: request.agent_context_request_id,
        authority: request.authority,
        allowed_roots: [
          {
            root_ref: "repo-root://docs-implementation",
            root_kind: "repo_relative_allowlisted_root",
            repo_relative_root: "docs/04-implementation",
            allowed_scope_ids: boundedContract.capability_declaration.supported_scope_ids,
            recursive_read_allowed_now: false
          }
        ],
        allowed_source_refs: [
          {
            source_ref:
              "repo-file://docs/04-implementation/CURRENT_IMPLEMENTATION_STATE.md",
            ref_kind: "repo_relative_allowlisted_doc_ref",
            repo_relative_path: "docs/04-implementation/CURRENT_IMPLEMENTATION_STATE.md",
            scope_id: asCanonicalId<"scope_id">("scope:repo-work-context"),
            root_ref: "repo-root://docs-implementation",
            max_bytes_per_read: 65536,
            content_digest_required_after_read: true
          },
          {
            source_ref:
              "repo-file://docs/04-implementation/KNOWN_IMPLEMENTATION_ISSUES.md",
            ref_kind: "repo_relative_allowlisted_doc_ref",
            repo_relative_path: "docs/04-implementation/KNOWN_IMPLEMENTATION_ISSUES.md",
            scope_id: asCanonicalId<"scope_id">("scope:repo-work-context"),
            root_ref: "repo-root://docs-implementation",
            max_bytes_per_read: 65536,
            content_digest_required_after_read: true
          }
        ],
        provenance_envelope_ref: boundedContract.provenance_envelope_ref,
        permission_envelope_ref: boundedContract.permission_envelope_ref,
        audit_envelope_ref: boundedContract.audit_envelope_ref,
        generated_at: now,
        ...(request.correlation_id ? { correlation_id: request.correlation_id } : {})
      });

      return {
        request,
        bounded_real_source_adapter_contract: boundedContract,
        narrow_local_real_source_read_boundary: readBoundary
      };
    }
  });

export const createDeterministicNarrowLocalRealSourceReadBoundaryContracts =
  (
    input?: NarrowLocalRealSourceReadBoundaryContractsInputShape
  ): NarrowLocalRealSourceReadBoundaryContractsResultShape =>
    createNarrowLocalRealSourceReadBoundaryContractsBuilder().create(input);
