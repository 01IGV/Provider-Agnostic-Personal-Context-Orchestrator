import type { AuditComponent, EvaluationComponent } from "@orchestrator/audit-eval";
import type { IsoDateTimeString } from "@orchestrator/core-foundation";
import type { AdapterWarning, ProviderAdapterProfile, SemanticPreservationNote } from "./types.js";
import type { ProjectionPlan } from "./projection-plan.js";

export interface AdapterProjectionAuditShape {
  audit_component: Extract<AuditComponent, "integration">;
  provider_profile_id: ProviderAdapterProfile["provider_profile_id"];
  projection_strategy: ProjectionPlan["projection_strategy"];
  message_envelope_strategy: ProjectionPlan["message_envelope_strategy"];
  tool_exposure_strategy: ProjectionPlan["tool_exposure_strategy"];
  output_normalization_strategy: ProjectionPlan["output_normalization_strategy"];
  warnings: AdapterWarning[];
  semantic_notes: SemanticPreservationNote[];
  recorded_at: IsoDateTimeString;
}

export interface AdapterEvaluationLinkShape {
  evaluation_component: Extract<EvaluationComponent, "provider_neutrality" | "operational_stability">;
  provider_profile_id: ProviderAdapterProfile["provider_profile_id"];
  drift_signals: string[];
  stability_signals: string[];
}

export interface AdapterAuditSummaryShape {
  profile: Pick<ProviderAdapterProfile, "provider_profile_id" | "provider_family">;
  projection_plan: Pick<
    ProjectionPlan,
    "projection_strategy" | "tool_exposure_strategy" | "output_normalization_strategy"
  >;
  warning_count: number;
  semantic_note_count: number;
}

export const buildAdapterAuditSummary = (input: {
  profile: ProviderAdapterProfile;
  plan: ProjectionPlan;
  warnings: AdapterWarning[];
  semantic_notes: SemanticPreservationNote[];
}): AdapterAuditSummaryShape => {
  return {
    profile: {
      provider_profile_id: input.profile.provider_profile_id,
      provider_family: input.profile.provider_family
    },
    projection_plan: {
      projection_strategy: input.plan.projection_strategy,
      tool_exposure_strategy: input.plan.tool_exposure_strategy,
      output_normalization_strategy: input.plan.output_normalization_strategy
    },
    warning_count: input.warnings.length,
    semantic_note_count: input.semantic_notes.length
  };
};
