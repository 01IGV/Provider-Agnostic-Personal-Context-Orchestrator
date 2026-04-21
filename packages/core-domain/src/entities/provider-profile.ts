import type { CanonicalEntityDiscriminator } from "../discriminators.js";
import type { ProviderProfileId } from "./shared.js";

export interface ProviderProfile extends CanonicalEntityDiscriminator<"integration", "provider_profile"> {
  provider_profile_id: ProviderProfileId;
  provider_family: string;
  runtime_host_type: string;
  supported_interaction_modes: string[];
  schema_strictness_characteristics: string[];
  bundle_size_sensitivities: string[];
  tool_invocation_constraints: string[];
  resource_support_characteristics: string[];
  structured_output_characteristics: string[];
  normalization_requirements: string[];
}
