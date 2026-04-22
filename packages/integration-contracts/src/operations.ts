import type { CorrelationId } from "@orchestrator/core-foundation";
import type { CapabilityClass, IntegrationSurfaceType, OperationFamily, RequestVisibilityLevel, SideEffectClass } from "./vocabularies.js";

export interface MutationSideEffectProfile {
  side_effect_class: SideEffectClass;
  mutates_canonical_memory: boolean;
  mutates_canonical_state: boolean;
  mutates_derived_artifacts: boolean;
  requires_governance_decisioning: boolean;
}

export interface OperationContractShape {
  operation_id: string;
  operation_family: OperationFamily;
  capability_class: CapabilityClass;
  supported_surfaces: IntegrationSurfaceType[];
  request_schema_id: string;
  response_schema_id: string;
  side_effect_profile: MutationSideEffectProfile;
  allowed_visibility_levels: RequestVisibilityLevel[];
}

export interface ToolContractShape {
  tool_name: string;
  operation_id: string;
  operation_family: OperationFamily;
  request_shape_ref: string;
  response_shape_ref: string;
  capability_class: CapabilityClass;
}

export interface RequestResponseLinkageShape {
  request_id: string;
  operation_id: string;
  correlation_id?: CorrelationId;
  linked_response_id: string;
  linked_error_id?: string;
}
