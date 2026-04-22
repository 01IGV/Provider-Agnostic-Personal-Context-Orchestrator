import { asCanonicalId, type IsoDateTimeString } from "@orchestrator/core-foundation";
import type { HandoffArtifactAssemblyInput, HandoffArtifactAssemblyResult } from "./types.js";

export interface HandoffArtifactAssembler {
  assemble(input: HandoffArtifactAssemblyInput): HandoffArtifactAssemblyResult;
}

export const createHandoffArtifactAssembler = (): HandoffArtifactAssembler => {
  return {
    assemble(input: HandoffArtifactAssemblyInput): HandoffArtifactAssemblyResult {
      const generatedAt = input.generated_at ?? (new Date().toISOString() as IsoDateTimeString);

      const artifact = {
        record_class: "derived" as const,
        entity_family: "derived_context" as const,
        entity_type: "handoff_artifact" as const,
        handoff_id: asCanonicalId<"handoff_id">(
          `${input.subject_id}:${input.target_boundary.target_context_type}:${generatedAt}`
        ),
        handoff_type: input.target_boundary.handoff_type,
        source_context_type: input.target_boundary.source_context_type,
        target_context_type: input.target_boundary.target_context_type,
        subject_id: input.subject_id,
        scope_id: input.scope_id,
        content: input.packaging.sections,
        source_record_ids: input.packaging.source_record_ids,
        generated_at: generatedAt,
        ...(input.expires_at ? { expires_at: input.expires_at } : {}),
        status: input.status ?? "active",
        transfer_metadata: {
          ...input.transfer_metadata,
          validation_outcome: input.validation.outcome,
          warning_count: input.validation.warnings.length,
          ...(input.target_boundary.target_runtime ? { target_runtime: input.target_boundary.target_runtime } : {}),
          ...(input.target_boundary.target_provider ? { target_provider: input.target_boundary.target_provider } : {})
        }
      };

      return {
        handoff_artifact: artifact,
        warnings: input.validation.warnings,
        uncertainties: input.packaging.uncertainties
      };
    }
  };
};
