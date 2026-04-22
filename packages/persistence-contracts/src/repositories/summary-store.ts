import type { SummaryId, SummaryType } from "@orchestrator/core-foundation";
import type { SummaryArtifact } from "@orchestrator/core-domain";
import type { BaseQuery } from "../contracts/query.js";
import type { Repository } from "../contracts/repository.js";

export interface SummaryQuery extends BaseQuery {
  summary_types?: SummaryType[];
}

export interface SummaryStore extends Repository<SummaryArtifact, SummaryId, SummaryQuery> {}
