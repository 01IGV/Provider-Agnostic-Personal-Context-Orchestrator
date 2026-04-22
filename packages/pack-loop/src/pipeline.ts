import type { CanonicalBundleAssemblyResult, PackInputConsumption } from "./types.js";
import type { BundleAssembler } from "./bundle-assembly.js";
import type { BundleMetadataGenerator } from "./bundle-metadata.js";
import type { CandidateAssigner } from "./candidate-assignment.js";
import type { CompressionShaper } from "./compression-shaping.js";
import type { SectionPlanner } from "./section-planning.js";
import type { PackingStrategySelector } from "./strategy-selection.js";

export interface PackLoopPrimitivePipeline {
  run(input: PackInputConsumption): CanonicalBundleAssemblyResult;
}

export interface PackLoopPrimitivePipelineDeps {
  strategy_selector: PackingStrategySelector;
  section_planner: SectionPlanner;
  candidate_assigner: CandidateAssigner;
  compression_shaper: CompressionShaper;
  metadata_generator: BundleMetadataGenerator;
  bundle_assembler: BundleAssembler;
}

export const createPackLoopPrimitivePipeline = (
  deps: PackLoopPrimitivePipelineDeps
): PackLoopPrimitivePipeline => {
  return {
    run(input: PackInputConsumption): CanonicalBundleAssemblyResult {
      const strategy = deps.strategy_selector.select({ pack_input: input });
      const sectionPlan = deps.section_planner.plan({ pack_input: input, strategy });
      const assignment = deps.candidate_assigner.assign({
        pack_input: input,
        section_plan: sectionPlan
      });
      const compression = deps.compression_shaper.compress({
        pack_input: input,
        strategy,
        section_plan: sectionPlan,
        assignment
      });
      const metadata = deps.metadata_generator.generate({
        pack_input: input,
        strategy,
        compression
      });

      return deps.bundle_assembler.assemble({
        pack_input: input,
        strategy,
        section_plan: sectionPlan,
        section_assignment: assignment,
        compression,
        metadata
      });
    }
  };
};
