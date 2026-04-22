import type { AuditId } from "@orchestrator/core-foundation";
import type { AuditRecord } from "@orchestrator/core-domain";
import type { BaseQuery } from "../contracts/query.js";
import type { Repository } from "../contracts/repository.js";

export interface AuditQuery extends BaseQuery {
  audit_types?: AuditRecord["audit_type"][];
  related_record_id?: string;
}

export interface AuditStore extends Repository<AuditRecord, AuditId, AuditQuery> {}
