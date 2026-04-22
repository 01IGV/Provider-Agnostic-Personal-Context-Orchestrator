import type {
  CanonicalRecordVersion,
  ClientId,
  IsoDateTimeString,
  SubjectId
} from "@orchestrator/core-foundation";

export type EvaluationId = `evaluation_${string}`;

export const EVALUATION_TYPES = [
  "relevance_evaluation",
  "boundedness_evaluation",
  "continuity_evaluation",
  "write_quality_evaluation",
  "handoff_quality_evaluation",
  "governance_quality_evaluation",
  "provider_neutrality_evaluation",
  "operational_stability_evaluation"
] as const;

export type EvaluationType = (typeof EVALUATION_TYPES)[number];

export interface EvaluationTimeWindow {
  from?: IsoDateTimeString;
  to?: IsoDateTimeString;
}

export interface EvaluationRecord {
  evaluation_id: EvaluationId;
  evaluation_type: EvaluationType;
  evaluation_scope: string;
  related_request_ids?: string[];
  related_session_ids?: string[];
  related_workflow_ids?: string[];
  subject_id?: SubjectId;
  client_id?: ClientId;
  provider?: string;
  metrics: Record<string, number>;
  findings: string[];
  created_at: IsoDateTimeString;
  time_window?: EvaluationTimeWindow;
  version: CanonicalRecordVersion;
}
