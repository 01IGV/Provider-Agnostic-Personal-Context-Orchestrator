import type { CapabilityClass } from "@orchestrator/integration-contracts";
import type {
  HandlerDispatchIntentType,
  HandlerExecutionIntentType,
  RuntimeDispatchIntentShape,
  RuntimeExecutionIntentShape
} from "@orchestrator/runtime-surface";
import type { NormalizedOutputEnvelope } from "./output-normalization.js";
import type { ProjectionPlan } from "./projection-plan.js";

export interface AdapterRuntimeIntentBoundaryShape {
  request_id: string;
  operation_id: string;
  execution_intent_type: HandlerExecutionIntentType;
  dispatch_intent_type: HandlerDispatchIntentType;
  requested_capability_class?: CapabilityClass;
  target_handler_id?: string;
  projection_strategy: ProjectionPlan["projection_strategy"];
  output_normalized: boolean;
  boundary_notes: string[];
}

export interface AdapterRuntimeIntentBoundaryInput {
  execution_intent: RuntimeExecutionIntentShape;
  dispatch_intent: RuntimeDispatchIntentShape;
  projection_plan: ProjectionPlan;
  normalized_output?: NormalizedOutputEnvelope;
}

export const createAdapterRuntimeIntentBoundary = (
  input: AdapterRuntimeIntentBoundaryInput
): AdapterRuntimeIntentBoundaryShape => {
  const outputNormalized = Boolean(input.normalized_output);

  return {
    request_id: input.execution_intent.request_id,
    operation_id: input.execution_intent.operation_id,
    execution_intent_type: input.execution_intent.execution_intent_type,
    dispatch_intent_type: input.dispatch_intent.dispatch_intent_type,
    ...(input.dispatch_intent.requested_capability_class
      ? { requested_capability_class: input.dispatch_intent.requested_capability_class }
      : {}),
    ...(input.dispatch_intent.target_handler_id ? { target_handler_id: input.dispatch_intent.target_handler_id } : {}),
    projection_strategy: input.projection_plan.projection_strategy,
    output_normalized: outputNormalized,
    boundary_notes: [
      "provider-adapter boundary consumed runtime intents as contracts only",
      ...(outputNormalized ? ["normalized output available for canonical writeback linkage"] : [])
    ]
  };
};
