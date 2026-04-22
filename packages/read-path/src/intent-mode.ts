import type { ReadMode } from "./types.js";

export const INTENT_TYPES = [
  "new_request",
  "continuation",
  "planning",
  "state_reconstruction",
  "handoff_recovery",
  "workflow_execution"
] as const;

export type IntentType = (typeof INTENT_TYPES)[number];

export interface IntentResolutionInput {
  task_signal: string;
  execution_mode_hint?: ReadMode;
  has_session_context: boolean;
  has_workflow_context: boolean;
}

export interface IntentResolutionResult {
  intent_type: IntentType;
  continuation_flag: boolean;
  mode: ReadMode;
  depth_hint: "shallow" | "standard" | "deep";
  context_family_hints: string[];
  risk_or_uncertainty_flags?: string[];
}

export interface IntentResolver {
  resolve(input: IntentResolutionInput): IntentResolutionResult;
}

export const createIntentResolver = (): IntentResolver => {
  return {
    resolve(input: IntentResolutionInput): IntentResolutionResult {
      if (input.execution_mode_hint) {
        return {
          intent_type: input.execution_mode_hint === "continuation" ? "continuation" : "new_request",
          continuation_flag: input.execution_mode_hint === "continuation",
          mode: input.execution_mode_hint,
          depth_hint: input.execution_mode_hint === "deep_context" ? "deep" : "standard",
          context_family_hints: ["memory", "state"]
        };
      }

      const continuation = input.has_session_context || input.has_workflow_context;
      return {
        intent_type: continuation ? "continuation" : "new_request",
        continuation_flag: continuation,
        mode: continuation ? "continuation" : "quick_answer",
        depth_hint: continuation ? "standard" : "shallow",
        context_family_hints: continuation ? ["state", "memory", "recent_events"] : ["memory"]
      };
    }
  };
};
