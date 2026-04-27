import { type IsoDateTimeString } from "@orchestrator/core-foundation";
import {
  createDeterministicLocalJsonRequestResponseRunnerShape
} from "./local-json-request-response-runner-shape.js";
import type {
  LocalJsonFixtureRunnerProofBuilder,
  LocalJsonFixtureRunnerProofDenialAssertionsShape,
  LocalJsonFixtureRunnerProofFailureCode,
  LocalJsonFixtureRunnerProofFailureShape,
  LocalJsonFixtureRunnerProofInputShape,
  LocalJsonFixtureRunnerProofRefAssertionsShape,
  LocalJsonFixtureRunnerProofRoundTripAssertionsShape,
  LocalJsonFixtureRunnerProofSummaryShape,
  LocalJsonFixtureRunnerProofVerificationSummaryShape
} from "./local-json-fixture-runner-proof-types.js";

const DEFAULT_LOCAL_JSON_FIXTURE_RUNNER_PROOF_TIME =
  "2026-04-27T00:00:00.000Z" as IsoDateTimeString;

const createFailure = (input: {
  code: LocalJsonFixtureRunnerProofFailureCode;
  path: string;
  expected: true | false | string;
  actual: unknown;
  message: string;
}): LocalJsonFixtureRunnerProofFailureShape => ({
  code: input.code,
  path: input.path,
  expected: input.expected,
  actual: input.actual,
  message: input.message
});

const createRoundTripAssertions = (
  input: LocalJsonFixtureRunnerProofInputShape
): LocalJsonFixtureRunnerProofRoundTripAssertionsShape => {
  const { runner_request, runner_response, runner_summary } = input.runner_shape;
  const roundTrip = JSON.parse(JSON.stringify({
    request: runner_request,
    response: runner_response,
    summary: runner_summary
  })) as {
    request?: { runner_request_id?: string };
    response?: { runner_response_id?: string };
    summary?: { protocol_adapter_shape_id?: string };
  };

  return {
    json_serializable: true,
    runner_request_id_preserved:
      roundTrip.request?.runner_request_id === runner_request.runner_request_id,
    runner_response_id_preserved:
      roundTrip.response?.runner_response_id === runner_response.runner_response_id,
    protocol_adapter_shape_id_preserved:
      roundTrip.summary?.protocol_adapter_shape_id === runner_summary.protocol_adapter_shape_id
  };
};

const createRefAssertions = (
  input: LocalJsonFixtureRunnerProofInputShape
): LocalJsonFixtureRunnerProofRefAssertionsShape => {
  const { runner_request, runner_response, adapter_shape } = input.runner_shape;

  return {
    agent_context_request_id: runner_request.request_json.agent_context_request_id,
    bounded_context_response_id: runner_response.refs.bounded_context_response_id,
    bounded_context_package_id: runner_response.refs.bounded_context_package_id,
    protocol_adapter_shape_id: runner_response.refs.protocol_adapter_shape_id,
    verification_result: runner_response.refs.verification_result,
    provenance_envelope_ref: adapter_shape.refs.provenance_envelope_ref,
    permission_envelope_ref: adapter_shape.refs.permission_envelope_ref,
    audit_envelope_ref: adapter_shape.refs.audit_envelope_ref
  };
};

const createDenialAssertions = (
  input: LocalJsonFixtureRunnerProofInputShape
): LocalJsonFixtureRunnerProofDenialAssertionsShape => {
  const posture = input.runner_shape.runner_request.execution_posture;

  return {
    local_json_only: posture.local_json_only,
    deterministic: posture.deterministic,
    fixture_driven: posture.fixture_driven,
    runner_shape_only: posture.runner_shape_only,
    mcp_server_implemented: posture.mcp_server_implemented,
    mcp_tool_registered: posture.mcp_tool_registered,
    mcp_resource_registered: posture.mcp_resource_registered,
    api_route_registered: posture.api_route_registered,
    api_controller_registered: posture.api_controller_registered,
    runtime_handler_bound: posture.runtime_handler_bound,
    network_access_allowed_now: posture.network_access_allowed_now,
    provider_sdk_call_allowed_now: posture.provider_sdk_call_allowed_now,
    transport_execution_allowed_now: posture.transport_execution_allowed_now,
    concrete_persistence_read_allowed_now: posture.concrete_persistence_read_allowed_now,
    concrete_persistence_write_allowed_now: posture.concrete_persistence_write_allowed_now,
    real_model_call_allowed_now: posture.real_model_call_allowed_now,
    real_storage_write_allowed_now: posture.real_storage_write_allowed_now,
    runtime_permission_granted: posture.runtime_permission_granted,
    actual_contour_execution_allowed_now: posture.actual_contour_execution_allowed_now,
    file_io_performed: false,
    cli_execution_performed: false,
    process_execution_performed: false
  };
};

