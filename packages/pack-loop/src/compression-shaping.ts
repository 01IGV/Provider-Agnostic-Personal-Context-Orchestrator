import type {
  AssignedCandidate,
  CandidateAssignmentOmission,
  CompressionResult,
  PackInputConsumption,
  PackingStrategyResult,
  SectionAssignmentResult,
  SectionPlanResult
} from "./types.js";

export interface CompressionShapingInput {
  pack_input: PackInputConsumption;
  strategy: PackingStrategyResult;
  section_plan: SectionPlanResult;
  assignment: SectionAssignmentResult;
}

export interface CompressionShaper {
  compress(input: CompressionShapingInput): CompressionResult;
}

const priorityRank = (priorityClass: string): number => {
  switch (priorityClass) {
    case "critical":
      return 4;
    case "high":
      return 3;
    case "medium":
      return 2;
    default:
      return 1;
  }
};

const shapedLine = (candidate: AssignedCandidate): string => {
  const reasons = candidate.selection_reasons.join(",");
  return `${candidate.priority_class}:${candidate.source_family}:${candidate.record_id} [${reasons}]`;
};

export const createCompressionShaper = (): CompressionShaper => {
  return {
    compress(input: CompressionShapingInput): CompressionResult {
      const sections: CompressionResult["sections"] = [];
      const omissions: CandidateAssignmentOmission[] = [...input.assignment.unassigned];
      const warnings: CompressionResult["warnings"] = [];
      let estimatedTokens = 0;

      for (const planEntry of input.section_plan.ordered_sections) {
        const source = [...(input.assignment.assignments[planEntry.section_id] ?? [])].sort(
          (a, b) => priorityRank(b.priority_class) - priorityRank(a.priority_class)
        );

        const sectionOmitted: CandidateAssignmentOmission[] = [];
        const maxItems = planEntry.max_items ?? source.length;
        const selected = source.slice(0, maxItems);

        if (source.length > selected.length) {
          for (const omitted of source.slice(maxItems)) {
            const omission = {
              record_id: omitted.record_id,
              reason: "budget_limited" as const
            };
            sectionOmitted.push(omission);
            omissions.push(omission);
          }

          warnings.push({
            code: "section_overflow",
            note: `${planEntry.section_id} trimmed from ${source.length} to ${selected.length} items`
          });
        }

        if (selected.length === 0 && planEntry.required) {
          warnings.push({
            code: "empty_required_section",
            note: `${planEntry.section_id} required by section plan but no candidate assigned`
          });
        }

        const items = selected.map((candidate) => {
          const summaryLine = shapedLine(candidate);
          estimatedTokens += Math.max(8, Math.ceil(summaryLine.length / 4));

          return {
            record_id: candidate.record_id,
            source_family: candidate.source_family,
            priority_class: candidate.priority_class,
            selection_reasons: candidate.selection_reasons,
            representation_mode: input.strategy.compression_policy,
            shaped_content: {
              summary_line: summaryLine,
              source_family: candidate.source_family,
              record_ref: candidate.record_id,
              priority_class: candidate.priority_class
            }
          };
        });

        sections.push({
          section_id: planEntry.section_id,
          items,
          omitted: sectionOmitted
        });
      }

      if (estimatedTokens > input.strategy.target_budget) {
        warnings.push({
          code: "budget_pressure",
          note: `estimated packed tokens (${estimatedTokens}) exceed target budget (${input.strategy.target_budget})`
        });
      }

      return {
        sections,
        omissions,
        warnings,
        estimated_tokens: estimatedTokens
      };
    }
  };
};
