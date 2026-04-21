export const CANONICAL_SCOPE_TYPES = [
  "global_user",
  "workspace",
  "project",
  "workflow",
  "task",
  "session",
  "agent_local",
  "shared_agent",
  "organization",
  "external_source"
] as const;

export type CanonicalScopeType = (typeof CANONICAL_SCOPE_TYPES)[number];
