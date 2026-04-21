import type { ClientId, SessionId, SharedLifecycleStatus, SubjectId } from "@orchestrator/core-foundation";
import type { CanonicalEntityDiscriminator } from "../discriminators.js";
import type { Scope } from "./scope.js";

export interface Session extends CanonicalEntityDiscriminator<"identity_scope", "session"> {
  session_id: SessionId;
  subject_id: SubjectId;
  scope_id: Scope["scope_id"];
  client_id: ClientId;
  started_at: string;
  ended_at?: string;
  status: SharedLifecycleStatus;
}
