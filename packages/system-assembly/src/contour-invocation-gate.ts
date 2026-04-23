import type { IsoDateTimeString } from "@orchestrator/core-foundation";
import type { OperationFamily } from "@orchestrator/integration-contracts";
import type {
  ContourBoundaryReferenceShape,
  ContourInvocationEligibilityShape,
  ContourInvocationGateInput,
  ContourInvocationGateResultShape,
  ContourInvocationGateSummaryShape,
  ContourInvocationGateWarningShape,
  ContourInvocationResultExpectationShape,
  ContourInvocationPlaceholderShape,
  ContourTargetResolutionShape,
  DispatchPlanContourLinkageShape,
  NormalizedContourInvocationRequestShape
} from "./contour-invocation-gate-types.js";
import type {
  ContourInvocationBlockedReasonCode,
  ContourResultExpectationKind,
  ContourTargetIdentifier
} from "./contour-invocation-gate-vocabularies.js";

const contourTargetFromFamily = (family: string): ContourTargetIdentifier | undefined => {
  if (family === "read_path" || family === "pack_loop" || family === "write_path" || family === "handoff") {
    return family;
  }

  return undefined;
};

const expectationKindByTarget: Record<ContourTargetIdentifier, ContourResultExpectationKind> = {
  read_path: "read_path_pack_input",
  pack_loop: "pack_loop_bundle",
  write_path: "write_path_run",
  handoff: "handoff_run"
};

const placeholderContractByTarget: Record<ContourTargetIdentifier, ContourInvocationPlaceholderShape["expected_request_contract"]> =
  {
    read_path: "ReadPipelineContext",
    pack_loop: "PackInputConsumption",
    write_path: "RawWritebackInput",
    handoff: "HandoffTriggerInput"
  };

const buildContourTargetResolution = (input: ContourInvocationGateInput): ContourTargetResolutionShape => {
  const dispatchPlan = input.dispatch_result.dispatch_plan;
  const contourFamily = dispatchPlan?.contour_boundary.contour_family;
  const target = contourFamily ? contourTargetFromFamily(contourFamily) : undefined;

  if (!dispatchPlan) {
    return {
      request_id: input.dispatch_result.intake.request.request_id,
      operation_id: input.dispatch_result.intake.request.operation_id,
      resolution_status: "missing_plan",
      notes: ["dispatch plan is missing for contour target resolution"]
    };
  }

  if (!target) {
    return {
      request_id: input.dispatch_result.intake.request.request_id,
      operation_id: input.dispatch_result.intake.request.operation_id,
      dispatch_plan_id: dispatchPlan.dispatch_plan_id,
      resolution_status: "unsupported",
      operation_family: dispatchPlan.contour_boundary.operation_family,
      notes: ["dispatch plan points to unsupported contour family for current gate contract"]
    };
  }

  return {
    request_id: input.dispatch_result.intake.request.request_id,
    operation_id: input.dispatch_result.intake.request.operation_id,
    dispatch_plan_id: dispatchPlan.dispatch_plan_id,
    resolution_status: "resolved",
    contour_target: target,
    operation_family: dispatchPlan.contour_boundary.operation_family,
    notes: ["contour target resolved from dispatch plan boundary"]
  };
};

const buildBoundaryReference = (input: ContourInvocationGateInput): ContourBoundaryReferenceShape | undefined => {
  const dispatchPlan = input.dispatch_result.dispatch_plan;
  const contourTarget = dispatchPlan?.contour_boundary.contour_family
    ? contourTargetFromFamily(dispatchPlan.contour_boundary.contour_family)
    : undefined;

  if (!dispatchPlan || !contourTarget) {
    return undefined;
  }

  return {
    request_id: input.dispatch_result.intake.request.request_id,
    operation_id: input.dispatch_result.intake.request.operation_id,
    contour_target: contourTarget,
    operation_family: dispatchPlan.contour_boundary.operation_family,
    pipeline_dependency_token: dispatchPlan.contour_boundary.pipeline_dependency_token,
    pipeline_available: dispatchPlan.contour_boundary.pipeline_available,
    invocation_allowed: dispatchPlan.contour_boundary.invocation_allowed,
    boundary_notes: dispatchPlan.contour_boundary.boundary_notes
  };
};

