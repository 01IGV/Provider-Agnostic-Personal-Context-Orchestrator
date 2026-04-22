import type { IsoDateTimeString } from "@orchestrator/core-foundation";
import type { RuntimeSurfaceErrorShape } from "./errors.js";
import type { RuntimeHandlerResultShape } from "./handlers.js";
import type { RuntimeDispatchIntentShape, RuntimeExecutionIntentShape } from "./intents.js";
import type { RuntimeSurfaceRegistryLookup } from "./registry.js";

export interface MissingHandlerResultShape {
  request_id: string;
  lookup: RuntimeSurfaceRegistryLookup;
  dispatch_intent: RuntimeDispatchIntentShape;
  error: RuntimeSurfaceErrorShape & { error_code: "missing_handler" };
}

export interface UnsupportedSurfaceResultShape {
  request_id: string;
  requested_surface_family: string;
  dispatch_intent: RuntimeDispatchIntentShape;
  error: RuntimeSurfaceErrorShape & { error_code: "unsupported_surface" };
}

export interface UnsupportedModeResultShape {
  request_id: string;
  requested_mode: string;
  dispatch_intent: RuntimeDispatchIntentShape;
  error: RuntimeSurfaceErrorShape & { error_code: "unsupported_mode" };
}

export interface NormalizedSurfaceInvocationSuccess<TResult = Record<string, unknown>> {
  request_id: string;
  operation_id: string;
  normalized: true;
  execution_intent: RuntimeExecutionIntentShape;
  dispatch_intent: RuntimeDispatchIntentShape;
  handler_result: RuntimeHandlerResultShape<TResult>;
  produced_at: IsoDateTimeString;
}

export interface NormalizedSurfaceInvocationFailure {
  request_id: string;
  operation_id?: string;
  normalized: false;
  dispatch_intent: RuntimeDispatchIntentShape;
  error: RuntimeSurfaceErrorShape;
  produced_at: IsoDateTimeString;
}

export type NormalizedSurfaceInvocationResult<TResult = Record<string, unknown>> =
  | NormalizedSurfaceInvocationSuccess<TResult>
  | NormalizedSurfaceInvocationFailure
  | MissingHandlerResultShape
  | UnsupportedSurfaceResultShape
  | UnsupportedModeResultShape;
