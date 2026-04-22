import type {
  HandoffArtifactAssemblyInput,
  HandoffRunResult,
  HandoffTargetBoundaryInput,
  HandoffTriggerInput
} from "./types.js";
import type { HandoffArtifactAssembler } from "./artifact-assembly.js";
import type { ContinuityCandidateSelector } from "./continuity-selection.js";
import type { HandoffShaper } from "./handoff-shaping.js";
import type { HandoffTargetBoundaryDefiner } from "./target-boundary.js";
import type { HandoffTriggerDetector } from "./trigger-detection.js";
import type { HandoffValidationHook } from "./validation-hooks.js";

export interface HandoffPrimitivePipelineDeps {
  trigger_detector: HandoffTriggerDetector;
  target_boundary_definer: HandoffTargetBoundaryDefiner;
  continuity_selector: ContinuityCandidateSelector;
  handoff_shaper: HandoffShaper;
  validation_hook: HandoffValidationHook;
  artifact_assembler: HandoffArtifactAssembler;
}

export interface HandoffPrimitivePipelineInput {
  trigger_input: HandoffTriggerInput;
  target_input: HandoffTargetBoundaryInput;
  assembly_input: Pick<HandoffArtifactAssemblyInput, "subject_id" | "scope_id" | "generated_at" | "expires_at" | "status">;
}

export interface HandoffPrimitivePipeline {
  run(input: HandoffPrimitivePipelineInput): Promise<HandoffRunResult>;
}

export const createHandoffPrimitivePipeline = (
  deps: HandoffPrimitivePipelineDeps
): HandoffPrimitivePipeline => {
  return {
    async run(input: HandoffPrimitivePipelineInput): Promise<HandoffRunResult> {
      const trigger = deps.trigger_detector.detect(input.trigger_input);
      const targetBoundary = deps.target_boundary_definer.define(input.target_input);
      const candidateSet = await deps.continuity_selector.select({
        subject_id: input.assembly_input.subject_id,
        scope_id: input.assembly_input.scope_id,
        target_boundary: targetBoundary
      });
      const packaging = deps.handoff_shaper.shape({
        trigger,
        target_boundary: targetBoundary,
        candidate_set: candidateSet
      });
      const validation = deps.validation_hook.validate({
        scope_id: input.assembly_input.scope_id,
        trigger,
        target_boundary: targetBoundary,
        candidate_set: candidateSet,
        packaging
      });

      if (!validation.accepted) {
        return {
          trigger,
          target_boundary: targetBoundary,
          candidate_set: candidateSet,
          packaging,
          validation
        };
      }

      const assembly = deps.artifact_assembler.assemble({
        ...input.assembly_input,
        target_boundary: targetBoundary,
        packaging,
        validation
      });

      return {
        trigger,
        target_boundary: targetBoundary,
        candidate_set: candidateSet,
        packaging,
        validation,
        assembly
      };
    }
  };
};
