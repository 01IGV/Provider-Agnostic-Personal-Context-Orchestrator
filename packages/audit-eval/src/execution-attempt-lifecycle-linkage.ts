import type { AuditId, IsoDateTimeString, OperationalContour } from "@orchestrator/core-foundation";

export interface ExecutionAttemptLifecycleAuditWarning {
  code: string;
  message: string;
}

export interface ExecutionAttemptLifecycleTraceShape {
  trace_id: string;
  request_id: string;
  operation_id: string;
  precheck_id: string;
  dispatch_intent_id: string;
  runtime_handoff_id: string;
  attempt_id: string;
  attempt_family: string;
  contour_target: OperationalContour | "unknown";
  lifecycle_state: string;
  result_family: string;
  transition_ids: string[];
  warnings: ExecutionAttemptLifecycleAuditWarning[];
  traced_at: IsoDateTimeString;
}

export interface ExecutionAttemptLifecycleOutcomeAuditLinkageShape {
  linkage_id: string;
  request_id: string;
  operation_id: string;
  runtime_handoff_id: string;
  attempt_id: string;
  lifecycle_state: string;
  result_family: string;
  blocked_or_deferred_or_terminal: boolean;
  linked_audit_id?: AuditId;
  hook_status: "pending_execution_attempt_lifecycle_audit" | "execution_attempt_lifecycle_audit_linked";
  warnings: ExecutionAttemptLifecycleAuditWarning[];
  linked_at: IsoDateTimeString;
}

export interface ExecutionAttemptTransitionTraceShape {
  transition_trace_id: string;
  attempt_id: string;
  from_state: string;
  to_state: string;
  transition_expectation: string;
  valid_transition: boolean;
  warnings: ExecutionAttemptLifecycleAuditWarning[];
  traced_at: IsoDateTimeString;
}

export interface ExecutionAttemptLifecycleTraceBuilder {
  build(input: {
    trace_id: string;
    request_id: string;
    operation_id: string;
    precheck_id: string;
    dispatch_intent_id: string;
    runtime_handoff_id: string;
    attempt_id: string;
    attempt_family: string;
    contour_target: OperationalContour | "unknown";
    lifecycle_state: string;
    result_family: string;
    transition_ids?: string[];
    warnings?: ExecutionAttemptLifecycleAuditWarning[];
    now?: IsoDateTimeString;
  }): ExecutionAttemptLifecycleTraceShape;
}

export interface ExecutionAttemptLifecycleOutcomeAuditLinkageBuilder {
  build(input: {
    linkage_id: string;
    request_id: string;
    operation_id: string;
    runtime_handoff_id: string;
    attempt_id: string;
    lifecycle_state: string;
    result_family: string;
    linked_audit_id?: AuditId;
    warnings?: ExecutionAttemptLifecycleAuditWarning[];
    now?: IsoDateTimeString;
  }): ExecutionAttemptLifecycleOutcomeAuditLinkageShape;
}

export interface ExecutionAttemptTransitionTraceBuilder {
  build(input: {
    transition_trace_id: string;
    attempt_id: string;
    from_state: string;
    to_state: string;
    transition_expectation: string;
    valid_transition: boolean;
    warnings?: ExecutionAttemptLifecycleAuditWarning[];
    now?: IsoDateTimeString;
  }): ExecutionAttemptTransitionTraceShape;
}

export const createExecutionAttemptLifecycleTraceBuilder = (): ExecutionAttemptLifecycleTraceBuilder => {
  return {
    build(input): ExecutionAttemptLifecycleTraceShape {
      const tracedAt = input.now ?? ((new Date().toISOString() as unknown) as IsoDateTimeString);
      return {
        trace_id: input.trace_id,
        request_id: input.request_id,
        operation_id: input.operation_id,
        precheck_id: input.precheck_id,
        dispatch_intent_id: input.dispatch_intent_id,
        runtime_handoff_id: input.runtime_handoff_id,
        attempt_id: input.attempt_id,
        attempt_family: input.attempt_family,
        contour_target: input.contour_target,
        lifecycle_state: input.lifecycle_state,
        result_family: input.result_family,
        transition_ids: input.transition_ids ?? [],
        warnings: input.warnings ?? [],
        traced_at: tracedAt
      };
    }
  };
};

export const createExecutionAttemptLifecycleOutcomeAuditLinkageBuilder =
  (): ExecutionAttemptLifecycleOutcomeAuditLinkageBuilder => {
    return {
      build(input): ExecutionAttemptLifecycleOutcomeAuditLinkageShape {
        const linkedAt = input.now ?? ((new Date().toISOString() as unknown) as IsoDateTimeString);
        const blockedOrDeferredOrTerminal = [
          "blocked",
          "deferred",
          "aborted",
          "expired",
          "cancelled",
          "not_dispatchable"
        ].includes(input.lifecycle_state);
        return {
          linkage_id: input.linkage_id,
          request_id: input.request_id,
          operation_id: input.operation_id,
          runtime_handoff_id: input.runtime_handoff_id,
          attempt_id: input.attempt_id,
          lifecycle_state: input.lifecycle_state,
          result_family: input.result_family,
          blocked_or_deferred_or_terminal: blockedOrDeferredOrTerminal,
          ...(input.linked_audit_id ? { linked_audit_id: input.linked_audit_id } : {}),
          hook_status: input.linked_audit_id
            ? "execution_attempt_lifecycle_audit_linked"
            : "pending_execution_attempt_lifecycle_audit",
          warnings: input.warnings ?? [],
          linked_at: linkedAt
        };
      }
    };
  };

export const createExecutionAttemptTransitionTraceBuilder = (): ExecutionAttemptTransitionTraceBuilder => {
  return {
    build(input): ExecutionAttemptTransitionTraceShape {
      const tracedAt = input.now ?? ((new Date().toISOString() as unknown) as IsoDateTimeString);
      return {
        transition_trace_id: input.transition_trace_id,
        attempt_id: input.attempt_id,
        from_state: input.from_state,
        to_state: input.to_state,
        transition_expectation: input.transition_expectation,
        valid_transition: input.valid_transition,
        warnings: input.warnings ?? [],
        traced_at: tracedAt
      };
    }
  };
};
