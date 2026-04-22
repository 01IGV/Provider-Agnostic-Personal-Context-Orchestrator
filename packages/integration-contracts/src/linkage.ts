import type { HandoffRunResult } from "@orchestrator/handoff";
import type { CanonicalBundleAssemblyResult } from "@orchestrator/pack-loop";
import type { WritePathRunResult } from "@orchestrator/write-path";
import type { PackInputShape } from "@orchestrator/read-path";

export interface SurfaceToContourLinkageShape {
  request_id: string;
  operation_id: string;
  read_pack_input?: PackInputShape;
  pack_bundle_result?: CanonicalBundleAssemblyResult;
  write_path_result?: WritePathRunResult;
  handoff_result?: HandoffRunResult;
}

export interface SurfaceMutationImpactShape {
  operation_id: string;
  planned_mutation_count: number;
  planned_derived_refresh_count: number;
  has_governance_rejection_path: boolean;
}
