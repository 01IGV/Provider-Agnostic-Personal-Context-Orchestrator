import type { StateId, StateStatus, StateType } from "@orchestrator/core-foundation";
import type { StateObject } from "@orchestrator/core-domain";
import type { BaseQuery } from "../contracts/query.js";
import type { Repository } from "../contracts/repository.js";

export interface StateQuery extends BaseQuery {
  state_types?: StateType[];
  statuses?: StateStatus[];
  only_active?: boolean;
}

export interface StateStore extends Repository<StateObject, StateId, StateQuery> {}
