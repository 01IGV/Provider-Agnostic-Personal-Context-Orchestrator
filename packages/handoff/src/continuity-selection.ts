import { asCanonicalId, type ScopeId, type SubjectId } from "@orchestrator/core-foundation";
import type { DomainEntityId } from "@orchestrator/core-domain";
import type {
  ArtifactReferenceStore,
  BundleStore,
  HandoffStore,
  MemoryStore,
  StateStore,
  SummaryStore
} from "@orchestrator/persistence-contracts";
import type { HandoffTargetBoundaryResult, ContinuityCandidate, ContinuityCandidateSet } from "./types.js";

export interface ContinuitySelectionInput {
  subject_id: string;
  scope_id: string;
  target_boundary: HandoffTargetBoundaryResult;
}

export interface ContinuitySelectionPorts {
  state_store?: StateStore;
  memory_store?: MemoryStore;
  summary_store?: SummaryStore;
  artifact_reference_store?: ArtifactReferenceStore;
  bundle_store?: BundleStore;
  handoff_store?: HandoffStore;
}

export interface ContinuityCandidateSelector {
  select(input: ContinuitySelectionInput): Promise<ContinuityCandidateSet>;
}

const cap = (candidates: ContinuityCandidate[], max: number): ContinuityCandidateSet => {
  const sorted = [...candidates].sort((a, b) => b.continuity_weight - a.continuity_weight);
  const kept = sorted.slice(0, max);
  const omitted = sorted.slice(max);

  return {
    candidates: kept,
    omitted_record_ids: omitted.map((x) => x.record_id),
    omission_notes: omitted.length > 0 ? [`bounded_trim:${omitted.length}`] : []
  };
};

export const createContinuityCandidateSelector = (
  ports: ContinuitySelectionPorts
): ContinuityCandidateSelector => {
  return {
    async select(input: ContinuitySelectionInput): Promise<ContinuityCandidateSet> {
      const candidates: ContinuityCandidate[] = [];
      const subjectId = asCanonicalId<"subject_id">(input.subject_id) as SubjectId;
      const scopeId = asCanonicalId<"scope_id">(input.scope_id) as ScopeId;

      if (ports.state_store) {
        const states = await ports.state_store.query({
          subject_id: subjectId,
          scope_id: scopeId,
          only_active: true
        });

        for (const state of states.items) {
          candidates.push({
            record_id: state.state_id as DomainEntityId,
            family: "active_state",
            content: state.content,
            continuity_weight: 1,
            rationale: "active_state_continuity"
          });
        }
      }

      if (ports.memory_store) {
        const memories = await ports.memory_store.query({
          subject_id: subjectId,
          scope_id: scopeId,
          statuses: ["active"]
        });

        for (const memory of memories.items) {
          candidates.push({
            record_id: memory.memory_id as DomainEntityId,
            family: "relevant_memory",
            content: memory.content,
            continuity_weight: memory.importance,
            rationale: "durable_memory_continuity"
          });
        }
      }

      if (ports.summary_store) {
        const summaries = await ports.summary_store.query({
          subject_id: subjectId,
          scope_id: scopeId
        });

        for (const summary of summaries.items) {
          candidates.push({
            record_id: summary.summary_id as DomainEntityId,
            family: "recent_summaries",
            content: summary.content,
            continuity_weight: 0.7,
            rationale: "summary_bridge"
          });
        }
      }

      if (ports.artifact_reference_store) {
        const artifactRefs = await ports.artifact_reference_store.query({
          subject_id: subjectId,
          scope_id: scopeId
        });

        for (const artifact of artifactRefs.items) {
          candidates.push({
            record_id: artifact.artifact_ref_id as DomainEntityId,
            family: "artifact_refs",
            content: {
              locator: artifact.locator,
              artifact_type: artifact.artifact_type,
              ...(artifact.title ? { title: artifact.title } : {}),
              ...(artifact.description ? { description: artifact.description } : {}),
              source_system: artifact.source_system
            },
            continuity_weight: 0.6,
            rationale: "artifact_pointer_for_transfer"
          });
        }
      }

      if (ports.bundle_store) {
        const bundles = await ports.bundle_store.query({
          subject_id: subjectId,
          scope_id: scopeId
        });

        for (const bundle of bundles.items) {
          candidates.push({
            record_id: bundle.bundle_id as DomainEntityId,
            family: "recent_bundles",
            content: { bundle_type: bundle.bundle_type, purpose: bundle.purpose },
            continuity_weight: 0.4,
            rationale: "recent_bundle_context_trace"
          });
        }
      }

      if (ports.handoff_store) {
        const handoffs = await ports.handoff_store.query({
          subject_id: subjectId,
          scope_id: scopeId,
          target_context_type: input.target_boundary.target_context_type
        });

        for (const handoff of handoffs.items) {
          candidates.push({
            record_id: handoff.handoff_id as DomainEntityId,
            family: "recent_handoffs",
            content: handoff.content,
            continuity_weight: 0.3,
            rationale: "previous_handoff_reference"
          });
        }
      }

      return cap(candidates, 25);
    }
  };
};
