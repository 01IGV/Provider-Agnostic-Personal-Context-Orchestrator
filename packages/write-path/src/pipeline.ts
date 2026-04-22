import type {
  CandidateAdmissibilityLink,
  CandidateDedupConflictLink,
  CandidateDecisionLink,
  RawWritebackInput,
  WritePathRunResult
} from "./types.js";
import type { CandidateClassifier } from "./candidate-classification.js";
import type { CandidateExtractor } from "./candidate-extraction.js";
import type { DecisionRouter } from "./decision-routing.js";
import type { DedupConflictHooks } from "./dedup-conflict-hooks.js";
import type { DecisioningGovernanceHook, EligibilityGovernanceHook } from "./governance-hooks.js";
import type { MutationPlanner } from "./mutation-plan.js";
import type { WritebackIntaker } from "./writeback-intake.js";

export interface WritePathPrimitivePipelineDeps {
  writeback_intaker: WritebackIntaker;
  candidate_extractor: CandidateExtractor;
  candidate_classifier: CandidateClassifier;
  eligibility_hook: EligibilityGovernanceHook;
  dedup_conflict_hooks: DedupConflictHooks;
  decisioning_hook: DecisioningGovernanceHook;
  decision_router: DecisionRouter;
  mutation_planner: MutationPlanner;
}

export interface WritePathPrimitivePipeline {
  run(raw: RawWritebackInput): Promise<WritePathRunResult>;
}

export const createWritePathPrimitivePipeline = (
  deps: WritePathPrimitivePipelineDeps
): WritePathPrimitivePipeline => {
  return {
    async run(raw: RawWritebackInput): Promise<WritePathRunResult> {
      const envelope = deps.writeback_intaker.normalize({ raw });
      const extracted = deps.candidate_extractor.extract({ envelope });
      const classifications = deps.candidate_classifier.classify({
        extracted_candidates: extracted.extracted_candidates
      });

      const admissibilityLinks: CandidateAdmissibilityLink[] = [];
      const dedupConflictLinks: CandidateDedupConflictLink[] = [];
      const decisionLinks: CandidateDecisionLink[] = [];

      for (const candidate of extracted.extracted_candidates) {
        const classification = classifications.classifications.find(
          (entry) => entry.candidate_id === candidate.candidate_id
        );

        if (!classification) {
          continue;
        }

        const admissibilityLink = deps.eligibility_hook.evaluate({ candidate });
        admissibilityLinks.push(admissibilityLink);

        const dedupConflictLink = await deps.dedup_conflict_hooks.analyze({
          candidate,
          classification
        });
        dedupConflictLinks.push(dedupConflictLink);

        const decisionLink = deps.decisioning_hook.decide({
          candidate,
          classification,
          admissibility_link: admissibilityLink,
          dedup_conflict_link: dedupConflictLink
        });
        decisionLinks.push(decisionLink);
      }

      const decisionRoutes = decisionLinks.map((link) => {
        const candidate = extracted.extracted_candidates.find((x) => x.candidate_id === link.candidate_id);
        if (!candidate) {
          throw new Error(`Missing candidate for decision link: ${String(link.candidate_id)}`);
        }

        return deps.decision_router.route({ candidate, decision_link: link });
      });

      const mutationPlan = deps.mutation_planner.plan({ routes: decisionRoutes });

      return {
        writeback_envelope: envelope,
        extracted_candidate_set: extracted,
        classifications,
        admissibility_links: admissibilityLinks,
        dedup_conflict_links: dedupConflictLinks,
        decision_routes: decisionRoutes,
        mutation_plan: mutationPlan
      };
    }
  };
};
