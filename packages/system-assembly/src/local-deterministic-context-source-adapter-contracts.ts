import type { IsoDateTimeString } from "@orchestrator/core-foundation";
import {
  createLocalDeterministicContextSourceAdapterBuilder
} from "@orchestrator/integration-contracts";
import { createDeterministicFirstAgentContextRequestBoundary } from "./first-agent-context-request-boundary.js";
import type {
  LocalDeterministicContextSourceAdapterContractsBuilder,
  LocalDeterministicContextSourceAdapterContractsInputShape,
  LocalDeterministicContextSourceAdapterContractsResultShape
} from "./local-deterministic-context-source-adapter-contracts-types.js";
import { selectLocalV0SourceCatalogItems } from "./local-v0-source-catalog-contracts.js";

const DEFAULT_LOCAL_DETERMINISTIC_SOURCE_TIME = "2026-04-27T00:00:00.000Z" as IsoDateTimeString;

export const createLocalDeterministicContextSourceAdapterContractsBuilder =
  (): LocalDeterministicContextSourceAdapterContractsBuilder => ({
    create(
      input?: LocalDeterministicContextSourceAdapterContractsInputShape
    ): LocalDeterministicContextSourceAdapterContractsResultShape {
      const agentContextBoundary =
        input?.agent_context_boundary ?? createDeterministicFirstAgentContextRequestBoundary();
      const request = input?.request ?? agentContextBoundary.request;
      const now = input?.now ?? DEFAULT_LOCAL_DETERMINISTIC_SOURCE_TIME;

      const builder = createLocalDeterministicContextSourceAdapterBuilder();
      const adapter_result = builder.createAdapterResult({
        adapter_result_id: `${request.agent_context_request_id}:local-deterministic-context-source-adapter-result`,
        authority: request.authority,
        source_items: selectLocalV0SourceCatalogItems(
          request.agent_context_request_id,
          request.intent.requested_scope_hints
        ),
        provenance_envelope_ref: `${request.agent_context_request_id}:local-deterministic-provenance-envelope`,
        permission_envelope_ref: `${request.agent_context_request_id}:local-deterministic-permission-envelope`,
        audit_envelope_ref: `${request.agent_context_request_id}:local-deterministic-audit-envelope`,
        generated_at: now
      });

      const response = builder.materializeResponse({
        request,
        adapter_result,
        served_at: now
      });

      return {
        request,
        adapter_result,
        response
      };
    }
  });

export const createDeterministicLocalContextSourceAdapterContracts =
  (input?: LocalDeterministicContextSourceAdapterContractsInputShape): LocalDeterministicContextSourceAdapterContractsResultShape =>
    createLocalDeterministicContextSourceAdapterContractsBuilder().create(input);
