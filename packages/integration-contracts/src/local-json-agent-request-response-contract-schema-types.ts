export interface LocalJsonAgentContractSchemaFieldShape {
  path: string;
  value_type: "string" | "string[]" | "number" | "boolean" | "object" | "object[]";
  required: boolean;
  allowed_values?: readonly string[];
  const_value?: string | number | boolean;
  max_length?: number;
  purpose: string;
}

export interface LocalJsonAgentContractSchemaPathPolicyShape {
  allowed_request_variation_paths: readonly string[];
  denied_request_variation_paths: readonly string[];
}

export interface LocalJsonAgentContractSchemaSectionShape {
  shape_ref: string;
  required_fields: readonly LocalJsonAgentContractSchemaFieldShape[];
}

export interface LocalJsonAgentContractSchemaLocalIoShape {
  command_ref: "tool:local-json:run";
  input_argument: "--request";
  output_argument: "--response";
  variation_arguments: readonly string[];
  reads_only_explicit_request_fixture: true;
  writes_only_explicit_response_fixture: true;
  arbitrary_source_loading_allowed: false;
  multi_request_runner_implemented: false;
}

export interface LocalJsonAgentRequestResponseContractSchemaShape {
  contract_id: "local-json-agent-request-response-contract-schema";
  contract_version: "local-json-agent-request-response-contract-schema/v1";
  agent_readable: true;
  intended_consumer: "ai_agent";
  protocol_surface: "local_json_cli_file_boundary";
  request_contract: LocalJsonAgentContractSchemaSectionShape;
  response_contract: LocalJsonAgentContractSchemaSectionShape;
  path_policy: LocalJsonAgentContractSchemaPathPolicyShape;
  local_io: LocalJsonAgentContractSchemaLocalIoShape;
  safe_agent_use_hints: readonly string[];
  denied_agent_action_hints: readonly string[];
  default_deny_execution_posture: {
    mcp_server_implemented: false;
    mcp_tool_registered: false;
    mcp_resource_registered: false;
    api_route_registered: false;
    api_controller_registered: false;
    runtime_handler_bound: false;
    network_access_allowed_now: false;
    provider_sdk_call_allowed_now: false;
    transport_execution_allowed_now: false;
    concrete_persistence_read_allowed_now: false;
    concrete_persistence_write_allowed_now: false;
    real_model_call_allowed_now: false;
    real_storage_write_allowed_now: false;
    runtime_permission_granted: false;
    actual_contour_execution_allowed_now: false;
  };
  notes: readonly string[];
}
