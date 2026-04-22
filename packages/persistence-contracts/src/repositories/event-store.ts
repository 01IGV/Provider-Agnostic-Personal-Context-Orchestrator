import type { CorrelationId, EventId } from "@orchestrator/core-foundation";
import type { CanonicalEvent } from "@orchestrator/core-domain";
import type { BaseQuery } from "../contracts/query.js";
import type { Repository } from "../contracts/repository.js";

export interface EventQuery extends BaseQuery {
  event_types?: string[];
  actor_type?: string;
  correlation_id?: CorrelationId;
}

export interface EventStore extends Repository<CanonicalEvent, EventId, EventQuery> {
  append(event: CanonicalEvent): Promise<void>;
}
