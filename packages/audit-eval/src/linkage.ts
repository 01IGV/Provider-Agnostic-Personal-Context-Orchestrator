import type { AuditId, IsoDateTimeString, OperationalContour } from "@orchestrator/core-foundation";
import type { DomainEntityId } from "@orchestrator/core-domain";
import type { EvaluationId } from "@orchestrator/persistence-contracts";

export interface ContourSpanLink {
  contour: OperationalContour | "cross_contour";
  source_record_ids: DomainEntityId[];
  target_record_ids: DomainEntityId[];
  rationale: string;
}

export interface AuditEvaluationLinkage {
  linkage_id: `${string}:${string}`;
  audit_id: AuditId;
  evaluation_id: EvaluationId;
  contour_links: ContourSpanLink[];
  linked_at: IsoDateTimeString;
  linkage_notes?: string[];
}

export interface ProvenanceLineageLink {
  artifact_kind: "context_bundle" | "summary_artifact" | "handoff_artifact";
  artifact_id: string;
  parent_artifact_id?: string;
  source_record_ids: DomainEntityId[];
  source_event_ids: string[];
  generated_at: IsoDateTimeString;
  generation_mode?: string;
}
