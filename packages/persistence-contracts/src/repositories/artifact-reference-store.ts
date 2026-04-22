import type { ArtifactRefId } from "@orchestrator/core-foundation";
import type { ArtifactReference } from "@orchestrator/core-domain";
import type { BaseQuery } from "../contracts/query.js";
import type { Repository } from "../contracts/repository.js";

export interface ArtifactReferenceQuery extends BaseQuery {
  artifact_type?: string;
  source_system?: string;
}

export interface ArtifactReferenceStore
  extends Repository<ArtifactReference, ArtifactRefId, ArtifactReferenceQuery> {}
