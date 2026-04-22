import type { PackInputShape } from "@orchestrator/read-path";
import type { CanonicalBundleAssemblyResult } from "@orchestrator/pack-loop";
import type { RawWritebackInput, WritePathRunResult } from "@orchestrator/write-path";
import type { HandoffRunResult } from "@orchestrator/handoff";
import type { RuntimeDispatchIntentShape, RuntimeExecutionIntentShape } from "./intents.js";

export interface OrchestrationHandoffContractShape {
  request_id: string;
  operation_id: string;
  execution_intent: RuntimeExecutionIntentShape;
  dispatch_intent: RuntimeDispatchIntentShape;
  read_pack_input?: PackInputShape;
  pack_bundle_result?: CanonicalBundleAssemblyResult;
  write_path_input?: RawWritebackInput;
  write_path_result?: WritePathRunResult;
  handoff_result?: HandoffRunResult;
}

export interface RuntimeSurfaceCanonicalLayerLinkage {
  request_id: string;
  operation_id: string;
  linked_read_path: boolean;
  linked_pack_loop: boolean;
  linked_write_path: boolean;
  linked_handoff: boolean;
  linkage_notes: string[];
}
