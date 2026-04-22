import type { CapabilityClass, OperationFamily } from "@orchestrator/integration-contracts";
import type { RuntimeSurfaceErrorShape } from "./errors.js";
import type { RuntimeDispatchIntentShape, RuntimeExecutionIntentShape } from "./intents.js";
import type { AnyRuntimeEntrypointRequest, EntrypointValidationResult } from "./entrypoints.js";
import type { RuntimeHandlerResultStatus, RuntimeSurfaceFamily, RuntimeSurfaceMode } from "./vocabularies.js";

export interface HandlerDependencyRequirementShape {
  requirement_id: string;
  dependency_token: string;
  required: boolean;
  description?: string;
}

export interface RuntimeHandlerCapabilityRequirementShape {
  capability_class: CapabilityClass;
  operation_family: OperationFamily;
  supported_surface_families: RuntimeSurfaceFamily[];
  supported_modes: RuntimeSurfaceMode[];
}

export interface RuntimeHandlerInputShape<TPayload = Record<string, unknown>> {
  request: AnyRuntimeEntrypointRequest<TPayload>;
  validation: EntrypointValidationResult;
  execution_intent: RuntimeExecutionIntentShape;
  dispatch_intent: RuntimeDispatchIntentShape;
  dependency_requirements: HandlerDependencyRequirementShape[];
}

export interface RuntimeHandlerOutputShape<TResult = Record<string, unknown>> {
  handler_id: string;
  operation_id: string;
  operation_family: OperationFamily;
  status: Exclude<RuntimeHandlerResultStatus, "missing_handler" | "unsupported_surface" | "unsupported_mode">;
  result?: TResult;
  warnings: Array<{ code: string; message: string }>;
  error?: RuntimeSurfaceErrorShape;
}

export interface RuntimeHandlerResultShape<TResult = Record<string, unknown>> {
  request_id: string;
  status: RuntimeHandlerResultStatus;
  handler_output?: RuntimeHandlerOutputShape<TResult>;
}