const buildLinkageWarnings = (input: {
  resolution: ContourTargetResolutionShape;
  boundary?: ContourBoundaryReferenceShape;
}): ContourInvocationGateWarningShape[] => {
  return [
    ...(input.resolution.resolution_status === "missing_plan"
      ? [{ code: "dispatch_plan_unavailable", message: "dispatch plan is missing for contour linkage" } as const]
      : []),
    ...(input.resolution.resolution_status === "unsupported"
      ? [{ code: "dispatch_status_requires_followup", message: "dispatch plan resolved to unsupported contour target" } as const]
      : []),
    ...(input.boundary && !input.boundary.pipeline_available
      ? [{ code: "boundary_reference_incomplete", message: "contour boundary reference exists but pipeline is unavailable" } as const]
      : [])
  ];
};

const buildLinkage = (input: {
  gateInput: ContourInvocationGateInput;
  resolution: ContourTargetResolutionShape;
  boundary?: ContourBoundaryReferenceShape;
}): DispatchPlanContourLinkageShape => {
  return {
    linkage_id: `${input.gateInput.dispatch_result.dispatch_result_id}:contour-linkage`,
    dispatch_result_id: input.gateInput.dispatch_result.dispatch_result_id,
    request_id: input.gateInput.dispatch_result.intake.request.request_id,
    operation_id: input.gateInput.dispatch_result.intake.request.operation_id,
    ...(input.gateInput.dispatch_result.dispatch_plan
      ? {
          dispatch_plan_id: input.gateInput.dispatch_result.dispatch_plan.dispatch_plan_id,
          planning_status: input.gateInput.dispatch_result.dispatch_plan.planning_status
        }
      : {}),
    contour_target_resolution: input.resolution,
    ...(input.boundary ? { linked_boundary: input.boundary } : {}),
    linkage_warnings: buildLinkageWarnings({
      resolution: input.resolution,
      ...(input.boundary ? { boundary: input.boundary } : {})
    })
  };
};

const toBlockedReasonCodes = (input: {
  gateInput: ContourInvocationGateInput;
  resolution: ContourTargetResolutionShape;
  boundary?: ContourBoundaryReferenceShape;
}): ContourInvocationBlockedReasonCode[] => {
  const reasons: ContourInvocationBlockedReasonCode[] = [];

  if (input.resolution.resolution_status === "missing_plan") {
    reasons.push("dispatch_plan_missing");
  }

  if (input.gateInput.dispatch_result.status !== "dispatch_planned") {
    reasons.push("dispatch_status_not_planned");
  }

  if (input.gateInput.dispatch_readiness && input.gateInput.dispatch_readiness.readiness_status !== "ready") {
    reasons.push("dispatch_readiness_not_ready");
  }

  if (input.gateInput.dispatch_result.dependency_validation.missing_dependencies.length > 0) {
    reasons.push("dependency_unresolved");
  }

  if (!input.boundary) {
    reasons.push("missing_boundary_reference");
  } else if (!input.boundary.pipeline_available || !input.boundary.invocation_allowed) {
    reasons.push("pipeline_unavailable");
  }

  if (input.resolution.resolution_status === "unsupported") {
    reasons.push("unsupported_contour_target");
  }

  if (input.resolution.resolution_status === "ambiguous") {
    reasons.push("ambiguous_contour_target");
  }

  return Array.from(new Set(reasons));
};

const resolveStatus = (input: {
  resolution: ContourTargetResolutionShape;
  blockedReasons: ContourInvocationBlockedReasonCode[];
}): ContourInvocationEligibilityShape["status"] => {
  if (input.resolution.resolution_status === "unsupported") {
    return "unsupported_contour";
  }

  if (input.resolution.resolution_status === "missing_plan") {
    return "missing_boundary";
  }

  if (input.resolution.resolution_status === "ambiguous") {
    return "ambiguous_target";
  }

  return input.blockedReasons.length === 0 ? "eligible" : "blocked";
};

