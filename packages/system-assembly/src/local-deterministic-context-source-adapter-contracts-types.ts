import type { IsoDateTimeString } from "@orchestrator/core-foundation";
import type {
  AgentContextRequestBoundaryShape,
  BoundedContextResponseEnvelopeShape,
  LocalDeterministicContextSourceAdapterResultShape
} from "@orchestrator/integration-contracts";
import type { FirstAgentContextRequestBoundaryResultShape } from "./first-agent-context-request-boundary-types.js";

export interface LocalDeterministicContextSourceAdapterContractsInputShape {
  agent_context_boundary?: FirstAgentContextRequestBoundaryResultShape;
  now?: IsoDateTimeString;
}

export interface LocalDeterministicContextSourceAdapterContractsResultShape {
  request: AgentContextRequestBoundaryShape;
  adapter_result: LocalDeterministicContextSourceAdapterResultShape;
  response: BoundedContextResponseEnvelopeShape;
}

export interface LocalDeterministicContextSourceAdapterContractsBuilder {
  create(
    input?: LocalDeterministicContextSourceAdapterContractsInputShape
  ): LocalDeterministicContextSourceAdapterContractsResultShape;
}
