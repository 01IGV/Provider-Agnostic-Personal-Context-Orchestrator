import type { AuditId, IsoDateTimeString } from "@orchestrator/core-foundation";
import type {
  PublicationDispatchIntentAuditLinkageShape,
  PublicationDispatchIntentTraceShape
} from "@orchestrator/audit-eval";
import type { PublicationDispatchIntentLinkageShape, SurfaceResponseStatus } from "@orchestrator/integration-contracts";
import type {
  RuntimePublicationDispatchIntentEnvelopeShape,
  RuntimePublicationDispatchTargetFamily
} from "@orchestrator/runtime-surface";
import type { PublicationChannelEgressGatingShape } from "./publication-channel-egress-gating-types.js";
import type {
  PublicationDispatchIntentFamily,
  PublicationDispatchIntentStatus,
  PublicationDispatchIntentWarningCode,
  PublicationDispatchTargetFamily
} from "./publication-dispatch-intent-vocabularies.js";

export interface PublicationDispatchIntentWarningShape {
  code: PublicationDispatchIntentWarningCode;
  message: string;
}

export interface DispatchTargetExpectationShape {
  dispatch_target_family: PublicationDispatchTargetFamily;
  expected_handler_boundary: "mcp_handler_boundary" | "api_handler_boundary" | "hybrid_handler_boundary" | "unknown_handler_boundary";
  expected_channel_family: PublicationChannelEgressGatingShape["channel_binding"]["selected_channel_family"];
  required_dispatch_capabilities: string[];
  expected_dispatch_mode: "synchronous" | "asynchronous" | "mixed" | "unknown";
  warnings: PublicationDispatchIntentWarningShape[];
}

export interface DispatchIntentStatusMappingShape {
  dispatch_intent_status: PublicationDispatchIntentStatus;
  surface_status: SurfaceResponseStatus;
  dispatch_intent_family: PublicationDispatchIntentFamily;
}

export interface ChannelBoundToDispatchIntentLinkageShape {
  linkage_id: string;
  channel_egress_id: string;
  request_id: string;
  operation_id: string;
  publication_family: PublicationChannelEgressGatingShape["channel_binding"]["publication_family"];
  dispatch_intent_family: PublicationDispatchIntentFamily;
  dispatch_target_family: PublicationDispatchTargetFamily;
  linked_at: IsoDateTimeString;
  warnings: PublicationDispatchIntentWarningShape[];
}

export interface EgressGateToDispatchEligibilityShape {
  gate_status: PublicationChannelEgressGatingShape["egress_gate_result"]["gate_status"];
  dispatch_intent_status: PublicationDispatchIntentStatus;
  eligible_for_dispatch: boolean;
  reason: string;
}

export interface AllowedDispatchIntentContractShape {
  status: "dispatch_allowed";
  reason: string;
  payload: Record<string, unknown>;
}

export interface BlockedDispatchIntentContractShape {
  status: "dispatch_blocked";
  reason: string;
  payload: Record<string, unknown>;
}

export interface DeferredDispatchIntentContractShape {
  status: "dispatch_deferred";
  reason: string;
  payload: Record<string, unknown>;
}

export interface UnsupportedDispatchIntentContractShape {
  status: "dispatch_unsupported";
  reason: string;
  payload: Record<string, unknown>;
}

export interface PublicationDispatchIntentInputShape {
  channel_egress_result: PublicationChannelEgressGatingShape;
  now?: IsoDateTimeString;
  linked_audit_id?: AuditId;
}

export interface PublicationDispatchIntentShape {
  dispatch_intent_id: string;
  request_id: string;
  operation_id: string;
  channel_egress_id: string;
  dispatch_intent_family: PublicationDispatchIntentFamily;
  dispatch_target_expectation: DispatchTargetExpectationShape;
  dispatch_intent_status: PublicationDispatchIntentStatus;
  dispatch_status_mapping: DispatchIntentStatusMappingShape;
  channel_to_dispatch_linkage: ChannelBoundToDispatchIntentLinkageShape;
  egress_gate_dispatch_eligibility: EgressGateToDispatchEligibilityShape;
  allowed_dispatch_intent?: AllowedDispatchIntentContractShape;
  blocked_dispatch_intent?: BlockedDispatchIntentContractShape;
  deferred_dispatch_intent?: DeferredDispatchIntentContractShape;
  unsupported_dispatch_intent?: UnsupportedDispatchIntentContractShape;
  surface_dispatch_intent_envelope: RuntimePublicationDispatchIntentEnvelopeShape;
  integration_dispatch_intent_linkage: PublicationDispatchIntentLinkageShape<Record<string, unknown>>;
  dispatch_intent_trace: PublicationDispatchIntentTraceShape;
  dispatch_intent_audit_linkage: PublicationDispatchIntentAuditLinkageShape;
  warnings: PublicationDispatchIntentWarningShape[];
  prepared_at: IsoDateTimeString;
}

export interface PublicationDispatchIntentSummaryShape {
  total: number;
  dispatch_allowed: number;
  dispatch_blocked: number;
  dispatch_deferred: number;
  dispatch_unsupported: number;
  dispatch_incomplete: number;
  by_target_family: Record<RuntimePublicationDispatchTargetFamily, number>;
  warnings: PublicationDispatchIntentWarningShape[];
}
