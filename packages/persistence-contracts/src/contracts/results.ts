export interface QueryResult<TRecord> {
  items: TRecord[];
  next_cursor?: string;
  total_count?: number;
}

export interface PersistResult<TRecord> {
  record: TRecord;
  created: boolean;
}

export interface DeleteResult {
  deleted: boolean;
}

export interface ExistsResult {
  exists: boolean;
}
