import type { IsoDateTimeString } from "@orchestrator/core-foundation";
import type { AnyRuntimeEntrypointRequest, EntrypointValidationResult } from "./entrypoints.js";
import type { RuntimeDispatchIntentShape, RuntimeExecutionIntentShape } from "./intents.js";

export interface NormalizedRuntimeInvocationIntakeShape<TPayload = Record<string, unknown>> {
  intake_id: string;
  request: AnyRuntimeEntrypointRequest<TPayload>;
  validation: EntrypointValidationResult;
  execution_intent?: RuntimeExecutionIntentShape;
  dispatch_intent?: RuntimeDispatchIntentShape;
  normalization_warnings: string[];
  normalized_at: IsoDateTimeString;
}

export interface RuntimeInvocationIntakeCompatibility {
  is_compatible: boolean;
  issues: string[];
}

export interface RuntimeInvocationIntakeCompatibilityInput {
  intake: NormalizedRuntimeInvocationIntakeShape;
}

export const evaluateRuntimeInvocationIntakeCompatibility = (
  input: RuntimeInvocationIntakeCompatibilityInput
): RuntimeInvocationIntakeCompatibility => {
  const issues: string[] = [];

  if (input.intake.validation.status !== "valid") {
    issues.push("entrypoint validation is not in valid status");
  }

  if (input.intake.request.operation_id.length === 0) {
    issues.push("missing operation_id on normalized runtime invocation intake");
  }

  if (input.intake.request.request_id.length === 0) {
    issues.push("missing request_id on normalized runtime invocation intake");
  }

  return {
    is_compatible: issues.length === 0,
    issues
  };
};
