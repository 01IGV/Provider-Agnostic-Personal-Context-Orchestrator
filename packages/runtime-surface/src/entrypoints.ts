import type {
  ClientId,
  CorrelationId,
  IsoDateTimeString,
  ScopeId,
  SessionId,
  SubjectId,
  WorkflowId
} from "@orchestrator/core-foundation";
import type { IntegrationSurfaceType, SurfaceResponseStatus } from "@orchestrator/integration-contracts";
import type { RuntimeSurfaceErrorShape } from "./errors.js";
import type { RuntimeDispatchIntentShape, RuntimeExecutionIntentShape } from "./intents.js";
import type {
  EntrypointValidationStatus,
  RuntimeEntrypointType,
  RuntimeSurfaceFamily,
  RuntimeSurfaceMode
} from "./vocabularies.js";

export interface RuntimeEntrypointRequestShape<TPayload = Record<string, unknown>> {
  request_id: string;
  operation_id: string;
  operation_version: string;
  client_id: ClientId;
  subject_id: SubjectId;
  scope_id?: ScopeId;
  session_id?: SessionId;
  workflow_id?: WorkflowId;
  correlation_id?: CorrelationId;
  integration_surface_type: IntegrationSurfaceType;
  entrypoint_type: RuntimeEntrypointType;
  surface_family: RuntimeSurfaceFamily;
  surface_mode: RuntimeSurfaceMode;
  payload: TPayload;
  target_runtime?: string;
  target_provider?: string;
  target_model?: string;
  received_at: IsoDateTimeString;
}

export interface McpEntrypointRequestShape<TPayload = Record<string, unknown>>
  extends RuntimeEntrypointRequestShape<TPayload> {
  entrypoint_type: "mcp";
  integration_surface_type: "mcp" | "hybrid";
  mcp_tool_name?: string;
  mcp_resource_uri?: string;
}

export interface ApiEntrypointRequestShape<TPayload = Record<string, unknown>>
  extends RuntimeEntrypointRequestShape<TPayload> {
  entrypoint_type: "api";
  integration_surface_type: "api" | "hybrid";
  api_route_id?: string;
  api_method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
}

export interface GenericRuntimeEntrypointRequestShape<TPayload = Record<string, unknown>>
  extends RuntimeEntrypointRequestShape<TPayload> {
  entrypoint_type: "generic_runtime";
  runtime_channel?: string;
  runtime_host_id?: string;
}

export type AnyRuntimeEntrypointRequest<TPayload = Record<string, unknown>> =
  | McpEntrypointRequestShape<TPayload>
  | ApiEntrypointRequestShape<TPayload>
  | GenericRuntimeEntrypointRequestShape<TPayload>;

export interface EntrypointValidationIssue {
  field: string;
  reason: string;
  expected?: string;
}

export interface EntrypointValidationResult {
  request_id: string;
  status: EntrypointValidationStatus;
  issues: EntrypointValidationIssue[];
  normalized_assumptions: string[];
}

export interface RuntimeEntrypointResponseShape<TResult = Record<string, unknown>> {
  request_id: string;
  operation_id: string;
  status: SurfaceResponseStatus;
  execution_intent?: RuntimeExecutionIntentShape;
  dispatch_intent?: RuntimeDispatchIntentShape;
  result?: TResult;
  warnings: Array<{ code: string; message: string }>;
  error?: RuntimeSurfaceErrorShape;
  served_at: IsoDateTimeString;
  correlation_id?: CorrelationId;
}
