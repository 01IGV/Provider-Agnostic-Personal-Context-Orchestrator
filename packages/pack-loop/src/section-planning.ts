import type {
  BundleSectionId,
  PackInputConsumption,
  PackingStrategyResult,
  SectionPlanEntry,
  SectionPlanResult
} from "./types.js";

export interface SectionPlanningInput {
  pack_input: PackInputConsumption;
  strategy: PackingStrategyResult;
}

export interface SectionPlanner {
  plan(input: SectionPlanningInput): SectionPlanResult;
}

const ALWAYS_REQUIRED: BundleSectionId[] = ["purpose", "task_frame", "relevant_facts", "bundle_metadata"];

const requiredByStrategy = (strategy: PackingStrategyResult["packing_strategy"]): BundleSectionId[] => {
  if (strategy === "state_first") {
    return [...ALWAYS_REQUIRED, "active_state"];
  }

  if (strategy === "handoff_first") {
    return [...ALWAYS_REQUIRED, "open_loops", "recent_decisions"];
  }

  if (strategy === "strict_budget") {
    return ["purpose", "task_frame", "active_state", "bundle_metadata"];
  }

  return ALWAYS_REQUIRED;
};

const maxItemsForSection = (sectionId: BundleSectionId, totalSelected: number): number => {
  if (sectionId === "purpose" || sectionId === "bundle_metadata") {
    return 1;
  }

  if (sectionId === "active_state" || sectionId === "constraints") {
    return Math.max(2, Math.min(8, Math.ceil(totalSelected * 0.2)));
  }

  return Math.max(2, Math.min(10, Math.ceil(totalSelected * 0.3)));
};

export const createSectionPlanner = (): SectionPlanner => {
  return {
    plan(input: SectionPlanningInput): SectionPlanResult {
      const required = requiredByStrategy(input.strategy.packing_strategy);
      const totalSelected = input.pack_input.selected_candidates.length;
      const defaultBudget = Math.max(
        120,
        Math.floor(input.strategy.target_budget / Math.max(1, input.strategy.bundle_section_template.length))
      );

      const orderedSections: SectionPlanEntry[] = input.strategy.bundle_section_template.map((sectionId) => ({
        section_id: sectionId,
        required: required.includes(sectionId),
        empty_section_behavior: required.includes(sectionId) ? "emit_empty_marker" : "omit_section",
        budget_hint_tokens: defaultBudget,
        max_items: maxItemsForSection(sectionId, totalSelected)
      }));

      return {
        ordered_sections: orderedSections,
        required_sections: required,
        optional_sections: orderedSections
          .map((entry) => entry.section_id)
          .filter((sectionId) => !required.includes(sectionId))
      };
    }
  };
};
