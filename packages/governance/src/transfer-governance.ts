import type { ScopeId } from "@orchestrator/core-foundation";
import type { GovernanceResultBase } from "./types.js";

export const TRANSFER_OUTCOMES = ["transfer_allowed", "transfer_restricted", "transfer_denied", "defer"] as const;
export type TransferOutcome = (typeof TRANSFER_OUTCOMES)[number];

export interface TransferInput {
  source_scope_id: ScopeId;
  target_scope_id: ScopeId;
  allows_cross_scope_transfer: boolean;
}

export type TransferResult = GovernanceResultBase<"transfer_governance", TransferOutcome>;

export type TransferRule = (input: TransferInput) => TransferResult | undefined;

export interface TransferEvaluator {
  evaluate(input: TransferInput): TransferResult;
}

export const createTransferEvaluator = (rules: TransferRule[]): TransferEvaluator => {
  return {
    evaluate(input: TransferInput): TransferResult {
      for (const rule of rules) {
        const result = rule(input);
        if (result) {
          return result;
        }
      }

      const sameScope = input.source_scope_id === input.target_scope_id;
      const allowed = sameScope || input.allows_cross_scope_transfer;
      return {
        domain: "transfer_governance",
        outcome: allowed ? "transfer_allowed" : "transfer_denied",
        applied_policies: [],
        warnings: [],
        risks: [],
        ...(allowed ? {} : { rejection_reason: "reject_transfer" as const })
      };
    }
  };
};
