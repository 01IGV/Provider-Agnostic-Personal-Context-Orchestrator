import type { AuditId, DecisionId, EventId } from "@orchestrator/core-foundation";
import type { CanonicalEntityDiscriminator } from "../discriminators.js";
import type { DomainEntityId } from "./shared.js";

export const AUDIT_TYPES = [
  "bundle_selection_audit",
  "write_decision_audit",
  "policy_audit",
  "handoff_generation_audit"
] as const;

export type AuditType = (typeof AUDIT_TYPES)[number];

export interface AuditRecord extends CanonicalEntityDiscriminator<"governance", "audit_record"> {
  audit_id: AuditId;
  audit_type: AuditType;
  related_record_ids: DomainEntityId[];
  event_id?: EventId;
  decision_id?: DecisionId;
  summary: string;
  details: Record<string, unknown>;
  created_at: string;
  actor_type: string;
  actor_id?: string;
}
