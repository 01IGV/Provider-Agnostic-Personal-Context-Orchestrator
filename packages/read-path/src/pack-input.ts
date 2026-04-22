import type { ReadRequestEnvelope } from "./types.js";
import type { RankedSelectionResult } from "./ranking-selection.js";

export interface PackInputShape {
  request_id: string;
  client_id: ReadRequestEnvelope["client_id"];
  subject_id: ReadRequestEnvelope["subject_id"];
  session_id?: ReadRequestEnvelope["session_id"];
  workflow_id?: ReadRequestEnvelope["workflow_id"];
  intent_type: string;
  mode: string;
  selected_candidates: RankedSelectionResult["selected_candidates"];
  selection_reasons: Array<{ record_id: string; reasons: string[] }>;
  scope_summary: {
    selected_scope_ids: string[];
    excluded_scope_ids: string[];
  };
  boundedness_hints?: {
    max_candidates?: number;
  };
  packing_hints?: Record<string, unknown>;
  read_confidence_notes?: string[];
}

export interface PackInputPreparationInput {
  request: ReadRequestEnvelope;
  intent_type: string;
  mode: string;
  selected: RankedSelectionResult;
  selected_scope_ids: string[];
  excluded_scope_ids: string[];
}

export interface PackInputPreparer {
  prepare(input: PackInputPreparationInput): PackInputShape;
}

export const createPackInputPreparer = (): PackInputPreparer => {
  return {
    prepare(input: PackInputPreparationInput): PackInputShape {
      return {
        request_id: input.request.request_id,
        client_id: input.request.client_id,
        subject_id: input.request.subject_id,
        ...(input.request.session_id ? { session_id: input.request.session_id } : {}),
        ...(input.request.workflow_id ? { workflow_id: input.request.workflow_id } : {}),
        intent_type: input.intent_type,
        mode: input.mode,
        selected_candidates: input.selected.selected_candidates,
        selection_reasons: input.selected.selected_candidates.map((x) => ({
          record_id: x.entry.record_id,
          reasons: x.selection_reasons
        })),
        scope_summary: {
          selected_scope_ids: input.selected_scope_ids,
          excluded_scope_ids: input.excluded_scope_ids
        }
      };
    }
  };
};
