import type { AuditId, IsoDateTimeString } from "@orchestrator/core-foundation";
import type {
  ContextBundle,
  DomainEntityId,
  HandoffArtifact,
  RuntimeInvocationRecord,
  SummaryArtifact
} from "@orchestrator/core-domain";
import type { IntegrationSurfaceType } from "@orchestrator/integration-contracts";
import type {
  PolicyEvaluationResult,
  ScopeGovernanceResult,
  TransferResult,
  VisibilityResult
} from "@orchestrator/governance";
import type {
  CandidatePool,
  EligibilityFilterResult,
  IntentResolutionResult,
  PackInputShape,
  RankedSelectionResult,
  ReadRequestEnvelope,
  ScopeResolutionResult
} from "@orchestrator/read-path";
import type {
  CanonicalBundleAssemblyResult,
  CompressionResult,
  PackingStrategyResult,
  SectionAssignmentResult,
  SectionPlanResult
} from "@orchestrator/pack-loop";
import type {
  ClassificationResultSet,
  DecisionRoutingResult,
  ExtractedCandidateSet,
  MutationPlanResult,
  NormalizedWritebackEnvelope,
  WritePathRunResult
} from "@orchestrator/write-path";
import type {
  ContinuityCandidateSet,
  HandoffArtifactAssemblyResult,
  HandoffPackagingResult,
  HandoffRunResult,
  HandoffTargetBoundaryResult,
  HandoffTriggerResult,
  HandoffValidationResult
} from "@orchestrator/handoff";
import type { AuditActorContext, AuditComponent, AuditEntityLink, AuditTraceContext } from "./types.js";

export type InvocationSurfaceType = IntegrationSurfaceType;

export interface RequestAuditShape {
  invocation_surface: InvocationSurfaceType;
  normalized_request_envelope: ReadRequestEnvelope;
  input_hash?: string;
  normalization_notes?: string[];
}

export interface ReadAuditShape {
  intent_result: IntentResolutionResult;
  scope_resolution: ScopeResolutionResult;
  candidate_pool: Pick<CandidatePool, "entries">;
  eligibility: EligibilityFilterResult;
  ranking_selection: RankedSelectionResult;
  pack_input: PackInputShape;
  boundedness_actions: string[];
  confidence_notes?: string[];
}

export interface PackAuditShape {
  strategy: PackingStrategyResult;
  section_plan: SectionPlanResult;
  section_assignment: SectionAssignmentResult;
  compression: CompressionResult;
  bundle_assembly: CanonicalBundleAssemblyResult;
}

export interface WriteAuditShape {
  writeback_envelope: NormalizedWritebackEnvelope;
  extracted_candidates: ExtractedCandidateSet;
  classifications: ClassificationResultSet;
  decision_routes: DecisionRoutingResult[];
  mutation_plan: MutationPlanResult;
  write_path_result?: WritePathRunResult;
}

export interface HandoffAuditShape {
  trigger: HandoffTriggerResult;
  target_boundary: HandoffTargetBoundaryResult;
  continuity_candidates: ContinuityCandidateSet;
  packaging: HandoffPackagingResult;
  validation: HandoffValidationResult;
  assembly?: HandoffArtifactAssemblyResult;
  handoff_run_result?: HandoffRunResult;
}

export interface GovernanceAuditShape {
  applied_policy_results: PolicyEvaluationResult[];
  scope_governance?: ScopeGovernanceResult;
  visibility_governance?: VisibilityResult;
  transfer_governance?: TransferResult;
  policy_warnings: string[];
}

export interface IntegrationAuditShape {
  surface_type: InvocationSurfaceType;
  invocation: RuntimeInvocationRecord;
  response_family: "bundle" | "write" | "handoff" | "audit" | "evaluation" | "error";
  transport_notes?: string[];
  normalized_envelope_linked: boolean;
}

export interface ArtifactProvenanceAuditShape {
  artifact_type: "context_bundle" | "summary_artifact" | "handoff_artifact";
  artifact_ref: ContextBundle | SummaryArtifact | HandoffArtifact;
  source_record_ids: DomainEntityId[];
  source_event_ids: string[];
  generation_strategy?: string;
  lineage_notes?: string[];
}

export interface AuditTraceRecord<TComponent extends AuditComponent, TDetails> {
  audit_id: AuditId;
  audit_component: TComponent;
  summary: string;
  details: TDetails;
  context: AuditTraceContext;
  actor: AuditActorContext;
  related_entities: AuditEntityLink[];
  created_at: IsoDateTimeString;
}

export type RequestAuditRecord = AuditTraceRecord<"request", RequestAuditShape>;
export type ReadAuditRecord = AuditTraceRecord<"read", ReadAuditShape>;
export type PackAuditRecord = AuditTraceRecord<"pack", PackAuditShape>;
export type WriteAuditRecord = AuditTraceRecord<"write", WriteAuditShape>;
export type HandoffAuditRecord = AuditTraceRecord<"handoff", HandoffAuditShape>;
export type GovernanceAuditRecord = AuditTraceRecord<"governance", GovernanceAuditShape>;
export type IntegrationAuditRecord = AuditTraceRecord<"integration", IntegrationAuditShape>;
export type ArtifactProvenanceAuditRecord = AuditTraceRecord<
  "artifact_provenance",
  ArtifactProvenanceAuditShape
>;

export type CanonicalAuditRecord =
  | RequestAuditRecord
  | ReadAuditRecord
  | PackAuditRecord
  | WriteAuditRecord
  | HandoffAuditRecord
  | GovernanceAuditRecord
  | IntegrationAuditRecord
  | ArtifactProvenanceAuditRecord;
