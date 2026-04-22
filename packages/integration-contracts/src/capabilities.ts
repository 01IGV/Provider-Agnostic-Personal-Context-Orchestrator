import type { ClientType } from "@orchestrator/core-domain";
import type { CapabilityClass, IntegrationSurfaceType, RequestVisibilityLevel } from "./vocabularies.js";

export interface AllowedOperationVisibility {
  operation_id: string;
  visibility_levels: RequestVisibilityLevel[];
}

export interface CapabilityDescriptorShape {
  capability_class: CapabilityClass;
  supported_surfaces: IntegrationSurfaceType[];
  allowed_client_types: ClientType[];
  allowed_operations: string[];
  operation_visibility: AllowedOperationVisibility[];
  constraints?: Array<{ key: string; value: string }>;
}

export interface CapabilitySetShape {
  client_type: ClientType;
  capabilities: CapabilityDescriptorShape[];
}
