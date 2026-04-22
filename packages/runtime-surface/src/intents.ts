import type { IsoDateTimeString } from "@orchestrator/core-foundation";
import type { OperationFamily } from "@orchestrator/integration-contracts";
import type {
  HandlerDispatchIntentType,
  HandlerExecutionIntentType,
  RuntimeEntrypointType,
  RuntimeSurfaceFamily,
  RuntimeSurfaceMode
} from "./vocabularies.js";

export interface RuntimeExecutionIntentShape {
  intent_id: string;
  request_id: string;
  operation_id: string;
  operation_family: OperationFamily;
  execution_intent_type: HandlerExecutionIntentType;
  surface_family: RuntimeSurfaceFamily;
  surface_mode: RuntimeSurfaceMode;
  entrypoint_type: RuntimeEntrypointType;
  created_at: IsoDateTimeString;
  notes?: string[];
}

export interface RuntimeDispatchIntentShape {
  dispatch_intent_id: string;
  request_id: string;
  operation_id: string;
  dispatch_intent_type: HandlerDispatchIntentType;
  target_handler_id?: string;
  requested_capability_class?: string;
  reason?: string;
}

export interface RuntimeIntentBundle {
  execution_intent: RuntimeExecutionIntentShape;
  dispatch_intent: RuntimeDispatchIntentShape;
}
