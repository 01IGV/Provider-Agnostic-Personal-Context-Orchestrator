import { asCanonicalId, type IsoDateTimeString } from "@orchestrator/core-foundation";
import type { NormalizedWritebackEnvelope, RawWritebackInput } from "./types.js";

export interface WritebackIntakeInput {
  raw: RawWritebackInput;
}

export interface WritebackIntaker {
  normalize(input: WritebackIntakeInput): NormalizedWritebackEnvelope;
}

export const createWritebackIntaker = (): WritebackIntaker => {
  return {
    normalize(input: WritebackIntakeInput): NormalizedWritebackEnvelope {
      const timestamp = (input.raw.signal_timestamp ?? new Date().toISOString()) as IsoDateTimeString;
      return {
        write_signal_id: input.raw.write_signal_id ?? `${input.raw.request_id}:${timestamp}`,
        request_id: input.raw.request_id,
        client_id: asCanonicalId<"client_id">(input.raw.client_id),
        subject_id: asCanonicalId<"subject_id">(input.raw.subject_id),
        ...(input.raw.session_id ? { session_id: asCanonicalId<"session_id">(input.raw.session_id) } : {}),
        ...(input.raw.workflow_id ? { workflow_id: asCanonicalId<"workflow_id">(input.raw.workflow_id) } : {}),
        source_event_ids: (input.raw.source_event_ids ?? []).map((id) => asCanonicalId<"event_id">(id)),
        source_actor_type: input.raw.source_actor_type ?? "system",
        ...(input.raw.source_actor_id ? { source_actor_id: input.raw.source_actor_id } : {}),
        signal_source: input.raw.signal_source,
        raw_signal_payload: input.raw.raw_signal_payload,
        signal_timestamp: timestamp,
        ...(input.raw.runtime_metadata ? { runtime_metadata: input.raw.runtime_metadata } : {})
      };
    }
  };
};
