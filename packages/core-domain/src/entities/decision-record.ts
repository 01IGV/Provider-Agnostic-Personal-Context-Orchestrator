import type { CandidateId, DecisionId, DecisionOutcome } from "@orchestrator/core-foundation";
import type { CanonicalEntityDiscriminator } from "../discriminators.js";
import type { DomainEntityId } from "./shared.js";

export interface DecisionRecord extends CanonicalEntityDiscriminator<"governance", "decision_record"> {
  decision_id: DecisionId;
  decision_type: string;
  candidate_id?: CandidateId;
  target_record_id?: DomainEntityId;
  decision_outcome: DecisionOutcome;
  applied_policy_rules: string[];
  reasoning_summary: string;
  decided_at: string;
  decided_by_actor_type: string;
  decided_by_actor_id?: string;
}
