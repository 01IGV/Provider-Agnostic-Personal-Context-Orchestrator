import type { RelationId, RelationType, SharedLifecycleStatus } from "@orchestrator/core-foundation";
import type { CanonicalEntityDiscriminator, DomainEntityType } from "../discriminators.js";
import type { DomainEntityId } from "./shared.js";

export interface RelationEdge extends CanonicalEntityDiscriminator<"relationship", "relation_edge"> {
  relation_id: RelationId;
  from_entity_type: DomainEntityType;
  from_entity_id: DomainEntityId;
  relation_type: RelationType;
  to_entity_type: DomainEntityType;
  to_entity_id: DomainEntityId;
  weight?: number;
  created_at: string;
  updated_at: string;
  status: SharedLifecycleStatus;
  source_ref?: string;
}
