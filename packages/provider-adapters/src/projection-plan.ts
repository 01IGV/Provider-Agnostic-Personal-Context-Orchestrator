import type { ContextBundle } from "@orchestrator/core-domain";
import type { OperationContractShape } from "@orchestrator/integration-contracts";
import type { ProviderAdapterProfile } from "./types.js";
import type { ProjectionStrategy } from "./vocabularies.js";

export interface ProjectionPlanInput {
  profile: ProviderAdapterProfile;
  canonical_bundle: ContextBundle;
  operation_contracts: OperationContractShape[];
  execution_mode?: string;
  token_budget_hint?: number;
}

export interface ProjectionPlan {
  projection_strategy: ProjectionStrategy;
  message_envelope_strategy: "single_envelope" | "segmented_envelopes" | "schema_wrapped_envelope";
  tool_exposure_strategy: "full_contract_set" | "capability_filtered_set" | "minimal_safe_set";
  output_normalization_strategy: "direct_mapping" | "schema_first_mapping" | "fallback_text_mapping";
  runtime_risk_notes: string[];
}

export interface ProjectionPlanner {
  plan(input: ProjectionPlanInput): ProjectionPlan;
}

const selectStrategy = (input: ProjectionPlanInput): ProjectionStrategy => {
  if (input.profile.runtime_profile.constraint_flags.includes("tight_context_budget")) {
    return "budget_constrained_projection";
  }

  if (!input.profile.runtime_profile.supports_tool_calling) {
    return "tool_limited_projection";
  }

  if (!input.profile.runtime_profile.supports_structured_output) {
    return "canonical_preserving_direct";
  }

  if (input.profile.runtime_profile.constraint_flags.includes("strict_schema_wrapping")) {
    return "schema_wrapped_projection";
  }

  return "structured_output_guarded_projection";
};

const toolExposureStrategy = (input: ProjectionPlanInput): ProjectionPlan["tool_exposure_strategy"] => {
  if (!input.profile.runtime_profile.supports_tool_calling) {
    return "minimal_safe_set";
  }

  const hasMutatingOperation = input.operation_contracts.some((operation) =>
    operation.side_effect_profile.side_effect_class !== "read_only"
  );

  return hasMutatingOperation ? "capability_filtered_set" : "full_contract_set";
};

export const createProjectionPlanner = (): ProjectionPlanner => {
  return {
    plan(input: ProjectionPlanInput): ProjectionPlan {
      const projectionStrategy = selectStrategy(input);
      const envelopeStrategy: ProjectionPlan["message_envelope_strategy"] =
        projectionStrategy === "schema_wrapped_projection" ? "schema_wrapped_envelope" : "single_envelope";

      const normalizationStrategy: ProjectionPlan["output_normalization_strategy"] =
        input.profile.runtime_profile.supports_structured_output ? "schema_first_mapping" : "fallback_text_mapping";

      const runtimeRiskNotes = [
        ...(input.profile.runtime_profile.constraint_flags.includes("tight_context_budget")
          ? ["projection_budget_pressure_expected"]
          : []),
        ...(input.canonical_bundle.token_budget && input.canonical_bundle.token_budget > (input.token_budget_hint ?? 0)
          ? ["canonical_bundle_exceeds_runtime_hint"]
          : []),
        ...(input.execution_mode === "strict" ? ["strict_projection_mode_enabled"] : [])
      ];

      return {
        projection_strategy: projectionStrategy,
        message_envelope_strategy: envelopeStrategy,
        tool_exposure_strategy: toolExposureStrategy(input),
        output_normalization_strategy: normalizationStrategy,
        runtime_risk_notes: runtimeRiskNotes
      };
    }
  };
};
