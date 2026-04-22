import type { DeleteResult, PersistResult, QueryResult } from "./results.js";

export interface ReadRepository<TRecord, TId, TQuery> {
  get_by_id(id: TId): Promise<TRecord | undefined>;
  query(query: TQuery): Promise<QueryResult<TRecord>>;
}

export interface WriteRepository<TRecord, TId> {
  upsert(record: TRecord): Promise<PersistResult<TRecord>>;
  delete_by_id(id: TId): Promise<DeleteResult>;
}

export type Repository<TRecord, TId, TQuery> = ReadRepository<TRecord, TId, TQuery> &
  WriteRepository<TRecord, TId>;
