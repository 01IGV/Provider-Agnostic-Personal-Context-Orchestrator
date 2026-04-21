import type { ClientId } from "@orchestrator/core-foundation";
import type { CanonicalEntityDiscriminator } from "../discriminators.js";

export const CLIENT_TYPES = ["mcp_host", "api_client", "hybrid_client"] as const;
export type ClientType = (typeof CLIENT_TYPES)[number];

export const INTEGRATION_MODES = ["mcp", "api", "hybrid"] as const;
export type IntegrationMode = (typeof INTEGRATION_MODES)[number];

export interface ClientRecord extends CanonicalEntityDiscriminator<"integration", "client_record"> {
  client_id: ClientId;
  client_type: ClientType;
  display_name: string;
  integration_mode: IntegrationMode;
  provider_family?: string;
  metadata: Record<string, unknown>;
}
