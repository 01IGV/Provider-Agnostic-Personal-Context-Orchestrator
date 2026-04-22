import type { DecisionRoutingResult, MutationPlanResult, MutationPlanStep } from "./types.js";

export interface MutationPlanInput {
  routes: DecisionRoutingResult[];
}

export interface MutationPlanner {
  plan(input: MutationPlanInput): MutationPlanResult;
}

const stepFromRoute = (route: DecisionRoutingResult): MutationPlanStep => {
  if (route.decision_outcome === "rejected" || route.decision_outcome === "deferred") {
    return {
      candidate_id: route.candidate_id,
      action: "no_op",
      rationale: `decision_outcome:${route.decision_outcome}`
    };
  }

  if (route.route_family === "derived_summary_refresh") {
    return {
      candidate_id: route.candidate_id,
      action: "refresh_summary_artifact",
      rationale: "decision accepted for derived summary refresh",
      planned_status: "active"
    };
  }

  if (route.route_family === "derived_handoff_refresh") {
    return {
      candidate_id: route.candidate_id,
      action: "refresh_handoff_artifact",
      rationale: "decision accepted for derived handoff refresh",
      planned_status: "active"
    };
  }

  if (route.mutation_intent === "update") {
    return {
      candidate_id: route.candidate_id,
      action: "update_existing_record",
      ...(route.target_record_id ? { target_record_id: route.target_record_id } : {}),
      rationale: "decision recommends update_existing"
    };
  }

  if (route.mutation_intent === "merge") {
    return {
      candidate_id: route.candidate_id,
      action: "merge_into_existing_record",
      ...(route.target_record_id ? { target_record_id: route.target_record_id } : {}),
      rationale: "decision recommends merge_into_existing"
    };
  }

  if (route.mutation_intent === "archive") {
    return {
      candidate_id: route.candidate_id,
      action: "supersede_existing_record",
      ...(route.target_record_id ? { target_record_id: route.target_record_id } : {}),
      rationale: "decision recommends archive_existing_and_replace",
      planned_status: "superseded"
    };
  }

  return {
    candidate_id: route.candidate_id,
    action: route.route_family === "canonical_state_write" ? "create_state_object" : "create_memory_object",
    rationale: "decision accepted create path",
    planned_status: "active"
  };
};

export const createMutationPlanner = (): MutationPlanner => {
  return {
    plan(input: MutationPlanInput): MutationPlanResult {
      return {
        plan_steps: input.routes.map((route) => stepFromRoute(route))
      };
    }
  };
};
