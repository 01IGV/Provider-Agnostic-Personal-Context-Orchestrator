import type { OwnerId } from "@orchestrator/core-foundation";
import type { CanonicalEntityDiscriminator } from "../discriminators.js";
import type { ExternalReference } from "./shared.js";

export const OWNER_TYPES = ["user", "workspace", "project", "agent", "system"] as const;
export type OwnerType = (typeof OWNER_TYPES)[number];

export interface Owner extends CanonicalEntityDiscriminator<"identity_scope", "owner"> {
  owner_id: OwnerId;
  owner_type: OwnerType;
  display_name: string;
  external_refs: ExternalReference[];
}
