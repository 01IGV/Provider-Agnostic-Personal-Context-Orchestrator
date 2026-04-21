export const VISIBILITY_TYPES = [
  "private",
  "subject_scoped",
  "shared_agent",
  "workspace_visible",
  "system_internal",
  "restricted_derived"
] as const;

export type VisibilityType = (typeof VISIBILITY_TYPES)[number];
