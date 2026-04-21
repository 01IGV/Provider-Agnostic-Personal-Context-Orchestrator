export const MEMORY_TYPES = [
  "fact",
  "preference",
  "constraint",
  "goal",
  "relationship_note",
  "decision",
  "open_loop",
  "profile_attribute",
  "risk_note",
  "artifact_reference",
  "instruction_preference",
  "continuity_note"
] as const;

export type MemoryType = (typeof MEMORY_TYPES)[number];

export const STATE_TYPES = [
  "workflow_step",
  "task_state",
  "pending_question",
  "checkpoint",
  "waiting_state",
  "mode_state",
  "branch_state",
  "blocked_state",
  "draft_state"
] as const;

export type StateType = (typeof STATE_TYPES)[number];

export const CANDIDATE_TYPES = [
  "memory_candidate",
  "state_candidate",
  "handoff_candidate",
  "summary_candidate"
] as const;

export type CandidateType = (typeof CANDIDATE_TYPES)[number];

export const SUMMARY_TYPES = [
  "session_summary",
  "rolling_summary",
  "project_summary",
  "workflow_summary",
  "state_brief",
  "risk_digest"
] as const;

export type SummaryType = (typeof SUMMARY_TYPES)[number];

export const HANDOFF_TYPES = [
  "session_to_session",
  "agent_to_agent",
  "workflow_step",
  "provider_transfer"
] as const;

export type HandoffType = (typeof HANDOFF_TYPES)[number];

export const RELATION_TYPES = [
  "belongs_to",
  "relates_to",
  "depends_on",
  "derived_from",
  "supersedes",
  "references",
  "blocks",
  "continues_from",
  "owned_by"
] as const;

export type RelationType = (typeof RELATION_TYPES)[number];
