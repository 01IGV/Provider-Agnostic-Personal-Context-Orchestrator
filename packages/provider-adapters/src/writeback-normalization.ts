import type { IsoDateTimeString } from "@orchestrator/core-foundation";
import type { WriteSignalSourceType } from "@orchestrator/write-path";
import type { RawWritebackInput } from "@orchestrator/write-path";
import type { NormalizedOutputEnvelope } from "./output-normalization.js";

export interface WritebackNormalizationInput {
  normalized_output: NormalizedOutputEnvelope;
  request_id: string;
  client_id: string;
  subject_id: string;
  session_id?: string;
  workflow_id?: string;
  signal_source?: WriteSignalSourceType;
  source_event_ids?: string[];
  source_actor_type?: string;
  source_actor_id?: string;
}

export interface CanonicalWritebackEnvelope {
  request_id: string;
  client_id: string;
  subject_id: string;
  session_id?: string;
  workflow_id?: string;
  source_event_ids: string[];
  source_actor_type: string;
  source_actor_id?: string;
  signal_source: WriteSignalSourceType;
  raw_signal_payload: Record<string, unknown>;
  signal_timestamp: IsoDateTimeString;
  runtime_metadata: Record<string, unknown>;
}

export interface WritebackEnvelopeNormalizer {
  normalize(input: WritebackNormalizationInput): CanonicalWritebackEnvelope;
  to_write_path_input(envelope: CanonicalWritebackEnvelope): RawWritebackInput;
}

export const createWritebackEnvelopeNormalizer = (): WritebackEnvelopeNormalizer => {
  return {
    normalize(input: WritebackNormalizationInput): CanonicalWritebackEnvelope {
      return {
        request_id: input.request_id,
        client_id: input.client_id,
        subject_id: input.subject_id,
        ...(input.session_id ? { session_id: input.session_id } : {}),
        ...(input.workflow_id ? { workflow_id: input.workflow_id } : {}),
        source_event_ids: input.source_event_ids ?? [],
        source_actor_type: input.source_actor_type ?? "provider_adapter",
        ...(input.source_actor_id ? { source_actor_id: input.source_actor_id } : {}),
        signal_source: input.signal_source ?? "model_output",
        raw_signal_payload: {
          normalized_payload: input.normalized_output.normalized_payload,
          normalized_tool_events: input.normalized_output.normalized_tool_events,
          ...(input.normalized_output.normalized_error_family
            ? { normalized_error_family: input.normalized_output.normalized_error_family }
            : {})
        },
        signal_timestamp: input.normalized_output.normalized_at,
        runtime_metadata: {
          provider_profile_id: input.normalized_output.provider_profile_id,
          provider_family: input.normalized_output.provider_family,
          runtime_host_type: input.normalized_output.runtime_host_type,
          warnings: input.normalized_output.warnings,
          semantic_notes: input.normalized_output.semantic_notes
        }
      };
    },

    to_write_path_input(envelope: CanonicalWritebackEnvelope): RawWritebackInput {
      return {
        request_id: envelope.request_id,
        client_id: envelope.client_id,
        subject_id: envelope.subject_id,
        ...(envelope.session_id ? { session_id: envelope.session_id } : {}),
        ...(envelope.workflow_id ? { workflow_id: envelope.workflow_id } : {}),
        source_event_ids: envelope.source_event_ids,
        source_actor_type: envelope.source_actor_type,
        ...(envelope.source_actor_id ? { source_actor_id: envelope.source_actor_id } : {}),
        signal_source: envelope.signal_source,
        raw_signal_payload: envelope.raw_signal_payload,
        signal_timestamp: envelope.signal_timestamp,
        runtime_metadata: envelope.runtime_metadata
      };
    }
  };
};
