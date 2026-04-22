import type { BaseQuery } from "../contracts/query.js";
import type { Repository } from "../contracts/repository.js";
import type { EvaluationId, EvaluationRecord, EvaluationType } from "../contracts/evaluation-record.js";

export interface EvaluationQuery extends BaseQuery {
  evaluation_types?: EvaluationType[];
  provider?: string;
}

export interface EvaluationStore
  extends Repository<EvaluationRecord, EvaluationId, EvaluationQuery> {}
