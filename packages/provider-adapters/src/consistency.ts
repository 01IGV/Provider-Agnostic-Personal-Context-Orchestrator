import type { OperationContractShape, ToolContractShape } from "@orchestrator/integration-contracts";

export const CONTRACT_CONSISTENCY_ISSUE_CODES = [
  "missing_operation_for_tool",
  "capability_mismatch",
  "operation_family_mismatch"
] as const;

export type ContractConsistencyIssueCode = (typeof CONTRACT_CONSISTENCY_ISSUE_CODES)[number];

export interface ContractConsistencyIssue {
  code: ContractConsistencyIssueCode;
  tool_name: string;
  operation_id: string;
  message: string;
}

export interface ContractConsistencyResult {
  valid: boolean;
  issues: ContractConsistencyIssue[];
}

export const validateToolOperationConsistency = (input: {
  operation_contracts: OperationContractShape[];
  canonical_tools: ToolContractShape[];
}): ContractConsistencyResult => {
  const operationById = new Map(input.operation_contracts.map((operation) => [operation.operation_id, operation]));
  const issues: ContractConsistencyIssue[] = [];

  for (const tool of input.canonical_tools) {
    const operation = operationById.get(tool.operation_id);

    if (!operation) {
      issues.push({
        code: "missing_operation_for_tool",
        tool_name: tool.tool_name,
        operation_id: tool.operation_id,
        message: `tool '${tool.tool_name}' references missing operation '${tool.operation_id}'`
      });
      continue;
    }

    if (operation.capability_class !== tool.capability_class) {
      issues.push({
        code: "capability_mismatch",
        tool_name: tool.tool_name,
        operation_id: tool.operation_id,
        message: `tool '${tool.tool_name}' capability '${tool.capability_class}' differs from operation capability '${operation.capability_class}'`
      });
    }

    if (operation.operation_family !== tool.operation_family) {
      issues.push({
        code: "operation_family_mismatch",
        tool_name: tool.tool_name,
        operation_id: tool.operation_id,
        message: `tool '${tool.tool_name}' family '${tool.operation_family}' differs from operation family '${operation.operation_family}'`
      });
    }
  }

  return {
    valid: issues.length === 0,
    issues
  };
};
