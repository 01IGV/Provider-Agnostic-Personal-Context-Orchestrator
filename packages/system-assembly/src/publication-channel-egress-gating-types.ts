import type { AuditId, IsoDateTimeString } from "@orchestrator/core-foundation";
import type {
  PublicationChannelBindingTraceShape,
  PublicationEgressGateAuditLinkageShape
} from "@orchestrator/audit-eval";
import type {
  ChannelBoundEgressResponseLinkageShape,
  IntegrationPublicationChannelFamily,
  SurfaceResponseStatus
} from "@orchestrator/integration-contracts";
import type {
  RuntimeChannelBoundDeliveryReadyEnvelopeShape,
  RuntimePublicationChannelFamily
} from "@orchestrator/runtime-surface";
import type { ExecutionOutcomePublicationShape } from "./execution-outcome-publication-types.js";
import type {
  ChannelEligibilityStatus,
  EgressGateStatus,
  EgressGatingWarningCode,
  PublicationChannelFamily
} from "./publication-channel-egress-gating-vocabularies.js";

export interface EgressGatingWarningShape {
  code: EgressGatingWarningCode;
  message: string;
}

export interface ChannelCapabilityEligibilityShape {
  channel_family: PublicationChannelFamily;
  eligibility_status: ChannelEligibilityStatus;
  capability_fit: "fit" | "partial_fit" | "no_fit" | "unknown_fit";
  required_capabilities: string[];
  available_capabilities: string[];
  warnings: EgressGatingWarningShape[];
}

export interface PublicationChannelBindingResultShape {
  binding_id: string;
  request_id: string;
  operation_id: string;
  publication_family: ExecutionOutcomePublicationShape["publication_family"];
  selected_channel_family: PublicationChannelFamily;
  candidate_channel_families: PublicationChannelFamily[];
  binding_status: "bound" | "partially_bound" | "unbound" | "unsupported";
  eligibility: ChannelCapabilityEligibilityShape;
  warnings: EgressGatingWarningShape[];
  bound_at: IsoDateTimeString;
}

export interface ChannelBindingToEgressLinkageShape {
  linkage_id: string;
  publication_id: string;
  binding_id: string;
  request_id: string;
  operation_id: string;
  channel_family: PublicationChannelFamily;
  linked_at: IsoDateTimeString;
  warnings: EgressGatingWarningShape[];
}

export interface EgressGateResultShape {
  gate_id: string;
  request_id: string;
  operation_id: string;
  channel_family: PublicationChannelFamily;
  gate_status: EgressGateStatus;
  reason: string;
  warnings: EgressGatingWarningShape[];
}

export interface AllowedEgressContractShape {
  status: "allowed";
  gate: EgressGateResultShape;
}

export interface BlockedEgressContractShape {
  status: "blocked";
  gate: EgressGateResultShape;
}

export interface DeferredEgressContractShape {
  status: "deferred";
  gate: EgressGateResultShape;
}

export interface UnsupportedEgressContractShape {
  status: "unsupported";
  gate: EgressGateResultShape;
}

export interface PartiallyBindableEgressContractShape {
  status: "partially_bindable";
  gate: EgressGateResultShape;
}

export interface PublicationChannelEgressGatingInputShape {
  publication_result: ExecutionOutcomePublicationShape;
  now?: IsoDateTimeString;
  linked_audit_id?: AuditId;
}

export interface PublicationChannelEgressGatingShape {
  channel_egress_id: string;
  request_id: string;
  operation_id: string;
  publication_id: string;
  channel_binding: PublicationChannelBindingResultShape;
  channel_binding_to_egress_linkage: ChannelBindingToEgressLinkageShape;
  egress_gate_result: EgressGateResultShape;
  allowed_egress?: AllowedEgressContractShape;
  blocked_egress?: BlockedEgressContractShape;
  deferred_egress?: DeferredEgressContractShape;
  unsupported_egress?: UnsupportedEgressContractShape;
  partially_bindable_egress?: PartiallyBindableEgressContractShape;
  channel_bound_surface_envelope: RuntimeChannelBoundDeliveryReadyEnvelopeShape;
  channel_bound_integration_envelope: ChannelBoundEgressResponseLinkageShape<Record<string, unknown>>;
  channel_binding_trace: PublicationChannelBindingTraceShape;
  egress_gate_audit_linkage: PublicationEgressGateAuditLinkageShape;
  surface_status: SurfaceResponseStatus;
  warnings: EgressGatingWarningShape[];
  prepared_at: IsoDateTimeString;
}

export interface PublicationChannelEgressGatingSummaryShape {
  total: number;
  allowed: number;
  blocked: number;
  deferred: number;
  unsupported: number;
  partially_bindable: number;
  incomplete: number;
  warnings: EgressGatingWarningShape[];
}

export type RuntimeToIntegrationChannelFamilyMap = Record<
  RuntimePublicationChannelFamily,
  IntegrationPublicationChannelFamily
>;
