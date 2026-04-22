import type { OperationContractShape, ToolContractShape } from "@orchestrator/integration-contracts";
import type { ContextBundle, ProviderProfile } from "@orchestrator/core-domain";
import type { ProjectionPlanner } from "./projection-plan.js";
import type { BundleProjector } from "./bundle-projection.js";
import type { ToolProjector } from "./tool-projection.js";
import type {
  OutputNormalizer,
  ProviderRuntimeOutputEnvelope,
  NormalizedOutputEnvelope
} from "./output-normalization.js";
import type {
  CanonicalWritebackEnvelope,
  WritebackEnvelopeNormalizer
} from "./writeback-normalization.js";
import type {
  CanonicalProjectedBundleDistinction,
  CanonicalProjectedToolDistinction,
  ProviderAdapterProfile
} from "./types.js";
import type { ProviderAdapterProfileBuilder } from "./profiles.js";
import { validateToolOperationConsistency, type ContractConsistencyResult } from "./consistency.js";

export interface ProviderAdapterPipelineInput {
  provider_profile: ProviderProfile;
  canonical_bundle: ContextBundle;
  operation_contracts: OperationContractShape[];
  canonical_tools: ToolContractShape[];
  provider_output?: ProviderRuntimeOutputEnvelope;
  request_id: string;
  client_id: string;
  subject_id: string;
  session_id?: string;
  workflow_id?: string;
}

export interface ProviderAdapterPipelineResult {
  adapter_profile: ProviderAdapterProfile;
  bundle_projection: CanonicalProjectedBundleDistinction;
  tool_projection: CanonicalProjectedToolDistinction[];
  contract_consistency: ContractConsistencyResult;
  normalized_output?: NormalizedOutputEnvelope;
  canonical_writeback_envelope?: CanonicalWritebackEnvelope;
}

export interface ProviderAdapterPipelineDeps {
  profile_builder: ProviderAdapterProfileBuilder;
  projection_planner: ProjectionPlanner;
  bundle_projector: BundleProjector;
  tool_projector: ToolProjector;
  output_normalizer: OutputNormalizer;
  writeback_normalizer: WritebackEnvelopeNormalizer;
}

export interface ProviderAdapterPipeline {
  run(input: ProviderAdapterPipelineInput): ProviderAdapterPipelineResult;
}

export const createProviderAdapterPipeline = (
  deps: ProviderAdapterPipelineDeps
): ProviderAdapterPipeline => {
  return {
    run(input: ProviderAdapterPipelineInput): ProviderAdapterPipelineResult {
      const contractConsistency = validateToolOperationConsistency({
        operation_contracts: input.operation_contracts,
        canonical_tools: input.canonical_tools
      });

      const adapterProfile = deps.profile_builder.build({ provider_profile: input.provider_profile });
      const plan = deps.projection_planner.plan({
        profile: adapterProfile,
        canonical_bundle: input.canonical_bundle,
        operation_contracts: input.operation_contracts
      });

      const bundleProjection = deps.bundle_projector.project({
        canonical: { canonical_bundle: input.canonical_bundle },
        profile: adapterProfile,
        plan,
        ...(input.provider_output?.received_at ? { projected_at: input.provider_output.received_at } : {})
      });

      const toolProjection = deps.tool_projector.project({
        profile: adapterProfile,
        plan,
        canonical_tools: input.canonical_tools
      });

      if (!input.provider_output) {
        return {
          adapter_profile: adapterProfile,
          bundle_projection: bundleProjection,
          tool_projection: toolProjection,
          contract_consistency: contractConsistency
        };
      }

      const normalizedOutput = deps.output_normalizer.normalize({
        profile: adapterProfile,
        output: input.provider_output
      });

      const canonicalWritebackEnvelope = deps.writeback_normalizer.normalize({
        normalized_output: normalizedOutput,
        request_id: input.request_id,
        client_id: input.client_id,
        subject_id: input.subject_id,
        ...(input.session_id ? { session_id: input.session_id } : {}),
        ...(input.workflow_id ? { workflow_id: input.workflow_id } : {})
      });

      return {
        adapter_profile: adapterProfile,
        bundle_projection: bundleProjection,
        tool_projection: toolProjection,
        contract_consistency: contractConsistency,
        normalized_output: normalizedOutput,
        canonical_writeback_envelope: canonicalWritebackEnvelope
      };
    }
  };
};
