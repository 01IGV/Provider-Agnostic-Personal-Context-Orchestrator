import type { ContextBundle } from "@orchestrator/core-domain";
import type { PackInputShape } from "@orchestrator/read-path";

export const PACKING_STRATEGIES = [
  "minimal_direct",
  "continuity_first",
  "state_first",
  "planning_first",
  "handoff_first",
  "artifact_supported",
  "deep_context",
  "strict_budget"
] as const;

export type PackingStrategy = (typeof PACKING_STRATEGIES)[number];

export const BUNDLE_SECTION_IDS = [
  "purpose",
  "task_frame",
  "user_frame",
  "relevant_facts",
  "active_state",
  "open_loops",
  "constraints",
  "recent_decisions",
  "risk_notes",
  "artifact_refs",
  "uncertainty_notes",
  "tool_hints",
  "bundle_metadata"
] as const;

export type BundleSectionId = (typeof BUNDLE_SECTION_IDS)[number];

export const COMPRESSION_POLICIES = [
  "verbatim",
  "normalized_short",
  "structured_bullet",
  "section_synthesis",
  "hybrid"
] as const;

export type CompressionPolicy = (typeof COMPRESSION_POLICIES)[number];

export const PACKING_WARNING_CODES = [
  "budget_pressure",
  "section_overflow",
  "strategy_fallback",
  "empty_required_section"
] as const;

export type PackingWarningCode = (typeof PACKING_WARNING_CODES)[number];

export const PACKING_OMISSION_REASONS = [
  "budget_limited",
  "section_not_planned",
  "lower_priority_trim",
  "compression_pruned"
] as const;

export type PackingOmissionReason = (typeof PACKING_OMISSION_REASONS)[number];

export interface PackingWarning {
  code: PackingWarningCode;
  note: string;
}

export interface PackInputConsumption extends PackInputShape {
  target_runtime?: string;
  target_provider?: string;
  target_model?: string;
  token_budget?: number;
  latency_expectation?: "low" | "medium" | "high";
  depth_required?: "low" | "medium" | "high";
  continuity_sensitivity?: "low" | "medium" | "high";
  handoff_sensitivity?: "low" | "medium" | "high";
  tool_usage_expected?: boolean;
}

export interface PackingStrategyResult {
  packing_strategy: PackingStrategy;
  bundle_section_template: BundleSectionId[];
  compression_policy: CompressionPolicy;
  priority_retention_policy: string;
  target_budget: number;
}

export interface SectionPlanEntry {
  section_id: BundleSectionId;
  required: boolean;
  empty_section_behavior: "omit_section" | "emit_empty_marker";
  budget_hint_tokens?: number;
  max_items?: number;
}

export interface SectionPlanResult {
  ordered_sections: SectionPlanEntry[];
  required_sections: BundleSectionId[];
  optional_sections: BundleSectionId[];
}

export interface AssignedCandidate {
  section_id: BundleSectionId;
  record_id: string;
  source_family: string;
  priority_class: string;
  selection_reasons: string[];
  record: Record<string, unknown>;
}

export interface CandidateAssignmentOmission {
  record_id: string;
  reason: PackingOmissionReason;
}

export interface SectionAssignmentResult {
  assignments: Partial<Record<BundleSectionId, AssignedCandidate[]>>;
  unassigned: CandidateAssignmentOmission[];
}

export interface CompressedCandidate {
  record_id: string;
  source_family: string;
  priority_class: string;
  selection_reasons: string[];
  representation_mode: CompressionPolicy;
  shaped_content: Record<string, unknown>;
}

export interface CompressedSection {
  section_id: BundleSectionId;
  items: CompressedCandidate[];
  omitted: CandidateAssignmentOmission[];
}

export interface CompressionResult {
  sections: CompressedSection[];
  omissions: CandidateAssignmentOmission[];
  warnings: PackingWarning[];
  estimated_tokens: number;
}

export interface CanonicalBundleAssemblyResult {
  bundle: ContextBundle;
  strategy: PackingStrategyResult;
  section_plan: SectionPlanResult;
  section_assignment: SectionAssignmentResult;
  compression: CompressionResult;
  warnings: PackingWarning[];
}
