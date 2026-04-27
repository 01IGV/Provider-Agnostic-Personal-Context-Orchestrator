import { type IsoDateTimeString } from "@orchestrator/core-foundation";
import {
  createLocalJsonRequestResponseRunnerBuilder,
  createVerifiedResponseProtocolSurfaceAdapterBuilder
} from "@orchestrator/integration-contracts";
import {
  createDeterministicLocalContextSourceAdapterContracts
} from "./local-deterministic-context-source-adapter-contracts.js";
import type {
  LocalJsonRequestResponseRunnerShapeBuilder,
  LocalJsonRequestResponseRunnerShapeInput,
  LocalJsonRequestResponseRunnerShapeResult
} from "./local-json-request-response-runner-shape-types.js";

const DEFAULT_LOCAL_JSON_RUNNER_TIME = "2026-04-27T00:00:00.000Z" as IsoDateTimeString;

export const createLocalJsonRequestResponseRunnerShapeBuilder =
  (): LocalJsonRequestResponseRunnerShapeBuilder => ({
    create(input?: LocalJsonRequestResponseRunnerShapeInput): LocalJsonRequestResponseRunnerShapeResult {
      const localContextResult = input?.local_context_result ?? createDeterministicLocalContextSourceAdapterContracts();
      const now = input?.now ?? DEFAULT_LOCAL_JSON_RUNNER_TIME;
      const packageEnvelope = localContextResult.response.response_payload.bounded_context_package as
        | { bounded_context_package_id?: string }
        | undefined;
      const boundedContextPackageId = packageEnvelope?.bounded_context_package_id;

      if (!boundedContextPackageId) {
        throw new Error("Local JSON request/response runner shape requires a bounded context package id.");
      }

      const protocolAdapterBuilder = createVerifiedResponseProtocolSurfaceAdapterBuilder();
      const adapter_shape = protocolAdapterBuilder.create({
        adapter_shape_id: `${localContextResult.response.bounded_context_response_id}:protocol-surface-adapter-shape`,
        response: localContextResult.response,
        bounded_context_package_id: boundedContextPackageId,
        verification_result: "agent_consumable_response_contract_verified",
        created_at: now
      });
      const adapter_summary = protocolAdapterBuilder.summarize(adapter_shape);

      const runnerBuilder = createLocalJsonRequestResponseRunnerBuilder();
      const runner_request = runnerBuilder.createRequest({
        runner_request_id: `${localContextResult.request.agent_context_request_id}:local-json-runner-request`,
        request_json: localContextResult.request,
        created_at: now
      });
      const runner_response = runnerBuilder.createResponse({
        runner_request,
        response_json: adapter_shape,
        response_summary_json: adapter_summary,
        served_at: now
      });

      return {
        runner_request,
        runner_response,
        runner_summary: runnerBuilder.summarize(runner_response),
        adapter_shape,
        adapter_summary
      };
    }
  });

export const createDeterministicLocalJsonRequestResponseRunnerShape =
  (input?: LocalJsonRequestResponseRunnerShapeInput): LocalJsonRequestResponseRunnerShapeResult =>
    createLocalJsonRequestResponseRunnerShapeBuilder().create(input);
