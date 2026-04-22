import type { HandoffTargetBoundaryInput, HandoffTargetBoundaryResult, TargetContextType } from "./types.js";

export interface HandoffTargetBoundaryDefiner {
  define(input: HandoffTargetBoundaryInput): HandoffTargetBoundaryResult;
}

const targetContextDefault = (input: HandoffTargetBoundaryInput): TargetContextType => {
  if (input.requested_target_context) {
    return input.requested_target_context;
  }

  if (input.target_provider) {
    return "next_provider";
  }

  if (input.target_runtime) {
    return "next_runtime";
  }

  return "next_session";
};

const handoffTypeFromTarget = (target: TargetContextType): HandoffTargetBoundaryResult["handoff_type"] => {
  if (target === "next_agent") {
    return "agent_to_agent";
  }
  if (target === "next_workflow_step") {
    return "workflow_step";
  }
  if (target === "next_provider" || target === "next_runtime") {
    return "provider_transfer";
  }
  return "session_to_session";
};

export const createHandoffTargetBoundaryDefiner = (): HandoffTargetBoundaryDefiner => {
  return {
    define(input: HandoffTargetBoundaryInput): HandoffTargetBoundaryResult {
      const target = targetContextDefault(input);
      return {
        handoff_type: handoffTypeFromTarget(target),
        source_context_type: input.source_context_type,
        target_context_type: target,
        ...(input.target_runtime ? { target_runtime: input.target_runtime } : {}),
        ...(input.target_provider ? { target_provider: input.target_provider } : {}),
        ...(input.expected_use_mode ? { expected_use_mode: input.expected_use_mode } : {})
      };
    }
  };
};
