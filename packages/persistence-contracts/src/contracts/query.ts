import type {
  ClientId,
  IsoDateTimeString,
  ScopeId,
  SessionId,
  SubjectId,
  WorkflowId
} from "@orchestrator/core-foundation";

export interface TimeRange {
  from?: IsoDateTimeString;
  to?: IsoDateTimeString;
}

export interface PaginationQuery {
  limit?: number;
  offset?: number;
  cursor?: string;
}

export interface SortSpec {
  field: string;
  direction?: "asc" | "desc";
}

export interface ScopeBoundQuery {
  subject_id?: SubjectId;
  scope_id?: ScopeId;
  session_id?: SessionId;
  workflow_id?: WorkflowId;
  client_id?: ClientId;
}

export interface BaseQuery extends ScopeBoundQuery {
  time_range?: TimeRange;
  sort?: SortSpec[];
  pagination?: PaginationQuery;
}
