import { type IsoDateTimeString } from "@orchestrator/core-foundation";
import {
  createLocalJsonFixtureRunnerCliBoundaryBuilder
} from "@orchestrator/integration-contracts";
import {
  createDeterministicLocalJsonFixtureRunnerProof
} from "./local-json-fixture-runner-proof.js";
import {
  createDeterministicLocalJsonRequestResponseRunnerShape
} from "./local-json-request-response-runner-shape.js";
import type {
  MinimalLocalJsonFixtureRunnerCliBoundaryBuilder,
  MinimalLocalJsonFixtureRunnerCliBoundaryInputShape,
  MinimalLocalJsonFixtureRunnerCliBoundaryResultShape
} from "./minimal-local-json-fixture-runner-cli-boundary-types.js";

const DEFAULT_MINIMAL_LOCAL_JSON_FIXTURE_RUNNER_CLI_BOUNDARY_TIME =
  "2026-04-27T00:00:00.000Z" as IsoDateTimeString;

export const createMinimalLocalJsonFixtureRunnerCliBoundaryBuilder =
  (): MinimalLocalJsonFixtureRunnerCliBoundaryBuilder => ({
    create(
      input?: MinimalLocalJsonFixtureRunnerCliBoundaryInputShape
    ): MinimalLocalJsonFixtureRunnerCliBoundaryResultShape {
      const runnerShape = input?.runner_shape ?? createDeterministicLocalJsonRequestResponseRunnerShape();
      const fixtureRunnerProof =
        input?.fixture_runner_proof ??
        createDeterministicLocalJsonFixtureRunnerProof({ runner_shape: runnerShape });

      if (
        fixtureRunnerProof.runner_request_id !== runnerShape.runner_request.runner_request_id ||
        fixtureRunnerProof.runner_response_id !== runnerShape.runner_response.runner_response_id
      ) {
        throw new Error(
          "Minimal local JSON fixture runner CLI boundary requires the fixture runner proof to match the runner shape."
        );
      }

      const builder = createLocalJsonFixtureRunnerCliBoundaryBuilder();
      const cli_boundary = builder.create({
        cli_boundary_id: `${fixtureRunnerProof.proof_id}:minimal-cli-boundary`,
        input_fixture: {
          path_ref:
            input?.input_fixture_path_ref ??
            "local-fixture://agent-context-request.input.json",
          media_type: "application/json",
          fixture_role: "agent_context_request_input_fixture",
          local_only: true
        },
        output_fixture: {
          path_ref:
            input?.output_fixture_path_ref ??
            "local-fixture://verified-protocol-surface-adapter.output.json",
          media_type: "application/json",
          fixture_role: "verified_protocol_surface_adapter_output_fixture",
          local_only: true
        },
        refs: {
          runner_request_id: fixtureRunnerProof.runner_request_id,
          runner_response_id: fixtureRunnerProof.runner_response_id,
          bounded_context_response_id: fixtureRunnerProof.ref_assertions.bounded_context_response_id,
          bounded_context_package_id: fixtureRunnerProof.ref_assertions.bounded_context_package_id,
          protocol_adapter_shape_id: fixtureRunnerProof.ref_assertions.protocol_adapter_shape_id,
          local_json_fixture_runner_proof_id: fixtureRunnerProof.proof_id,
          provenance_envelope_ref: fixtureRunnerProof.ref_assertions.provenance_envelope_ref,
          permission_envelope_ref: fixtureRunnerProof.ref_assertions.permission_envelope_ref,
          audit_envelope_ref: fixtureRunnerProof.ref_assertions.audit_envelope_ref
        },
        runner_response: runnerShape.runner_response,
        runner_summary: runnerShape.runner_summary,
        created_at: input?.now ?? DEFAULT_MINIMAL_LOCAL_JSON_FIXTURE_RUNNER_CLI_BOUNDARY_TIME
      });

      return {
        cli_boundary,
        cli_boundary_summary: builder.summarize(cli_boundary),
        fixture_runner_proof: fixtureRunnerProof
      };
    }
  });

export const createDeterministicMinimalLocalJsonFixtureRunnerCliBoundary =
  (input?: MinimalLocalJsonFixtureRunnerCliBoundaryInputShape): MinimalLocalJsonFixtureRunnerCliBoundaryResultShape =>
    createMinimalLocalJsonFixtureRunnerCliBoundaryBuilder().create(input);
