import type { PolicyRecord } from "@orchestrator/core-domain";
import type { AuditStore, EvaluationStore } from "@orchestrator/persistence-contracts";
import type { CandidateGovernanceContext, DecisioningResult, GovernanceDomain } from "./types.js";

export interface PolicyProviderContract {
  get_active_policies(domain: GovernanceDomain): Promise<PolicyRecord[]>;
}

export interface GovernanceAuditEmitterContract {
  emit_governance_decision(decision: DecisioningResult): Promise<void>;
}

export interface GovernanceEvaluationCollectorContract {
  collect_decision_metrics(decision: DecisioningResult): Promise<void>;
}

export interface GovernancePersistenceContracts {
  audit_store?: AuditStore;
  evaluation_store?: EvaluationStore;
}

export interface GovernanceHelperContext {
  candidate_context?: CandidateGovernanceContext;
  policy_provider?: PolicyProviderContract;
  audit_emitter?: GovernanceAuditEmitterContract;
  evaluation_collector?: GovernanceEvaluationCollectorContract;
}
