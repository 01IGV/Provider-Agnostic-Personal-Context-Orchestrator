import type { DomainEntityId, DomainEntityType, RelationEdge } from "@orchestrator/core-domain";
import type { RelationId, RelationType } from "@orchestrator/core-foundation";
import type { BaseQuery } from "../contracts/query.js";
import type { Repository } from "../contracts/repository.js";

export interface RelationQuery extends BaseQuery {
  from_entity_type?: DomainEntityType;
  from_entity_id?: DomainEntityId;
  to_entity_type?: DomainEntityType;
  to_entity_id?: DomainEntityId;
  relation_types?: RelationType[];
}

export interface RelationStore extends Repository<RelationEdge, RelationId, RelationQuery> {}
