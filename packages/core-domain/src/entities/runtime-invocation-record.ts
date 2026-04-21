import type {
  BundleId,
  ClientId,
  InvocationId,
  SessionId,
  SharedLifecycleStatus,
  WorkflowId
} from "@orchestrator/core-foundation";
import type { CanonicalEntityDiscriminator } from "../discriminators.js";

export interface RuntimeInvocationRecord extends CanonicalEntityDiscriminator<"integration", "runtime_invocation_record"> {
  invocation_id: InvocationId;
  client_id: ClientId;
  session_id?: SessionId;
  workflow_id?: WorkflowId;
  bundle_id?: BundleId;
  started_at: string;
  completed_at?: string;
  status: SharedLifecycleStatus;
  provider: string;
  model_name?: string;
  tool_usage_summary?: Record<string, unknown>;
  execution_metadata: Record<string, unknown>;
}