const buildEligibility = (input: {
  gateInput: ContourInvocationGateInput;
  resolution: ContourTargetResolutionShape;
  boundary?: ContourBoundaryReferenceShape;
}): ContourInvocationEligibilityShape => {
  const blockedReasonCodes = toBlockedReasonCodes(input);
  const status = resolveStatus({ resolution: input.resolution, blockedReasons: blockedReasonCodes });

  const warnings: ContourInvocationGateWarningShape[] = [
    ...(status === "eligible"
      ? []
      : [{ code: "eligibility_not_ready", message: "contour invocation gate is not ready for execution layer handoff" } as const])
  ];

  return {
    request_id: input.gateInput.dispatch_result.intake.request.request_id,
    operation_id: input.gateInput.dispatch_result.intake.request.operation_id,
    status,
    ready_for_execution_layer: status === "eligible",
    blocked_reason_codes: blockedReasonCodes,
    warnings
  };
};

const toOperationFamily = (dispatchResult: ContourInvocationGateInput["dispatch_result"]): OperationFamily | undefined => {
  if (dispatchResult.dispatch_plan) {
    return dispatchResult.dispatch_plan.contour_boundary.operation_family;
  }

  return dispatchResult.resolution_result.operation_family;
};

const buildInvocationRequest = (input: {
  gateInput: ContourInvocationGateInput;
  resolution: ContourTargetResolutionShape;
  eligibility: ContourInvocationEligibilityShape;
  now: IsoDateTimeString;
}): NormalizedContourInvocationRequestShape | undefined => {
  if (input.eligibility.status !== "eligible" || !input.resolution.contour_target || !input.gateInput.dispatch_result.dispatch_plan) {
    return undefined;
  }

  const operationFamily = toOperationFamily(input.gateInput.dispatch_result);
  if (!operationFamily) {
    return undefined;
  }

  const target = input.resolution.contour_target;
  const requestPlaceholder = (input.gateInput.placeholders?.[target] as Record<string, unknown> | undefined) ?? {};

  return {
    contour_request_id: `${input.gateInput.dispatch_result.intake.request.request_id}:${target}:contour-request`,
    request_id: input.gateInput.dispatch_result.intake.request.request_id,
    operation_id: input.gateInput.dispatch_result.intake.request.operation_id,
    contour_target: target,
    operation_family: operationFamily,
    source_dispatch_result_id: input.gateInput.dispatch_result.dispatch_result_id,
    source_dispatch_plan_id: input.gateInput.dispatch_result.dispatch_plan.dispatch_plan_id,
    request_placeholder: {
      contour_target: target,
      expected_request_contract: placeholderContractByTarget[target],
      request_placeholder: requestPlaceholder
    } as ContourInvocationPlaceholderShape,
    normalized_at: input.now,
    notes: ["contour invocation request normalized for contract-level gate handoff only"]
  };
};

const buildResultExpectation = (input: {
  gateInput: ContourInvocationGateInput;
  resolution: ContourTargetResolutionShape;
  eligibility: ContourInvocationEligibilityShape;
}): ContourInvocationResultExpectationShape => {
  const target = input.resolution.contour_target;
  const expectedKind = target ? expectationKindByTarget[target] : "no_contour_result";

  return {
    request_id: input.gateInput.dispatch_result.intake.request.request_id,
    operation_id: input.gateInput.dispatch_result.intake.request.operation_id,
    ...(target ? { contour_target: target } : {}),
    expected_result_kind: expectedKind,
    expectation_status: input.eligibility.status === "eligible" ? "awaiting_execution_layer" : "unavailable",
    expectation_notes: [
      "result expectation is a placeholder contract for future execution layer",
      ...(input.eligibility.status === "eligible"
        ? ["contour execution is intentionally deferred to a dedicated execution pass"]
        : [])
    ]
  };
};

export interface ContourTargetResolver {
  resolve(input: ContourInvocationGateInput): ContourTargetResolutionShape;
}

export interface ContourInvocationRequestNormalizer {
  normalize(input: {
    gate_input: ContourInvocationGateInput;
    resolution: ContourTargetResolutionShape;
    eligibility: ContourInvocationEligibilityShape;
    now?: IsoDateTimeString;
  }): NormalizedContourInvocationRequestShape | undefined;
}

export interface ContourInvocationGate {
  evaluate(input: ContourInvocationGateInput): ContourInvocationGateResultShape;
}

export interface ContourInvocationEligibilityReporter {
  summarize(input: { gate_results: ContourInvocationGateResultShape[] }): ContourInvocationGateSummaryShape;
}

