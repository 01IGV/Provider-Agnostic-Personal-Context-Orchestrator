import { asCanonicalId, type IsoDateTimeString } from "@orchestrator/core-foundation";
import {
  createLocalDeterministicContextSourceAdapterBuilder,
  type LocalDeterministicContextSourceItemShape
} from "@orchestrator/integration-contracts";
import { createDeterministicFirstAgentContextRequestBoundary } from "./first-agent-context-request-boundary.js";
import type {
  LocalDeterministicContextSourceAdapterContractsBuilder,
  LocalDeterministicContextSourceAdapterContractsInputShape,
  LocalDeterministicContextSourceAdapterContractsResultShape
} from "./local-deterministic-context-source-adapter-contracts-types.js";

const DEFAULT_LOCAL_DETERMINISTIC_SOURCE_TIME = "2026-04-27T00:00:00.000Z" as IsoDateTimeString;
const DEFAULT_SCOPE_ID = "scope:deterministic-agent-context-request";
const PROJECT_ORIENTATION_SCOPE_ID = "scope:project-orientation";
const ACTIVE_BOUNDARY_CHAIN_SCOPE_ID = "scope:active-boundary-chain";

const createDeterministicSourceItems = (
  request_id: string,
  requested_scope_hints: string[] = [DEFAULT_SCOPE_ID]
): LocalDeterministicContextSourceItemShape[] => {
  const sourceItems: LocalDeterministicContextSourceItemShape[] = [
  {
    source_item_id: `${request_id}:local-source-item:project-orientation`,
    source_ref: "local://deterministic/context/project-orientation",
    source_kind: "inline_seeded_context",
    scope_id: asCanonicalId<"scope_id">(PROJECT_ORIENTATION_SCOPE_ID),
    visibility: "subject_scoped",
    deterministic_order: 1,
    provenance_ref: `${request_id}:provenance:project-orientation`,
    permission_ref: `${request_id}:permission:project-orientation`,
    audit_ref: `${request_id}:audit:project-orientation`,
    content_digest: "sha256:local-deterministic-project-orientation-v1",
    content: {
      purpose: "AI-facing Context Authority Gateway",
      posture: "default-deny",
      runtime_execution_allowed_now: false
    }
  },
  {
    source_item_id: `${request_id}:local-source-item:active-boundary-chain`,
    source_ref: "local://deterministic/context/active-boundary-chain",
    source_kind: "local_fixture_context",
    scope_id: asCanonicalId<"scope_id">(ACTIVE_BOUNDARY_CHAIN_SCOPE_ID),
    visibility: "subject_scoped",
    deterministic_order: 2,
    provenance_ref: `${request_id}:provenance:active-boundary-chain`,
    permission_ref: `${request_id}:permission:active-boundary-chain`,
    audit_ref: `${request_id}:audit:active-boundary-chain`,
    content_digest: "sha256:local-deterministic-active-boundary-chain-v1",
    content: {
      chain: [
        "end-to-end non-executing proof",
        "invocation denial proof",
        "handler-boundary denial proof",
        "surface-boundary denial proof",
        "authority-boundary denial proof",
        "agent context request boundary"
      ],
      bounded_context_materialization: "local deterministic contract only"
    }
  }
  ];
  const requestedScopes = new Set(requested_scope_hints);

  if (requestedScopes.has(DEFAULT_SCOPE_ID)) {
    return sourceItems;
  }

  const selectedItems = sourceItems.filter((item) => requestedScopes.has(item.scope_id));

  return selectedItems.length > 0 ? selectedItems : sourceItems;
};

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
        source_items: createDeterministicSourceItems(
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
