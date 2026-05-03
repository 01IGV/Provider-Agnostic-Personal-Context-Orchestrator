import type { IsoDateTimeString } from "@orchestrator/core-foundation";
import type {
  AgentContextRequestBoundaryShape,
  BoundedRealSourceAdapterContractShape,
  LocalDeterministicContextSourceAdapterResultShape
} from "@orchestrator/integration-contracts";
import type { FirstAgentContextRequestBoundaryResultShape } from "./first-agent-context-request-boundary-types.js";

export interface BoundedRealSourceAdapterContractInputShape {
  agent_context_boundary?: FirstAgentContextRequestBoundaryResultShape;
  request?: AgentContextRequestBoundaryShape;
  local_adapter_result?: LocalDeterministicContextSourceAdapterResultShape;
  now?: IsoDateTimeString;
}

export interface BoundedRealSourceAdapterContractResultShape {
  request: AgentContextRequestBoundaryShape;
  local_adapter_result: LocalDeterministicContextSourceAdapterResultShape;
  bounded_real_source_adapter_contract: BoundedRealSourceAdapterContractShape;
}

export interface BoundedRealSourceAdapterContractBuilder {
  create(
    input?: BoundedRealSourceAdapterContractInputShape
  ): BoundedRealSourceAdapterContractResultShape;
}