const findFailuresFromSummary = (
  summary: LocalJsonFixtureRunnerProofSummaryShape
): LocalJsonFixtureRunnerProofFailureShape[] => {
  const failures: LocalJsonFixtureRunnerProofFailureShape[] = [];

  const addTrueCheck = (input: {
    code: LocalJsonFixtureRunnerProofFailureCode;
    path: string;
    actual: unknown;
    message: string;
  }): void => {
    if (input.actual !== true) {
      failures.push(createFailure({ ...input, expected: true }));
    }
  };

  const addFalseCheck = (input: {
    code: LocalJsonFixtureRunnerProofFailureCode;
    path: string;
    actual: unknown;
    message: string;
  }): void => {
    if (input.actual !== false) {
      failures.push(createFailure({ ...input, expected: false }));
    }
  };

  addTrueCheck({ code: "json_round_trip_failed", path: "round_trip_assertions.json_serializable", actual: summary.round_trip_assertions.json_serializable, message: "Runner proof must remain JSON serializable." });
  addTrueCheck({ code: "runner_request_id_mismatch", path: "round_trip_assertions.runner_request_id_preserved", actual: summary.round_trip_assertions.runner_request_id_preserved, message: "Runner request id must survive JSON round trip." });
  addTrueCheck({ code: "runner_response_id_mismatch", path: "round_trip_assertions.runner_response_id_preserved", actual: summary.round_trip_assertions.runner_response_id_preserved, message: "Runner response id must survive JSON round trip." });
  addTrueCheck({ code: "protocol_adapter_shape_id_mismatch", path: "round_trip_assertions.protocol_adapter_shape_id_preserved", actual: summary.round_trip_assertions.protocol_adapter_shape_id_preserved, message: "Protocol adapter id must survive JSON round trip." });

  if (!summary.ref_assertions.agent_context_request_id) {
    failures.push(createFailure({ code: "agent_context_request_id_mismatch", path: "ref_assertions.agent_context_request_id", expected: "non-empty string", actual: summary.ref_assertions.agent_context_request_id, message: "Agent context request id must be present." }));
  }
  if (summary.ref_assertions.verification_result !== "agent_consumable_response_contract_verified") {
    failures.push(createFailure({ code: "verification_result_mismatch", path: "ref_assertions.verification_result", expected: "agent_consumable_response_contract_verified", actual: summary.ref_assertions.verification_result, message: "Runner proof must carry verified response result." }));
  }
  if (!summary.ref_assertions.bounded_context_response_id) {
    failures.push(createFailure({ code: "bounded_context_response_id_mismatch", path: "ref_assertions.bounded_context_response_id", expected: "non-empty string", actual: summary.ref_assertions.bounded_context_response_id, message: "Bounded context response id must be present." }));
  }
  if (!summary.ref_assertions.bounded_context_package_id) {
    failures.push(createFailure({ code: "bounded_context_package_id_mismatch", path: "ref_assertions.bounded_context_package_id", expected: "non-empty string", actual: summary.ref_assertions.bounded_context_package_id, message: "Bounded context package id must be present." }));
  }
  if (!summary.ref_assertions.protocol_adapter_shape_id) {
    failures.push(createFailure({ code: "protocol_adapter_shape_id_mismatch", path: "ref_assertions.protocol_adapter_shape_id", expected: "non-empty string", actual: summary.ref_assertions.protocol_adapter_shape_id, message: "Protocol adapter shape id must be present." }));
  }
  if (!summary.ref_assertions.provenance_envelope_ref) {
    failures.push(createFailure({ code: "provenance_envelope_missing", path: "ref_assertions.provenance_envelope_ref", expected: "non-empty string", actual: summary.ref_assertions.provenance_envelope_ref, message: "Provenance envelope ref must be present." }));
  }
  if (!summary.ref_assertions.permission_envelope_ref) {
    failures.push(createFailure({ code: "permission_envelope_missing", path: "ref_assertions.permission_envelope_ref", expected: "non-empty string", actual: summary.ref_assertions.permission_envelope_ref, message: "Permission envelope ref must be present." }));
  }
  if (!summary.ref_assertions.audit_envelope_ref) {
    failures.push(createFailure({ code: "audit_envelope_missing", path: "ref_assertions.audit_envelope_ref", expected: "non-empty string", actual: summary.ref_assertions.audit_envelope_ref, message: "Audit envelope ref must be present." }));
  }

  addTrueCheck({ code: "runner_not_local_json_only", path: "denial_assertions.local_json_only", actual: summary.denial_assertions.local_json_only, message: "Runner must remain local JSON only." });
  addTrueCheck({ code: "runner_not_deterministic", path: "denial_assertions.deterministic", actual: summary.denial_assertions.deterministic, message: "Runner must remain deterministic." });
  addTrueCheck({ code: "runner_not_fixture_driven", path: "denial_assertions.fixture_driven", actual: summary.denial_assertions.fixture_driven, message: "Runner must remain fixture-driven." });
  addTrueCheck({ code: "runner_not_shape_only", path: "denial_assertions.runner_shape_only", actual: summary.denial_assertions.runner_shape_only, message: "Runner must remain shape-only." });

  addFalseCheck({ code: "mcp_server_implemented_not_false", path: "denial_assertions.mcp_server_implemented", actual: summary.denial_assertions.mcp_server_implemented, message: "MCP server implementation must remain false." });
  addFalseCheck({ code: "mcp_tool_registered_not_false", path: "denial_assertions.mcp_tool_registered", actual: summary.denial_assertions.mcp_tool_registered, message: "MCP tool registration must remain false." });
  addFalseCheck({ code: "mcp_resource_registered_not_false", path: "denial_assertions.mcp_resource_registered", actual: summary.denial_assertions.mcp_resource_registered, message: "MCP resource registration must remain false." });
  addFalseCheck({ code: "api_route_registered_not_false", path: "denial_assertions.api_route_registered", actual: summary.denial_assertions.api_route_registered, message: "API route registration must remain false." });
  addFalseCheck({ code: "api_controller_registered_not_false", path: "denial_assertions.api_controller_registered", actual: summary.denial_assertions.api_controller_registered, message: "API controller registration must remain false." });
  addFalseCheck({ code: "runtime_handler_bound_not_false", path: "denial_assertions.runtime_handler_bound", actual: summary.denial_assertions.runtime_handler_bound, message: "Runtime handler binding must remain false." });
  addFalseCheck({ code: "network_access_allowed", path: "denial_assertions.network_access_allowed_now", actual: summary.denial_assertions.network_access_allowed_now, message: "Network access must remain denied." });
  addFalseCheck({ code: "provider_sdk_call_allowed", path: "denial_assertions.provider_sdk_call_allowed_now", actual: summary.denial_assertions.provider_sdk_call_allowed_now, message: "Provider SDK calls must remain denied." });
  addFalseCheck({ code: "transport_execution_allowed", path: "denial_assertions.transport_execution_allowed_now", actual: summary.denial_assertions.transport_execution_allowed_now, message: "Transport execution must remain denied." });
  addFalseCheck({ code: "concrete_persistence_read_allowed", path: "denial_assertions.concrete_persistence_read_allowed_now", actual: summary.denial_assertions.concrete_persistence_read_allowed_now, message: "Concrete persistence reads must remain denied." });
  addFalseCheck({ code: "concrete_persistence_write_allowed", path: "denial_assertions.concrete_persistence_write_allowed_now", actual: summary.denial_assertions.concrete_persistence_write_allowed_now, message: "Concrete persistence writes must remain denied." });
  addFalseCheck({ code: "real_model_call_allowed", path: "denial_assertions.real_model_call_allowed_now", actual: summary.denial_assertions.real_model_call_allowed_now, message: "Real model calls must remain denied." });
  addFalseCheck({ code: "real_storage_write_allowed", path: "denial_assertions.real_storage_write_allowed_now", actual: summary.denial_assertions.real_storage_write_allowed_now, message: "Real storage writes must remain denied." });
  addFalseCheck({ code: "runtime_permission_granted_not_false", path: "denial_assertions.runtime_permission_granted", actual: summary.denial_assertions.runtime_permission_granted, message: "Runtime permission must remain denied." });
  addFalseCheck({ code: "actual_contour_execution_allowed", path: "denial_assertions.actual_contour_execution_allowed_now", actual: summary.denial_assertions.actual_contour_execution_allowed_now, message: "Actual contour execution must remain denied." });
  addFalseCheck({ code: "file_io_performed_not_false", path: "denial_assertions.file_io_performed", actual: summary.denial_assertions.file_io_performed, message: "File IO must not be performed." });
  addFalseCheck({ code: "cli_execution_performed_not_false", path: "denial_assertions.cli_execution_performed", actual: summary.denial_assertions.cli_execution_performed, message: "CLI execution must not be performed." });
  addFalseCheck({ code: "process_execution_performed_not_false", path: "denial_assertions.process_execution_performed", actual: summary.denial_assertions.process_execution_performed, message: "Process execution must not be performed." });

  return failures;
};

