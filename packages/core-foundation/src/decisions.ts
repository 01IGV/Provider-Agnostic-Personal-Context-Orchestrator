export const DECISION_OUTCOMES = [
  "accepted",
  "rejected",
  "updated_existing",
  "merged",
  "archived",
  "deferred"
] as const;

export type DecisionOutcome = (typeof DECISION_OUTCOMES)[number];

export const WRITE_DECISION_OUTCOMES = [
  "accept_new",
  "update_existing",
  "merge_into_existing",
  "reject",
  "archive_existing_and_replace",
  "defer",
  "derive_only"
] as const;

export type WriteDecisionOutcome = (typeof WRITE_DECISION_OUTCOMES)[number];
