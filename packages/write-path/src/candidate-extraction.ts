import { asCanonicalId } from "@orchestrator/core-foundation";
import type { ExtractedCandidateDraft, ExtractedCandidateSet, NormalizedWritebackEnvelope } from "./types.js";

interface RawCandidatePayload {
  candidate_type?: string;
  proposed_record_type?: string;
  scope_id?: string;
  owner_id?: string;
  content?: Record<string, unknown>;
  proposed_metadata?: Record<string, unknown>;
  why_store?: string;
}

export interface CandidateExtractionInput {
  envelope: NormalizedWritebackEnvelope;
}

export interface CandidateExtractor {
  extract(input: CandidateExtractionInput): ExtractedCandidateSet;
}

const asCandidateType = (value?: string): ExtractedCandidateDraft["candidate_type"] => {
  if (value === "state_candidate" || value === "handoff_candidate" || value === "summary_candidate") {
    return value;
  }
  return "memory_candidate";
};

const candidateFamilyFromType = (
  candidateType: ExtractedCandidateDraft["candidate_type"]
): ExtractedCandidateDraft["candidate_family"] => {
  if (candidateType === "state_candidate") {
    return "state_candidate";
  }
  if (candidateType === "summary_candidate") {
    return "summary_candidate";
  }
  if (candidateType === "handoff_candidate") {
    return "handoff_candidate";
  }
  return "memory_candidate";
};

const toDraft = (
  envelope: NormalizedWritebackEnvelope,
  payload: RawCandidatePayload,
  idx: number
): ExtractedCandidateDraft => {
  const candidateType = asCandidateType(payload.candidate_type);

  return {
    candidate_id: asCanonicalId<"candidate_id">(`${envelope.write_signal_id}:candidate:${idx + 1}`),
    candidate_type: candidateType,
    candidate_family: candidateFamilyFromType(candidateType),
    proposed_record_type: payload.proposed_record_type ?? "memory_object",
    subject_id: envelope.subject_id,
    ...(payload.owner_id ? { owner_id: asCanonicalId<"owner_id">(payload.owner_id) } : {}),
    scope_id: asCanonicalId<"scope_id">(payload.scope_id ?? "global_user"),
    content: payload.content ?? {},
    proposed_metadata: payload.proposed_metadata ?? {},
    proposed_by_actor_type: envelope.source_actor_type,
    ...(envelope.source_actor_id ? { proposed_by_actor_id: envelope.source_actor_id } : {}),
    source_event_ids: envelope.source_event_ids,
    submitted_at: envelope.signal_timestamp,
    ...(payload.why_store ? { why_store: payload.why_store } : {}),
    status: "pending"
  };
};

export const createCandidateExtractor = (): CandidateExtractor => {
  return {
    extract(input: CandidateExtractionInput): ExtractedCandidateSet {
      const rawCandidates = Array.isArray(input.envelope.raw_signal_payload.candidates)
        ? (input.envelope.raw_signal_payload.candidates as RawCandidatePayload[])
        : [];

      if (rawCandidates.length === 0) {
        return {
          extracted_candidates: [],
          extraction_notes: ["no_write_candidate: payload has no candidate list"]
        };
      }

      return {
        extracted_candidates: rawCandidates.map((payload, idx) => toDraft(input.envelope, payload, idx)),
        extraction_notes: []
      };
    }
  };
};
