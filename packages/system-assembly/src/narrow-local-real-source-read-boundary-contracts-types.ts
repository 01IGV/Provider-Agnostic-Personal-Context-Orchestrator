import type { IsoDateTimeString } from "@orchestrator/core-foundation";
import type {
  AgentContextRequestBoundaryShape,
  BoundedRealSourceAdapterContractShape,
  NarrowLocalRealSourceReadBoundaryShape
} from "@orchestrator/integration-contracts";
import type { FirstAgentContextRequestBoundaryResultShape } from "./first-agent-context-request-boundary-types.js";

export interface NarrowLocalRealSourceReadBoundaryContractsInputShape {
  agent_context_boundary?: FirstAgentContextRequestBoundaryResultShape;
  request?: AgentContextRequestBoundaryShape;
  bounded_real_source_adapter_contract?: BoundedRealSourceAdapterContractShape;
  now?: IsoDateTimeString;
}

export interface NarrowLocalRealSourceReadBoundaryContractsResultShape {
  request: AgentContextRequestBoundaryShape;
  bounded_real_source_adapter_contract: BoundedRealSourceAdapterContractShape;
  narrow_local_real_source_read_boundary: NarrowLocalRealSourceReadBoundaryShape;
}

export interface NarrowLocalRealSourceReadBoundaryContractsBuilder {
  create(
    input?: NarrowLocalRealSourceReadBoundaryContractsInputShape
  ): NarrowLocalRealSourceReadBoundaryContractsResultShape;
}
