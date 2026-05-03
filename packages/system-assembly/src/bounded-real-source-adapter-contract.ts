import type { IsoDateTimeString } from "@orchestrator/core-foundation";
import { createBoundedRealSourceAdapterContractBuilder } from "@orchestrator/integration-contracts";
import { createDeterministicFirstAgentContextRequestBoundary } from "./first-agent-context-request-boundary.js";
import { createDeterministicLocalContextSourceAdapterContracts } from "./local-deterministic-context-source-adapter-contracts.js";
import { createLocalV0SourceCatalog } from "./local-v0-source-catalog-contracts.js";
import type {
  BoundedRealSourceAdapterContractBuilder,
  BoundedRealSourceAdapterContractInputShape,
  BoundedRealSourceAdapterContractResultShape
} from "./bounded-real-source-adapter-contract-types.js";

const DEFAULT_BOUNDED_REAL_SOURCE_ADAPTER_CONTRACT_TIME =
  "2026-05-03T00:00:00.000Z" as IsoDateTimeString;

export const createBoundedRealSourceAdapterContractsBuilder =
  (): BoundedRealSourceAdapterContractBuilder => ({
    create(
      input?: BoundedRealSourceAdapterContractInputShape
    ): BoundedRealSourceAdapterContractResultShape {
      const agentContextBoundary =
        input?.agent_context_boundary ?? createDeterministicFirstAgentContextRequestBoundary();
      const request = input?.request ?? agentContextBoundary.request;
      const now = input?.now ?? DEFAULT_BOUNDED_REAL_SOURCE_ADAPTER_CONTRACT_TIME;
      const localAdapterResult =
        input?.local_adapter_result ??
        createDeterministicLocalContextSourceAdapterContracts({ request, now }).adapter_result;
      const sourceCatalog = createLocalV0SourceCatalog(request.agent_context_request_id);

      const contract = createBoundedRealSourceAdapterContractBuilder().create({
        contract_id: `${request.agent_context_request_id}:bounded-real-source-adapter-contract`,
        agent_context_request_id: request.agent_context_request_id,
        authority: request.authority,
        adapter_ref: "adapter://bounded-real-source-adapter/capability-declaration-only",
        supported_scope_ids: sourceCatalog.supported_scope_ids,
        supported_source_kinds: [
          "repo_work_context_source_candidate",
          "repo_file_source_candidate",
          "local_artifact_source_candidate"
        ],
        provenance_envelope_ref: localAdapterResult.provenance_envelope_ref,
        permission_envelope_ref: localAdapterResult.permission_envelope_ref,
        audit_envelope_ref: localAdapterResult.audit_envelope_ref,
        generated_at: now,
        ...(request.correlation_id ? { correlation_id: request.correlation_id } : {})
      });

      return {
        request,
        local_adapter_result: localAdapterResult,
        bounded_real_source_adapter_contract: contract
      };
    }
  });

export const createDeterministicBoundedRealSourceAdapterContract =
  (input?: BoundedRealSourceAdapterContractInputShape): BoundedRealSourceAdapterContractResultShape =>
    createBoundedRealSourceAdapterContractsBuilder().create(input);
