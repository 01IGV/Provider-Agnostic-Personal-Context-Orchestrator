import type { DomainEntityId, DomainEntityType } from "@orchestrator/core-domain";
import type { BaseQuery } from "../contracts/query.js";
import type { DeleteResult, PersistResult, QueryResult } from "../contracts/results.js";

export type IndexEntryId = `index_${string}`;

export interface IndexEntry {
  index_entry_id: IndexEntryId;
  index_type: string;
  key: string;
  record_id: DomainEntityId;
  record_type: DomainEntityType;
  score?: number;
  metadata?: Record<string, unknown>;
}

export interface IndexQuery extends BaseQuery {
  index_type?: string;
  key?: string;
  record_type?: DomainEntityType;
  limit?: number;
}

export interface IndexStore {
  get_by_id(id: IndexEntryId): Promise<IndexEntry | undefined>;
  query(query: IndexQuery): Promise<QueryResult<IndexEntry>>;
  upsert(entry: IndexEntry): Promise<PersistResult<IndexEntry>>;
  delete_by_id(id: IndexEntryId): Promise<DeleteResult>;
}
