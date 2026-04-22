import {
  asCanonicalId,
  type AuditId,
  type CanonicalRecordVersion,
  type IsoDateTimeString
} from "@orchestrator/core-foundation";
import type { EvaluationId, EvaluationRecord } from "@orchestrator/persistence-contracts";
import type { CanonicalAuditRecord } from "./audit-traces.js";
import type { CanonicalEvaluationResult } from "./evaluation-results.js";
import type { AuditComponent, AuditTraceContext } from "./types.js";
import { QUALITY_DIMENSIONS, type EvaluationFinding } from "./vocabularies.js";

export interface AuditRecordBuilderInput<TRecord extends CanonicalAuditRecord> {
  component: AuditComponent;
  summary: string;
  details: TRecord["details"];
  context: AuditTraceContext;
  actor: TRecord["actor"];
  related_entities: TRecord["related_entities"];
  audit_id?: AuditId;
  created_at?: IsoDateTimeString;
}

export interface EvaluationRecordBuilderInput<T extends CanonicalEvaluationResult> {
  evaluation_id?: EvaluationId;
  result: T;
  created_at: IsoDateTimeString;
  version: number;
}

const buildAuditId = (component: AuditComponent, createdAt: IsoDateTimeString): AuditId => {
  return asCanonicalId<"audit_id">(`${component}:${createdAt}`);
};

export const createAuditRecordBuilder = <TRecord extends CanonicalAuditRecord>() => {
  return {
    build(input: AuditRecordBuilderInput<TRecord>): TRecord {
      const createdAt = input.created_at ?? input.context.created_at;
      const auditId = input.audit_id ?? buildAuditId(input.component, createdAt);

      return {
        audit_id: auditId,
        audit_component: input.component,
        summary: input.summary,
        details: input.details,
        context: input.context,
        actor: input.actor,
        related_entities: input.related_entities,
        created_at: createdAt
      } as TRecord;
    }
  };
};

const metricsFromPoints = (result: CanonicalEvaluationResult): Record<string, number> => {
  return result.metric_points.reduce<Record<string, number>>((acc, metric) => {
    acc[metric.key] = metric.value;
    return acc;
  }, {});
};

const findingsToText = (findings: EvaluationFinding[]): string[] => {
  return findings.map((finding) => `${finding.code}:${finding.summary}`);
};

export const createEvaluationRecordBuilder = <T extends CanonicalEvaluationResult>() => {
  return {
    build(input: EvaluationRecordBuilderInput<T>): EvaluationRecord {
      const evaluationId = input.evaluation_id ?? (`evaluation_${input.created_at}` as EvaluationId);
      const scope = input.result.scope;

      return {
        evaluation_id: evaluationId,
        evaluation_type: input.result.evaluation_type,
        evaluation_scope: scope.evaluation_scope,
        ...(scope.related_request_ids ? { related_request_ids: scope.related_request_ids } : {}),
        ...(scope.related_session_ids ? { related_session_ids: scope.related_session_ids } : {}),
        ...(scope.related_workflow_ids ? { related_workflow_ids: scope.related_workflow_ids } : {}),
        ...(scope.subject_id ? { subject_id: scope.subject_id } : {}),
        ...(scope.client_id ? { client_id: scope.client_id } : {}),
        ...(scope.provider ? { provider: scope.provider } : {}),
        metrics: {
          ...metricsFromPoints(input.result),
          ...input.result.metrics
        },
        findings: findingsToText(input.result.findings),
        created_at: input.created_at,
        ...(scope.time_window ? { time_window: scope.time_window } : {}),
        version: input.version as CanonicalRecordVersion
      };
    }
  };
};

export const createQualityDimensionScoringTemplate = (): Record<(typeof QUALITY_DIMENSIONS)[number], number> => {
  return {
    relevance: 0,
    boundedness: 0,
    continuity: 0,
    write_quality: 0,
    handoff_quality: 0,
    governance_quality: 0,
    provider_neutrality: 0,
    operational_stability: 0
  };
};
