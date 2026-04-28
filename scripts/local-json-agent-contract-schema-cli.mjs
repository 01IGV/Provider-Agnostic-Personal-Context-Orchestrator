#!/usr/bin/env node

import { pathToFileURL } from "node:url";
import {
  createLocalJsonAgentRequestResponseContractSchema
} from "../packages/integration-contracts/dist/index.js";

const stableJson = (value) => `${JSON.stringify(value, null, 2)}\n`;

export const readLocalJsonAgentContractSchema = () => ({
  verification_result: "local_json_agent_request_response_contract_schema_ready",
  schema_json: createLocalJsonAgentRequestResponseContractSchema(),
  runtime_permission_granted: false,
  actual_contour_execution_allowed_now: false,
  mcp_server_implemented: false,
  mcp_tool_registered: false,
  mcp_resource_registered: false,
  api_route_registered: false,
  api_controller_registered: false,
  runtime_handler_bound: false,
  provider_sdk_call_allowed_now: false,
  concrete_persistence_read_allowed_now: false,
  concrete_persistence_write_allowed_now: false,
  real_model_call_allowed_now: false,
  real_storage_write_allowed_now: false,
  failure_count: 0,
  failures: []
});

const isDirectRun = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectRun) {
  console.log(stableJson(readLocalJsonAgentContractSchema()));
}