export const createContourTargetResolver = (): ContourTargetResolver => {
  return {
    resolve(input: ContourInvocationGateInput): ContourTargetResolutionShape {
      return buildContourTargetResolution(input);
    }
  };
};

export const createContourInvocationRequestNormalizer = (): ContourInvocationRequestNormalizer => {
  return {
    normalize(input): NormalizedContourInvocationRequestShape | undefined {
      const now = input.now ?? ((new Date().toISOString() as unknown) as IsoDateTimeString);
      return buildInvocationRequest({
        gateInput: input.gate_input,
        resolution: input.resolution,
        eligibility: input.eligibility,
        now
      });
    }
  };
};

export const createContourInvocationGate = (): ContourInvocationGate => {
  const resolver = createContourTargetResolver();
  const requestNormalizer = createContourInvocationRequestNormalizer();

  return {
    evaluate(input: ContourInvocationGateInput): ContourInvocationGateResultShape {
      const producedAt = input.now ?? ((new Date().toISOString() as unknown) as IsoDateTimeString);
      const resolution = resolver.resolve(input);
      const boundary = buildBoundaryReference(input);
      const linkage = buildLinkage({ gateInput: input, resolution, ...(boundary ? { boundary } : {}) });
      const eligibility = buildEligibility({ gateInput: input, resolution, ...(boundary ? { boundary } : {}) });
      const invocationRequest = requestNormalizer.normalize({
        gate_input: input,
        resolution,
        eligibility,
        now: producedAt
      });
      const resultExpectation = buildResultExpectation({ gateInput: input, resolution, eligibility });

      const blockedResult =
        eligibility.status === "blocked"
          ? {
              request_id: input.dispatch_result.intake.request.request_id,
              operation_id: input.dispatch_result.intake.request.operation_id,
              status: "blocked" as const,
              blocked_reason_codes: eligibility.blocked_reason_codes,
              warnings: eligibility.warnings
            }
          : undefined;

      const unsupportedResult =
        eligibility.status === "unsupported_contour"
          ? {
              request_id: input.dispatch_result.intake.request.request_id,
              operation_id: input.dispatch_result.intake.request.operation_id,
              status: "unsupported_contour" as const,
              blocked_reason_codes: eligibility.blocked_reason_codes,
              warnings: eligibility.warnings
            }
          : undefined;

      const missingBoundaryResult =
        eligibility.status === "missing_boundary"
          ? {
              request_id: input.dispatch_result.intake.request.request_id,
              operation_id: input.dispatch_result.intake.request.operation_id,
              status: "missing_boundary" as const,
              blocked_reason_codes: eligibility.blocked_reason_codes,
              warnings: eligibility.warnings
            }
          : undefined;

      return {
        gate_result_id: `${input.dispatch_result.dispatch_result_id}:contour-gate`,
        request_id: input.dispatch_result.intake.request.request_id,
        operation_id: input.dispatch_result.intake.request.operation_id,
        status: eligibility.status,
        dispatch_linkage: linkage,
        ...(invocationRequest ? { invocation_request: invocationRequest } : {}),
        eligibility,
        result_expectation: resultExpectation,
        ...(blockedResult ? { blocked_result: blockedResult } : {}),
        ...(unsupportedResult ? { unsupported_result: unsupportedResult } : {}),
        ...(missingBoundaryResult ? { missing_boundary_result: missingBoundaryResult } : {}),
        dispatch_warnings: input.dispatch_result.warnings,
        produced_at: producedAt
      };
    }
  };
};

export const createContourInvocationEligibilityReporter = (): ContourInvocationEligibilityReporter => {
  return {
    summarize(input: { gate_results: ContourInvocationGateResultShape[] }): ContourInvocationGateSummaryShape {
      return {
        total: input.gate_results.length,
        eligible: input.gate_results.filter((item) => item.status === "eligible").length,
        blocked: input.gate_results.filter((item) => item.status === "blocked").length,
        unsupported_contour: input.gate_results.filter((item) => item.status === "unsupported_contour").length,
        missing_boundary: input.gate_results.filter((item) => item.status === "missing_boundary").length,
        ambiguous_target: input.gate_results.filter((item) => item.status === "ambiguous_target").length,
        warnings: input.gate_results.flatMap((item) => item.eligibility.warnings)
      };
    }
  };
};
