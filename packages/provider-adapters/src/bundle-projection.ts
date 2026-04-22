import type { CanonicalBundleAssemblyResult } from "@orchestrator/pack-loop";
import type { ProjectionPlan } from "./projection-plan.js";
import type {
  AdapterWarning,
  CanonicalBundleProjectionReference,
  CanonicalProjectedBundleDistinction,
  ProjectedBundle,
  ProviderAdapterProfile,
  SemanticPreservationNote
} from "./types.js";

export interface BundleProjectionInput {
  canonical: CanonicalBundleProjectionReference;
  profile: ProviderAdapterProfile;
  plan: ProjectionPlan;
  projected_at?: string;
}

export interface BundleProjector {
  project(input: BundleProjectionInput): CanonicalProjectedBundleDistinction;
}

const projectFromAssembly = (assembly: CanonicalBundleAssemblyResult): Record<string, unknown> => {
  return Object.fromEntries(
    Object.entries(assembly.bundle.sections).map(([sectionId, sectionValue]) => [
      sectionId,
      {
        section_payload: sectionValue,
        projected_priority: assembly.section_plan.ordered_sections.find((entry) => entry.section_id === sectionId)
          ?.required
          ? "required"
          : "optional"
      }
    ])
  );
};

const deriveWarnings = (input: BundleProjectionInput): AdapterWarning[] => {
  return [
    ...(input.plan.projection_strategy === "budget_constrained_projection"
      ? [{ code: "projection_budget_pressure", note: "runtime profile indicates tight context budget" } as const]
      : []),
    ...(input.plan.runtime_risk_notes.length > 0
      ? [{ code: "constraint_fallback", note: "projection includes runtime risk fallbacks" } as const]
      : [])
  ];
};

const semanticNotes = (warnings: AdapterWarning[]): SemanticPreservationNote[] => {
  return [
    { code: "bundle_semantics_preserved", note: "canonical bundle purpose and section intent retained" },
    ...(warnings.length > 0
      ? [{ code: "partial_semantic_risk", note: "projection includes bounded risk warnings" } as const]
      : [])
  ];
};

export const createBundleProjector = (): BundleProjector => {
  return {
    project(input: BundleProjectionInput): CanonicalProjectedBundleDistinction {
      const warnings = deriveWarnings(input);
      const projectedSections = input.canonical.canonical_bundle_assembly
        ? projectFromAssembly(input.canonical.canonical_bundle_assembly)
        : input.canonical.canonical_bundle.sections;

      const projectedBundle: ProjectedBundle = {
        projection_id: `${input.canonical.canonical_bundle.bundle_id}:${input.plan.projection_strategy}`,
        provider_family: input.profile.provider_family,
        runtime_host_type: input.profile.runtime_profile.runtime_host_type,
        projection_strategy: input.plan.projection_strategy,
        projected_sections: projectedSections,
        projected_metadata: {
          source_bundle_id: input.canonical.canonical_bundle.bundle_id,
          source_record_count: input.canonical.canonical_bundle.source_record_ids.length,
          plan: input.plan
        },
        warnings,
        semantic_notes: semanticNotes(warnings),
        projected_at: (input.projected_at ?? new Date().toISOString()) as ProjectedBundle["projected_at"]
      };

      return {
        canonical: input.canonical,
        projected: projectedBundle
      };
    }
  };
};
