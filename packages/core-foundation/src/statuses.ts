export const SHARED_LIFECYCLE_STATUSES = [
  "active",
  "tentative",
  "pending",
  "superseded",
  "archived",
  "invalidated",
  "completed"
] as const;

export type SharedLifecycleStatus = (typeof SHARED_LIFECYCLE_STATUSES)[number];

export const MEMORY_STATUSES = [
  "active",
  "tentative",
  "superseded",
  "archived",
  "invalidated"
] as const;

export type MemoryStatus = (typeof MEMORY_STATUSES)[number];

export const STATE_STATUSES = [
  "active",
  "paused",
  "completed",
  "abandoned",
  "superseded",
  "archived"
] as const;

export type StateStatus = (typeof STATE_STATUSES)[number];

export const CANDIDATE_STATUSES = [
  "pending",
  "accepted",
  "rejected",
  "merged",
  "superseded"
] as const;

export type CandidateStatus = (typeof CANDIDATE_STATUSES)[number];