export const createLocalJsonFixtureRunnerProofBuilder =
  (): LocalJsonFixtureRunnerProofBuilder => ({
    create(input: LocalJsonFixtureRunnerProofInputShape): LocalJsonFixtureRunnerProofSummaryShape {
      const { runner_request, runner_response } = input.runner_shape;
      const summaryWithoutFailures = {
        contract_version: "local-json-fixture-runner-proof/v1" as const,
        proof_id: `${runner_response.runner_response_id}:local-json-fixture-runner-proof`,
        proof_result: "local_json_fixture_runner_default_deny_proven" as const,
        proof_boundary: "machine_checkable_local_json_fixture_runner_proof_only" as const,
        runner_request_id: runner_request.runner_request_id,
        runner_response_id: runner_response.runner_response_id,
        source_runner_shape_id: runner_response.refs.protocol_adapter_shape_id,
        round_trip_assertions: createRoundTripAssertions(input),
        ref_assertions: createRefAssertions(input),
        denial_assertions: createDenialAssertions(input),
        failure_count: 0,
        failures: [],
        generated_at: input.now ?? DEFAULT_LOCAL_JSON_FIXTURE_RUNNER_PROOF_TIME
      };
      const failures = findFailuresFromSummary(summaryWithoutFailures);

      return {
        ...summaryWithoutFailures,
        failure_count: failures.length,
        failures
      };
    },

    findFailures(input: LocalJsonFixtureRunnerProofSummaryShape): LocalJsonFixtureRunnerProofFailureShape[] {
      return findFailuresFromSummary(input);
    },

    assertDefaultDeny(input: LocalJsonFixtureRunnerProofSummaryShape): true {
      const failures = findFailuresFromSummary(input);

      if (failures.length > 0) {
        throw new Error(`Local JSON fixture runner proof failed: ${failures.map((failure) => failure.code).join(", ")}`);
      }

      return true;
    }
  });

