import type { BaseQuery } from "@orchestrator/persistence-contracts";
import type { CandidateDiscovery } from "./candidate-discovery.js";
import type { EligibilityFilter } from "./eligibility-filter.js";
import type { IntentResolver } from "./intent-mode.js";
import type { PackInputPreparer, PackInputShape } from "./pack-input.js";
import type { RankingSelector } from "./ranking-selection.js";
import type { RequestNormalizer, RawReadRequest } from "./request-normalization.js";
import type { ScopeResolver } from "./scope-resolution.js";

export interface ReadPathPrimitivePipeline {
  run(raw: RawReadRequest): Promise<PackInputShape>;
}

export interface ReadPathPrimitivePipelineDeps {
  request_normalizer: RequestNormalizer;
  intent_resolver: IntentResolver;
  scope_resolver: ScopeResolver;
  candidate_discovery: CandidateDiscovery;
  eligibility_filter: EligibilityFilter;
  ranking_selector: RankingSelector;
  pack_input_preparer: PackInputPreparer;
}

export const createReadPathPrimitivePipeline = (
  deps: ReadPathPrimitivePipelineDeps
): ReadPathPrimitivePipeline => {
  return {
    async run(raw: RawReadRequest): Promise<PackInputShape> {
      const request = deps.request_normalizer.normalize(raw);
      const intent = deps.intent_resolver.resolve({
        task_signal: request.task_signal,
        ...(request.execution_mode_hint ? { execution_mode_hint: request.execution_mode_hint } : {}),
        has_session_context: !!request.session_id,
        has_workflow_context: !!request.workflow_id
      });

      const scope = deps.scope_resolver.resolve({
        ...(request.requested_scope_hints ? { requested_scope_hints: request.requested_scope_hints } : {}),
        eligible_scope_ids: request.requested_scope_hints ?? [],
        ...(request.requested_scope_hints ? { preferred_scope_ids: request.requested_scope_hints } : {})
      });

      const discoveryQuery: BaseQuery = {
        subject_id: request.subject_id,
        ...(scope.scope_priority_order[0] ? { scope_id: scope.scope_priority_order[0] } : {}),
        ...(request.session_id ? { session_id: request.session_id } : {}),
        ...(request.workflow_id ? { workflow_id: request.workflow_id } : {})
      };

      const candidates = await deps.candidate_discovery.discover({ query: discoveryQuery });
      const eligibility = deps.eligibility_filter.filter({ candidate_pool: candidates });
      const ranked = deps.ranking_selector.rank_and_select({
        eligibility_result: eligibility,
        max_selected: 20
      });

      return deps.pack_input_preparer.prepare({
        request,
        intent_type: intent.intent_type,
        mode: intent.mode,
        selected: ranked,
        selected_scope_ids: scope.scope_priority_order,
        excluded_scope_ids: scope.excluded_scopes
      });
    }
  };
};
