import type { MemoryId, MemoryStatus, MemoryType, VisibilityType } from "@orchestrator/core-foundation";
import type { MemoryObject } from "@orchestrator/core-domain";
import type { BaseQuery } from "../contracts/query.js";
import type { Repository } from "../contracts/repository.js";

export interface MemoryQuery extends BaseQuery {
  memory_types?: MemoryType[];
  statuses?: MemoryStatus[];
  visibility?: VisibilityType[];
  dedup_key?: string;
}

export interface MemoryStore extends Repository<MemoryObject, MemoryId, MemoryQuery> {}
