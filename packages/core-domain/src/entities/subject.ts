import type { SubjectId } from "@orchestrator/core-foundation";
import type { CanonicalEntityDiscriminator } from "../discriminators.js";
import type { ExternalReference } from "./shared.js";

export const SUBJECT_TYPES = ["user", "project", "task", "workflow", "agent", "artifact", "workspace"] as const;
export type SubjectType = (typeof SUBJECT_TYPES)[number];

export interface Subject extends CanonicalEntityDiscriminator<"identity_scope", "subject"> {
  subject_id: SubjectId;
  subject_type: SubjectType;
  display_name: string;
  external_refs: ExternalReference[];
  created_at: string;
  updated_at: string;
}
