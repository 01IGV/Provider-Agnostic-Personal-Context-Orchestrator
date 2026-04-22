import type { BundleId } from "@orchestrator/core-foundation";
import type { ContextBundle } from "@orchestrator/core-domain";
import type { BaseQuery } from "../contracts/query.js";
import type { Repository } from "../contracts/repository.js";

export interface BundleQuery extends BaseQuery {
  bundle_type?: string;
  target_runtime?: string;
  target_provider?: string;
  target_model?: string;
}

export interface BundleStore extends Repository<ContextBundle, BundleId, BundleQuery> {}
