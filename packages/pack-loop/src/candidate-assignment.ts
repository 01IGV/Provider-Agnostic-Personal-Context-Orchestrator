import type {
  AssignedCandidate,
  BundleSectionId,
  CandidateAssignmentOmission,
  PackInputConsumption,
  SectionAssignmentResult,
  SectionPlanResult
} from "./types.js";

export interface CandidateAssignmentInput {
  pack_input: PackInputConsumption;
  section_plan: SectionPlanResult;
}

export interface CandidateAssigner {
  assign(input: CandidateAssignmentInput): SectionAssignmentResult;
}

const sectionFromSourceFamily = (sourceFamily: string): BundleSectionId => {
  switch (sourceFamily) {
    case "state_objects":
      return "active_state";
    case "artifact_references":
      return "artifact_refs";
    case "handoffs":
      return "open_loops";
    case "events":
      return "recent_decisions";
    case "summaries":
      return "purpose";
    case "prior_bundles":
      return "task_frame";
    default:
      return "relevant_facts";
  }
};

const fallbackSection = (plannedSections: BundleSectionId[]): BundleSectionId | undefined => {
  const preferredOrder: BundleSectionId[] = [
    "relevant_facts",
    "active_state",
    "recent_decisions",
    "task_frame",
    "purpose"
  ];

  for (const sectionId of preferredOrder) {
    if (plannedSections.includes(sectionId)) {
      return sectionId;
    }
  }

  return plannedSections[0];
};

export const createCandidateAssigner = (): CandidateAssigner => {
  return {
    assign(input: CandidateAssignmentInput): SectionAssignmentResult {
      const assignments: SectionAssignmentResult["assignments"] = {};
      const unassigned: CandidateAssignmentOmission[] = [];
      const plannedSections = input.section_plan.ordered_sections.map((entry) => entry.section_id);
      const fallback = fallbackSection(plannedSections);

      for (const candidate of input.pack_input.selected_candidates) {
        const suggested = sectionFromSourceFamily(candidate.entry.source_family);
        const targetSection = plannedSections.includes(suggested) ? suggested : fallback;

        if (!targetSection) {
          unassigned.push({
            record_id: candidate.entry.record_id,
            reason: "section_not_planned"
          });
          continue;
        }

        const assigned: AssignedCandidate = {
          section_id: targetSection,
          record_id: candidate.entry.record_id,
          source_family: candidate.entry.source_family,
          priority_class: candidate.priority_class,
          selection_reasons: [...candidate.selection_reasons],
          record: candidate.entry.record as unknown as Record<string, unknown>
        };

        if (!assignments[targetSection]) {
          assignments[targetSection] = [];
        }

        assignments[targetSection].push(assigned);
      }

      return { assignments, unassigned };
    }
  };
};
