import type { ContinuityCandidateSet, HandoffPackagingResult, HandoffTargetBoundaryResult, HandoffTriggerResult } from "./types.js";

export interface HandoffShapingInput {
  trigger: HandoffTriggerResult;
  target_boundary: HandoffTargetBoundaryResult;
  candidate_set: ContinuityCandidateSet;
}

export interface HandoffShaper {
  shape(input: HandoffShapingInput): HandoffPackagingResult;
}

export const createHandoffShaper = (): HandoffShaper => {
  return {
    shape(input: HandoffShapingInput): HandoffPackagingResult {
      const sorted = [...input.candidate_set.candidates].sort((a, b) => b.continuity_weight - a.continuity_weight);
      const critical = sorted.filter((x) => x.continuity_weight >= 0.75);
      const remaining = sorted.filter((x) => x.continuity_weight < 0.75);

      return {
        sections: {
          handoff_purpose: {
            trigger_type: input.trigger.handoff_trigger_type,
            continuity_reason: input.trigger.continuity_reason,
            target_context_type: input.target_boundary.target_context_type
          },
          current_state: critical.filter((x) => x.family === "active_state").map((x) => x.content),
          what_matters_now: critical.map((x) => ({ record_id: x.record_id, rationale: x.rationale })),
          open_loops: remaining.filter((x) => x.family === "open_loops").map((x) => x.content),
          recent_decisions: remaining.filter((x) => x.family === "recent_decisions").map((x) => x.content),
          artifact_refs: remaining.filter((x) => x.family === "artifact_refs").map((x) => x.content),
          handoff_metadata: {
            selected_count: sorted.length,
            omitted_count: input.candidate_set.omitted_record_ids.length
          }
        },
        source_record_ids: sorted.map((x) => x.record_id),
        warnings: input.candidate_set.omitted_record_ids.length > 0
          ? [{ code: "boundedness_pressure", note: `omitted ${input.candidate_set.omitted_record_ids.length} records` }]
          : [],
        uncertainties: sorted.length === 0
          ? [{ code: "incomplete_open_loop_coverage", note: "no continuity candidates available for handoff" }]
          : [],
        omissions: input.candidate_set.omission_notes
      };
    }
  };
};
