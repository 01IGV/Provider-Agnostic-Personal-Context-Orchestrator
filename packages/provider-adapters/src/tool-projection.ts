import type { ToolContractShape } from "@orchestrator/integration-contracts";
import type { ProjectionPlan } from "./projection-plan.js";
import type {
  AdapterWarning,
  CanonicalProjectedToolDistinction,
  ProjectedToolContract,
  ProviderAdapterProfile,
  SemanticPreservationNote
} from "./types.js";

export interface ToolProjectionInput {
  profile: ProviderAdapterProfile;
  plan: ProjectionPlan;
  canonical_tools: ToolContractShape[];
}

export interface ToolProjector {
  project(input: ToolProjectionInput): CanonicalProjectedToolDistinction[];
}

const shouldOmitTool = (
  profile: ProviderAdapterProfile,
  plan: ProjectionPlan,
  tool: ToolContractShape
): boolean => {
  if (!profile.runtime_profile.supports_tool_calling) {
    return true;
  }

  if (plan.tool_exposure_strategy === "minimal_safe_set") {
    return tool.operation_family !== "read";
  }

  if (profile.runtime_profile.constraint_flags.includes("limited_tool_calling")) {
    return tool.operation_family === "write" || tool.operation_family === "handoff";
  }

  return false;
};

const projectionNotes = (tool: ToolContractShape, omitted: boolean): string[] => {
  return [
    omitted ? "omitted_due_to_runtime_capability_constraints" : "projected_with_canonical_operation_linkage",
    `operation_family:${tool.operation_family}`
  ];
};

const warningsForTool = (omitted: boolean): AdapterWarning[] => {
  return omitted
    ? [{ code: "tool_projection_omission", note: "tool omitted due to runtime capability constraints" }]
    : [];
};

const semanticNotesForTool = (omitted: boolean): SemanticPreservationNote[] => {
  return [
    { code: "tool_semantics_preserved", note: "canonical operation meaning retained in projected tool contract" },
    ...(omitted ? [{ code: "partial_semantic_risk", note: "tool not exposed on this runtime surface" } as const] : [])
  ];
};

export const createToolProjector = (): ToolProjector => {
  return {
    project(input: ToolProjectionInput): CanonicalProjectedToolDistinction[] {
      return input.canonical_tools.map((canonicalTool) => {
        const omitted = shouldOmitTool(input.profile, input.plan, canonicalTool);

        const projectedTool: ProjectedToolContract = {
          projection_tool_name: `${input.profile.provider_family}.${canonicalTool.tool_name}`,
          canonical_operation_id: canonicalTool.operation_id,
          projected_request_schema: {
            schema_ref: canonicalTool.request_shape_ref,
            schema_wrapped: input.plan.message_envelope_strategy === "schema_wrapped_envelope"
          },
          projected_response_schema: {
            schema_ref: canonicalTool.response_shape_ref,
            schema_wrapped: input.plan.output_normalization_strategy === "schema_first_mapping"
          },
          projection_notes: projectionNotes(canonicalTool, omitted),
          omitted
        };

        return {
          canonical_tool: canonicalTool,
          projected_tool: projectedTool,
          warnings: warningsForTool(omitted),
          semantic_notes: semanticNotesForTool(omitted)
        };
      });
    }
  };
};
