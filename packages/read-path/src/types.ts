import type {
  ClientId,
  IsoDateTimeString,
  ScopeId,
  SessionId,
  SubjectId,
  WorkflowId
} from "@orchestrator/core-foundation";

export const READ_MODES = [
  "quick_answer",
  "continuation",
  "planning",
  "handoff_recovery",
  "workflow_execution",
  "deep_context",
  "state_reconstruction"
] as const;

export type ReadMode = (typeof READ_MODES)[number];

export const READ_DEPTH_HINTS = ["shallow", "standard", "deep"] as const;
export type ReadDepthHint = (typeof READ_DEPTH_HINTS)[number];

export interface ReadRequestEnvelope {
  request_id: string;
  client_id: ClientId;
  request_type: string;
  subject_id: SubjectId;
  owner_id?: string;
  session_id?: SessionId;
  workflow_id?: WorkflowId;
  task_signal: string;
  input_payload: Record<string, unknown>;
  requested_scope_hints?: ScopeId[];
  execution_mode_hint?: ReadMode;
  target_runtime?: string;
  target_provider?: string;
  target_model?: string;
  correlation_id?: string;
  created_at: IsoDateTimeString;
}

export interface ReadBoundednessHints {
  max_candidates?: number;
  max_per_scope?: number;
  max_per_source_family?: number;
}

export interface ReadPipelineContext {
  request: ReadRequestEnvelope;
  boundedness_hints?: ReadBoundednessHints;
}
