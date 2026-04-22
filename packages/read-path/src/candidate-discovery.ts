import type {
  ArtifactReference,
  CandidateRecord,
  CanonicalEvent,
  ContextBundle,
  HandoffArtifact,
  MemoryObject,
  RelationEdge,
  StateObject,
  SummaryArtifact
} from "@orchestrator/core-domain";
import type {
  ArtifactReferenceStore,
  BundleStore,
  EventStore,
  HandoffStore,
  MemoryStore,
  RelationStore,
  StateStore,
  SummaryStore
} from "@orchestrator/persistence-contracts";
import type { BaseQuery } from "@orchestrator/persistence-contracts";

export const CANDIDATE_SOURCE_FAMILIES = [
  "memory_objects",
  "state_objects",
  "events",
  "summaries",
  "handoffs",
  "artifact_references",
  "relation_edges",
  "prior_bundles"
] as const;

export type CandidateSourceFamily = (typeof CANDIDATE_SOURCE_FAMILIES)[number];

export type ReadCandidateRecord =
  | MemoryObject
  | StateObject
  | CanonicalEvent
  | SummaryArtifact
  | HandoffArtifact
  | ArtifactReference
  | RelationEdge
  | ContextBundle
  | CandidateRecord;

export interface CandidatePoolEntry {
  source_family: CandidateSourceFamily;
  record_id: string;
  record: ReadCandidateRecord;
  discovery_reason: string;
}

export interface CandidatePool {
  entries: CandidatePoolEntry[];
}

export interface CandidateDiscoveryInput {
  query: BaseQuery;
}

export interface CandidateDiscoveryPorts {
  memory_store?: MemoryStore;
  state_store?: StateStore;
  event_store?: EventStore;
  summary_store?: SummaryStore;
  handoff_store?: HandoffStore;
  artifact_reference_store?: ArtifactReferenceStore;
  relation_store?: RelationStore;
  bundle_store?: BundleStore;
}

export interface CandidateDiscovery {
  discover(input: CandidateDiscoveryInput): Promise<CandidatePool>;
}

export const createCandidateDiscovery = (ports: CandidateDiscoveryPorts): CandidateDiscovery => {
  return {
    async discover(input: CandidateDiscoveryInput): Promise<CandidatePool> {
      const entries: CandidatePoolEntry[] = [];

      if (ports.memory_store) {
        const result = await ports.memory_store.query(input.query);
        entries.push(
          ...result.items.map((record) => ({
            source_family: "memory_objects" as const,
            record_id: record.memory_id,
            record,
            discovery_reason: "scope_lookup"
          }))
        );
      }

      if (ports.state_store) {
        const result = await ports.state_store.query(input.query);
        entries.push(
          ...result.items.map((record) => ({
            source_family: "state_objects" as const,
            record_id: record.state_id,
            record,
            discovery_reason: "active_state_lookup"
          }))
        );
      }

      if (ports.event_store) {
        const result = await ports.event_store.query(input.query);
        entries.push(
          ...result.items.map((record) => ({
            source_family: "events" as const,
            record_id: record.event_id,
            record,
            discovery_reason: "recent_event_lookup"
          }))
        );
      }

      if (ports.summary_store) {
        const result = await ports.summary_store.query(input.query);
        entries.push(
          ...result.items.map((record) => ({
            source_family: "summaries" as const,
            record_id: record.summary_id,
            record,
            discovery_reason: "derived_summary_lookup"
          }))
        );
      }

      if (ports.handoff_store) {
        const result = await ports.handoff_store.query(input.query);
        entries.push(
          ...result.items.map((record) => ({
            source_family: "handoffs" as const,
            record_id: record.handoff_id,
            record,
            discovery_reason: "handoff_first_retrieval"
          }))
        );
      }

      if (ports.artifact_reference_store) {
        const result = await ports.artifact_reference_store.query(input.query);
        entries.push(
          ...result.items.map((record) => ({
            source_family: "artifact_references" as const,
            record_id: record.artifact_ref_id,
            record,
            discovery_reason: "artifact_lookup"
          }))
        );
      }

      if (ports.relation_store) {
        const result = await ports.relation_store.query(input.query);
        entries.push(
          ...result.items.map((record) => ({
            source_family: "relation_edges" as const,
            record_id: record.relation_id,
            record,
            discovery_reason: "relation_traversal"
          }))
        );
      }

      if (ports.bundle_store) {
        const result = await ports.bundle_store.query(input.query);
        entries.push(
          ...result.items.map((record) => ({
            source_family: "prior_bundles" as const,
            record_id: record.bundle_id,
            record,
            discovery_reason: "prior_bundle_metadata_lookup"
          }))
        );
      }

      return { entries };
    }
  };
};
