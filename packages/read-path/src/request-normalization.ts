import type {
  ClientId,
  IsoDateTimeString,
  ScopeId,
  SessionId,
  SubjectId,
  WorkflowId
} from "@orchestrator/core-foundation";
import type { ReadMode, ReadRequestEnvelope } from "./types.js";

export interface RawReadRequest {
  request_id?: string;
  client_id: ClientId;
  request_type: string;
  subject_id: SubjectId;
  owner_id?: string;
  session_id?: SessionId;
  workflow_id?: WorkflowId;
  task_signal: string;
  user_input?: string;
  input_payload?: Record<string, unknown>;
  requested_scope_hints?: ScopeId[];
  execution_mode_hint?: ReadMode;
  target_runtime?: string;
  target_provider?: string;
  target_model?: string;
  correlation_id?: string;
  created_at: IsoDateTimeString;
}

export interface RequestNormalizer {
  normalize(raw: RawReadRequest): ReadRequestEnvelope;
}

export const createRequestNormalizer = (): RequestNormalizer => {
  return {
    normalize(raw: RawReadRequest): ReadRequestEnvelope {
      return {
        request_id: raw.request_id ?? `req_${raw.created_at}`,
        client_id: raw.client_id,
        request_type: raw.request_type,
        subject_id: raw.subject_id,
        ...(raw.owner_id ? { owner_id: raw.owner_id } : {}),
        ...(raw.session_id ? { session_id: raw.session_id } : {}),
        ...(raw.workflow_id ? { workflow_id: raw.workflow_id } : {}),
        task_signal: raw.task_signal,
        input_payload: raw.input_payload ?? (raw.user_input ? { user_input: raw.user_input } : {}),
        ...(raw.requested_scope_hints ? { requested_scope_hints: raw.requested_scope_hints } : {}),
        ...(raw.execution_mode_hint ? { execution_mode_hint: raw.execution_mode_hint } : {}),
        ...(raw.target_runtime ? { target_runtime: raw.target_runtime } : {}),
        ...(raw.target_provider ? { target_provider: raw.target_provider } : {}),
        ...(raw.target_model ? { target_model: raw.target_model } : {}),
        ...(raw.correlation_id ? { correlation_id: raw.correlation_id } : {}),
        created_at: raw.created_at
      };
    }
  };
};