export const createDeterministicLocalJsonFixtureRunnerProof =
  (input?: Partial<LocalJsonFixtureRunnerProofInputShape>): LocalJsonFixtureRunnerProofSummaryShape =>
    createLocalJsonFixtureRunnerProofBuilder().create({
      runner_shape: input?.runner_shape ?? createDeterministicLocalJsonRequestResponseRunnerShape(),
      ...(input?.now ? { now: input.now } : {})
    });

export const createDeterministicLocalJsonFixtureRunnerProofVerificationSummary =
  (): LocalJsonFixtureRunnerProofVerificationSummaryShape => {
    const proof = createDeterministicLocalJsonFixtureRunnerProof();
    const failures = proof.failures.map((failure) => failure.code);

    return {
      verification_result:
        failures.length === 0
          ? "local_json_fixture_runner_proof_verified"
          : "local_json_fixture_runner_proof_failed",
      contract_version: proof.contract_version,
      proof_id: proof.proof_id,
      runner_request_id: proof.runner_request_id,
      runner_response_id: proof.runner_response_id,
      bounded_context_response_id: proof.ref_assertions.bounded_context_response_id,
      bounded_context_package_id: proof.ref_assertions.bounded_context_package_id,
      protocol_adapter_shape_id: proof.ref_assertions.protocol_adapter_shape_id,
      local_json_only: proof.denial_assertions.local_json_only,
      deterministic: proof.denial_assertions.deterministic,
      fixture_driven: proof.denial_assertions.fixture_driven,
      runtime_permission_granted: proof.denial_assertions.runtime_permission_granted,
      actual_contour_execution_allowed_now: proof.denial_assertions.actual_contour_execution_allowed_now,
      file_io_performed: proof.denial_assertions.file_io_performed,
      cli_execution_performed: proof.denial_assertions.cli_execution_performed,
      process_execution_performed: proof.denial_assertions.process_execution_performed,
      failure_count: failures.length,
      failures
    };
  };
