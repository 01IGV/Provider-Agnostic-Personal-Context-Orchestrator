import type { HandoffId, HandoffType } from "@orchestrator/core-foundation";
import type { HandoffArtifact } from "@orchestrator/core-domain";
import type { BaseQuery } from "../contracts/query.js";
import type { Repository } from "../contracts/repository.js";

export interface HandoffQuery extends BaseQuery {
  handoff_types?: HandoffType[];
  source_context_type?: string;
  target_context_type?: string;
}

export interface HandoffStore extends Repository<HandoffArtifact, HandoffId, HandoffQuery> {}
