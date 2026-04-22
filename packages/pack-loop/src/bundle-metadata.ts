import { asCanonicalId, type BundleId, type IsoDateTimeString, type ScopeId } from "@orchestrator/core-foundation";
import type { DomainEntityId } from "@orchestrator/core-domain";
import type { CompressionResult, PackInputConsumption, PackingStrategyResult } from "./types.js";

export interface BundleMetadataGenerationInput {
  pack_input: PackInputConsumption;
  strategy: PackingStrategyResult;
  compression: CompressionResult;
}

export interface CanonicalBundleMetadata {
  bundle_id: BundleId;
  bundle_type: string;
  purpose: string;
  target_runtime: string;
  target_provider?: string;
  target_model?: string;
  scope_ids: ScopeId[];
  generated_at: IsoDateTimeString;
  token_budget?: number;
  source_record_ids: DomainEntityId[];
  confidence_notes?: string[];
  freshness_notes?: string[];
  generation_metadata: Record<string, unknown>;
}

export interface BundleMetadataGenerator {
  generate(input: BundleMetadataGenerationInput): CanonicalBundleMetadata;
}

export const createBundleMetadataGenerator = (): BundleMetadataGenerator => {
  return {
    generate(input: BundleMetadataGenerationInput): CanonicalBundleMetadata {
      const generatedAt = new Date().toISOString() as IsoDateTimeString;
      const bundleId = asCanonicalId<"bundle_id">(
        `${input.pack_input.request_id}:${input.strategy.packing_strategy}:${generatedAt}`
      );

      const sourceRecordIds = input.compression.sections
        .flatMap((section) => section.items.map((item) => item.record_id as DomainEntityId));

      return {
        bundle_id: bundleId,
        bundle_type: input.strategy.packing_strategy,
        purpose: `packed_context:${input.pack_input.intent_type}:${input.pack_input.mode}`,
        target_runtime: input.pack_input.target_runtime ?? "generic_runtime",
        ...(input.pack_input.target_provider ? { target_provider: input.pack_input.target_provider } : {}),
        ...(input.pack_input.target_model ? { target_model: input.pack_input.target_model } : {}),
        scope_ids: input.pack_input.scope_summary.selected_scope_ids.map((id) =>
          asCanonicalId<"scope_id">(id)
        ),
        generated_at: generatedAt,
        ...(input.strategy.target_budget > 0 ? { token_budget: input.strategy.target_budget } : {}),
        source_record_ids: sourceRecordIds,
        ...(input.pack_input.read_confidence_notes
          ? { confidence_notes: [...input.pack_input.read_confidence_notes] }
          : {}),
        freshness_notes: ["packed_from_read_path_selection"],
        generation_metadata: {
          strategy: input.strategy.packing_strategy,
          compression_policy: input.strategy.compression_policy,
          priority_retention_policy: input.strategy.priority_retention_policy,
          estimated_tokens: input.compression.estimated_tokens,
          omission_count: input.compression.omissions.length,
          warning_count: input.compression.warnings.length
        }
      };
    }
  };
};
