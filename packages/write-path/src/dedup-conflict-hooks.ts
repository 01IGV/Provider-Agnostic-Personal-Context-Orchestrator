import type { MemoryStore, StateStore } from "@orchestrator/persistence-contracts";
import type { ConflictEvaluator, DedupEvaluator } from "@orchestrator/governance";
import type { DomainEntityId } from "@orchestrator/core-domain";
import type { CandidateClassificationResult, CandidateDedupConflictLink, ExtractedCandidateDraft } from "./types.js";

export interface DedupConflictAnalysisInput {
  candidate: ExtractedCandidateDraft;
  classification: CandidateClassificationResult;
}

export interface DedupConflictHooks {
  analyze(input: DedupConflictAnalysisInput): Promise<CandidateDedupConflictLink>;
}

export interface DedupConflictPorts {
  memory_store?: MemoryStore;
  state_store?: StateStore;
}

const signature = (value: unknown): string => JSON.stringify(value);

export const createDedupConflictHooks = (
  dedup_evaluator: DedupEvaluator,
  conflict_evaluator: ConflictEvaluator,
  ports: DedupConflictPorts = {}
): DedupConflictHooks => {
  return {
    async analyze(input: DedupConflictAnalysisInput): Promise<CandidateDedupConflictLink> {
      if (!input.classification.requires_dedup_check && !input.classification.requires_conflict_check) {
        return { candidate_id: input.candidate.candidate_id };
      }

      const existingSignatures: Array<{ record_id: DomainEntityId; signature: string }> = [];
      const conflictingRecordIds: DomainEntityId[] = [];

      if (input.classification.route_family === "canonical_memory_write" && ports.memory_store) {
        const result = await ports.memory_store.query({
          subject_id: input.candidate.subject_id,
          scope_id: input.candidate.scope_id
        });

        for (const item of result.items) {
          existingSignatures.push({ record_id: item.memory_id as DomainEntityId, signature: signature(item.content) });
          conflictingRecordIds.push(item.memory_id as DomainEntityId);
        }
      }

      if (input.classification.route_family === "canonical_state_write" && ports.state_store) {
        const result = await ports.state_store.query({
          subject_id: input.candidate.subject_id,
          scope_id: input.candidate.scope_id
        });

        for (const item of result.items) {
          existingSignatures.push({ record_id: item.state_id as DomainEntityId, signature: signature(item.content) });
          conflictingRecordIds.push(item.state_id as DomainEntityId);
        }
      }

      const dedup = dedup_evaluator.evaluate({
        ...((input.candidate.proposed_metadata.dedup_key as string | undefined)
          ? { dedup_key: input.candidate.proposed_metadata.dedup_key as string }
          : {}),
        candidate_signature: signature(input.candidate.content),
        existing_signatures: existingSignatures.map((x) => ({
          record_id: x.record_id,
          signature: x.signature
        }))
      });

      const conflict = conflict_evaluator.evaluate({
        ...(dedup.matched_record_id ? { candidate_record_id: dedup.matched_record_id } : {}),
        conflicting_record_ids: conflictingRecordIds,
        conflict_severity: conflictingRecordIds.length > 3 ? "high" : conflictingRecordIds.length > 0 ? "medium" : "low"
      });

      return {
        candidate_id: input.candidate.candidate_id,
        dedup,
        conflict
      };
    }
  };
};
