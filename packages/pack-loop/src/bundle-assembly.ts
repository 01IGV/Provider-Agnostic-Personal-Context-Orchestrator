import type { ContextBundle } from "@orchestrator/core-domain";
import type {
  CanonicalBundleAssemblyResult,
  CompressionResult,
  PackInputConsumption,
  PackingStrategyResult,
  SectionAssignmentResult,
  SectionPlanResult
} from "./types.js";
import type { CanonicalBundleMetadata } from "./bundle-metadata.js";

export interface BundleAssemblyInput {
  pack_input: PackInputConsumption;
  strategy: PackingStrategyResult;
  section_plan: SectionPlanResult;
  section_assignment: SectionAssignmentResult;
  compression: CompressionResult;
  metadata: CanonicalBundleMetadata;
}

export interface BundleAssembler {
  assemble(input: BundleAssemblyInput): CanonicalBundleAssemblyResult;
}

export const createBundleAssembler = (): BundleAssembler => {
  return {
    assemble(input: BundleAssemblyInput): CanonicalBundleAssemblyResult {
      const sections = Object.fromEntries(
        input.compression.sections.map((section) => [
          section.section_id,
          {
            items: section.items.map((item) => item.shaped_content),
            record_refs: section.items.map((item) => item.record_id),
            omitted_count: section.omitted.length
          }
        ])
      );

      const bundle: ContextBundle = {
        record_class: "derived",
        entity_family: "derived_context",
        entity_type: "context_bundle",
        bundle_id: input.metadata.bundle_id,
        bundle_type: input.metadata.bundle_type,
        purpose: input.metadata.purpose,
        target_runtime: input.metadata.target_runtime,
        ...(input.metadata.target_provider ? { target_provider: input.metadata.target_provider } : {}),
        ...(input.metadata.target_model ? { target_model: input.metadata.target_model } : {}),
        subject_id: input.pack_input.subject_id,
        scope_ids: input.metadata.scope_ids,
        generated_at: input.metadata.generated_at,
        ...(input.pack_input.packing_hints?.ttl_seconds
          ? {
              expires_at: new Date(
                new Date(input.metadata.generated_at).getTime() + Number(input.pack_input.packing_hints.ttl_seconds) * 1000
              ).toISOString()
            }
          : {}),
        ...(input.metadata.token_budget ? { token_budget: input.metadata.token_budget } : {}),
        sections,
        source_record_ids: input.metadata.source_record_ids,
        ...(input.metadata.confidence_notes ? { confidence_notes: input.metadata.confidence_notes } : {}),
        ...(input.metadata.freshness_notes ? { freshness_notes: input.metadata.freshness_notes } : {}),
        generation_metadata: {
          ...input.metadata.generation_metadata,
          section_order: input.section_plan.ordered_sections.map((entry) => entry.section_id),
          assignment_unassigned_count: input.section_assignment.unassigned.length
        }
      };

      return {
        bundle,
        strategy: input.strategy,
        section_plan: input.section_plan,
        section_assignment: input.section_assignment,
        compression: input.compression,
        warnings: input.compression.warnings
      };
    }
  };
};
