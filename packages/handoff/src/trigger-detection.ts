import type { HandoffTriggerInput, HandoffTriggerPriority, HandoffTriggerResult, HandoffTriggerType } from "./types.js";

export interface HandoffTriggerDetector {
  detect(input: HandoffTriggerInput): HandoffTriggerResult;
}

const pickTriggerType = (input: HandoffTriggerInput): HandoffTriggerType | undefined => {
  if (input.explicit_transfer_requested) {
    return "explicit_transfer_request";
  }
  if (input.session_status === "ending" && (input.unresolved_open_loops_count ?? 0) > 0) {
    return "session_ending_with_active_work";
  }
  if (input.workflow_checkpoint_reached) {
    return "workflow_checkpoint";
  }
  if (input.cross_provider_continuation_expected) {
    return "cross_provider_continuation";
  }
  if ((input.unresolved_open_loops_count ?? 0) > 0) {
    return "unresolved_open_loops";
  }
  if (input.state_branch_changed) {
    return "state_branch_change";
  }
  if (input.user_paused) {
    return "user_pause_recovery";
  }
  return undefined;
};

const triggerPriority = (type: HandoffTriggerType | undefined): HandoffTriggerPriority | undefined => {
  if (!type) {
    return undefined;
  }
  if (type === "explicit_transfer_request" || type === "session_ending_with_active_work") {
    return "high";
  }
  if (type === "cross_provider_continuation" || type === "workflow_checkpoint") {
    return "medium";
  }
  return "low";
};

export const createHandoffTriggerDetector = (): HandoffTriggerDetector => {
  return {
    detect(input: HandoffTriggerInput): HandoffTriggerResult {
      const type = pickTriggerType(input);
      const priority = type ? triggerPriority(type) : undefined;

      return {
        should_trigger: !!type,
        ...(type ? { handoff_trigger_type: type } : {}),
        trigger_source_record_ids: input.source_record_ids ?? [],
        ...(type ? { continuity_reason: `triggered_by:${type}` } : {}),
        ...(priority ? { priority } : {})
      };
    }
  };
};
