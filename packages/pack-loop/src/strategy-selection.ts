import type { PackInputConsumption, PackingStrategyResult } from "./types.js";

export interface PackingStrategySelectionInput {
  pack_input: PackInputConsumption;
}

export interface PackingStrategySelector {
  select(input: PackingStrategySelectionInput): PackingStrategyResult;
}

const DEFAULT_TEMPLATE = [
  "purpose",
  "task_frame",
  "relevant_facts",
  "active_state",
  "constraints",
  "recent_decisions",
  "artifact_refs",
  "bundle_metadata"
] as const;

const STRATEGY_TEMPLATES: Record<PackingStrategyResult["packing_strategy"], PackingStrategyResult["bundle_section_template"]> = {
  minimal_direct: ["purpose", "task_frame", "relevant_facts", "bundle_metadata"],
  continuity_first: ["purpose", "active_state", "open_loops", "recent_decisions", "relevant_facts", "bundle_metadata"],
  state_first: ["purpose", "active_state", "constraints", "open_loops", "relevant_facts", "bundle_metadata"],
  planning_first: ["purpose", "task_frame", "constraints", "open_loops", "recent_decisions", "relevant_facts", "bundle_metadata"],
  handoff_first: ["purpose", "open_loops", "recent_decisions", "active_state", "artifact_refs", "bundle_metadata"],
  artifact_supported: ["purpose", "task_frame", "relevant_facts", "artifact_refs", "uncertainty_notes", "bundle_metadata"],
  deep_context: [...DEFAULT_TEMPLATE, "risk_notes", "uncertainty_notes", "tool_hints"],
  strict_budget: ["purpose", "task_frame", "active_state", "constraints", "bundle_metadata"]
};

const strategyFromInput = (packInput: PackInputConsumption): PackingStrategyResult["packing_strategy"] => {
  if (packInput.mode === "strict" || (packInput.token_budget ?? 0) > 0 && (packInput.token_budget ?? 0) <= 1200) {
    return "strict_budget";
  }

  if (packInput.intent_type.includes("handoff")) {
    return "handoff_first";
  }

  if (packInput.intent_type.includes("state")) {
    return "state_first";
  }

  if (packInput.intent_type.includes("plan")) {
    return "planning_first";
  }

  if (packInput.continuity_sensitivity === "high") {
    return "continuity_first";
  }

  if (packInput.depth_required === "high") {
    return "deep_context";
  }

  if (packInput.packing_hints?.prefer_artifacts === true) {
    return "artifact_supported";
  }

  return "minimal_direct";
};

const compressionFromStrategy = (strategy: PackingStrategyResult["packing_strategy"]): PackingStrategyResult["compression_policy"] => {
  switch (strategy) {
    case "strict_budget":
      return "section_synthesis";
    case "deep_context":
      return "hybrid";
    case "minimal_direct":
      return "normalized_short";
    default:
      return "structured_bullet";
  }
};

const retentionPolicyFromStrategy = (strategy: PackingStrategyResult["packing_strategy"]): string => {
  if (strategy === "strict_budget") {
    return "keep_critical_only_when_needed";
  }

  if (strategy === "deep_context") {
    return "keep_critical_high_medium";
  }

  return "keep_critical_and_high";
};

export const createPackingStrategySelector = (): PackingStrategySelector => {
  return {
    select(input: PackingStrategySelectionInput): PackingStrategyResult {
      const strategy = strategyFromInput(input.pack_input);
      const maxCandidates = input.pack_input.boundedness_hints?.max_candidates;
      const targetBudget =
        input.pack_input.token_budget ??
        (typeof maxCandidates === "number" ? Math.max(800, maxCandidates * 110) : 2400);

      return {
        packing_strategy: strategy,
        bundle_section_template: STRATEGY_TEMPLATES[strategy],
        compression_policy: compressionFromStrategy(strategy),
        priority_retention_policy: retentionPolicyFromStrategy(strategy),
        target_budget: targetBudget
      };
    }
  };
};
