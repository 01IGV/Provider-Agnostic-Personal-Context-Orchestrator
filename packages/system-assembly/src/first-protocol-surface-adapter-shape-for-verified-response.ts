import { type IsoDateTimeString } from "@orchestrator/core-foundation";
import { createVerifiedResponseProtocolSurfaceAdapterBuilder } from "@orchestrator/integration-contracts";
import {
  createDeterministicLocalContextSourceAdapterContracts
} from "./local-deterministic-context-source-adapter-contracts.js";
import type {
  FirstProtocolSurfaceAdapterShapeForVerifiedResponseBuilder,
  FirstProtocolSurfaceAdapterShapeForVerifiedResponseInputShape,
  FirstProtocolSurfaceAdapterShapeForVerifiedResponseResultShape
} from "./first-protocol-surface-adapter-shape-for-verified-response-types.js";

const DEFAULT_PROTOCOL_SURFACE_ADAPTER_TIME = "2026-04-27T00:00:00.000Z" as IsoDateTimeString;

export const createFirstProtocolSurfaceAdapterShapeForVerifiedResponseBuilder =
  (): FirstProtocolSurfaceAdapterShapeForVerifiedResponseBuilder => ({
    create(
      input?: FirstProtocolSurfaceAdapterShapeForVerifiedResponseInputShape
    ): FirstProtocolSurfaceAdapterShapeForVerifiedResponseResultShape {
      const localContextResult = input?.local_context_result ?? createDeterministicLocalContextSourceAdapterContracts();
      const packageEnvelope = localContextResult.response.response_payload.bounded_context_package as
        | { bounded_context_package_id?: string }
        | undefined;
      const boundedContextPackageId = packageEnvelope?.bounded_context_package_id;

      if (!boundedContextPackageId) {
        throw new Error("Verified response protocol-surface adapter requires a bounded context package id.");
      }

      const builder = createVerifiedResponseProtocolSurfaceAdapterBuilder();
      const adapter_shape = builder.create({
        adapter_shape_id: `${localContextResult.response.bounded_context_response_id}:protocol-surface-adapter-shape`,
        response: localContextResult.response,
        bounded_context_package_id: boundedContextPackageId,
        verification_result: "agent_consumable_response_contract_verified",
        created_at: input?.now ?? DEFAULT_PROTOCOL_SURFACE_ADAPTER_TIME
      });

      return {
        adapter_shape,
        summary: builder.summarize(adapter_shape)
      };
    }
  });

export const createDeterministicFirstProtocolSurfaceAdapterShapeForVerifiedResponse =
  (input?: FirstProtocolSurfaceAdapterShapeForVerifiedResponseInputShape): FirstProtocolSurfaceAdapterShapeForVerifiedResponseResultShape =>
    createFirstProtocolSurfaceAdapterShapeForVerifiedResponseBuilder().create(input);
