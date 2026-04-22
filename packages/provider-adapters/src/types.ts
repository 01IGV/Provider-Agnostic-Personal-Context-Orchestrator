import type { IsoDateTimeString } from "@orchestrator/core-foundation";
import type { ContextBundle, HandoffArtifact } from "@orchestrator/core-domain";
import type { ToolContractShape } from "@orchestrator/integration-contracts";
import type { CanonicalBundleAssemblyResult } from "@orchestrator/pack-loop";
import type { HandoffRunResult } from "@orchestrator/handoff";
import type {
  AdapterConstraintFlag,
  AdapterProviderFamily,
  AdapterRuntimeHostType,
  AdapterWarningCode,
  ProjectionStrategy,
  SemanticPreservationNoteCode
} from "./vocabularies.js";

export interface AdapterWarning {
  code: AdapterWarningCode;
  note: string;
}

export interface SemanticPreservationNote {
  code: SemanticPreservationNoteCode;
  note: string;
}

export interface RuntimeCapabilityProfile {
  runtime_host_type: AdapterRuntimeHostType;
  supports_tool_calling: boolean;
  supports_structured_output: boolean;
  supports_resource_loading: boolean;
  supports_multi_turn_continuation: boolean;
  max_context_window_tokens?: number;
  constraint_flags: AdapterConstraintFlag[];
}

export interface ProviderAdapterProfile {
  provider_profile_id: string;
  provider_family: AdapterProviderFamily;
  runtime_profile: RuntimeCapabilityProfile;
  supported_interaction_modes: string[];
  schema_strictness_characteristics: string[];
  bundle_size_sensitivities: string[];
  tool_invocation_constraints: string[];
  resource_support_characteristics: string[];
  structured_output_characteristics: string[];
  normalization_requirements: string[];
}

export interface CanonicalBundleProjectionReference {
  canonical_bundle: ContextBundle;
  canonical_bundle_assembly?: CanonicalBundleAssemblyResult;
  handoff_context?: HandoffArtifact | HandoffRunResult;
}

export interface ProjectedBundle {
  projection_id: string;
  provider_family: AdapterProviderFamily;
  runtime_host_type: AdapterRuntimeHostType;
  projection_strategy: ProjectionStrategy;
  projected_sections: Record<string, unknown>;
  projected_metadata: Record<string, unknown>;
  warnings: AdapterWarning[];
  semantic_notes: SemanticPreservationNote[];
  projected_at: IsoDateTimeString;
}

export interface CanonicalProjectedBundleDistinction {
  canonical: CanonicalBundleProjectionReference;
  projected: ProjectedBundle;
}

export interface ProjectedToolContract {
  projection_tool_name: string;
  canonical_operation_id: string;
  projected_request_schema: Record<string, unknown>;
  projected_response_schema: Record<string, unknown>;
  projection_notes: string[];
  omitted: boolean;
}

export interface CanonicalProjectedToolDistinction {
  canonical_tool: ToolContractShape;
  projected_tool: ProjectedToolContract;
  warnings: AdapterWarning[];
  semantic_notes: SemanticPreservationNote[];
}
