import { AGENT_CONTEXT_REQUEST_KINDS } from "./agent-context-request-boundary-vocabularies.js";
import type { LocalJsonAgentRequestResponseContractSchemaShape } from "./local-json-agent-request-response-contract-schema-types.js";

export const createLocalJsonAgentRequestResponseContractSchema =
  (): LocalJsonAgentRequestResponseContractSchemaShape => ({
    contract_id: "local-json-agent-request-response-contract-schema",
    contract_version: "local-json-agent-request-response-contract-schema/v1",
    agent_readable: true,
    intended_consumer: "ai_agent",
    protocol_surface: "local_json_cli_file_boundary",
    request_contract: {
      shape_ref: "AgentContextRequestBoundaryShape",
      required_fields: [
        {
          path: "operation_id",
          value_type: "string",
          required: true,
          const_value: "agent_context_request_boundary",
          purpose: "Identify the request as the agent context boundary contract."
        },
        {
          path: "operation_version",
          value_type: "string",
          required: true,
          const_value: "agent-context-request-boundary/v1",
          purpose: "Pin the request contract version."
        },
        {
          path: "intent.request_kind",
          value_type: "string",
          required: true,
          allowed_values: AGENT_CONTEXT_REQUEST_KINDS,
          purpose: "Declare the bounded context request mode."
        },
        {
          path: "intent.task_signal",
          value_type: "string",
          required: true,
          max_length: 240,
          purpose: "Give the agent task signal used for local deterministic context selection."
        },
        {
          path: "intent.read_mode_hint",
          value_type: "string",
          required: false,
          allowed_values: [
            "quick_answer",
            "continuation",
            "planning",
            "handoff_recovery",
            "workflow_execution",
            "deep_context",
            "state_reconstruction"
          ],
          purpose: "Constrain the read intent without opening runtime behavior."
        },
        {
          path: "intent.depth_hint",
          value_type: "string",
          required: false,
          allowed_values: ["shallow", "standard", "deep"],
          purpose: "Constrain bounded context depth."
        },
        {
          path: "intent.requested_scope_hints",
          value_type: "string[]",
          required: true,
          purpose: "Select deterministic local scope fixtures using scope:<id> hints."
        },
        {
          path: "authority.permission_grant_issued",
          value_type: "boolean",
          required: true,
          const_value: false,
          purpose: "Confirm the request does not issue a permission grant."
        },
        {
          path: "execution_posture.actual_contour_execution_allowed_now",
          value_type: "boolean",
          required: true,
          const_value: false,
          purpose: "Confirm the request cannot authorize contour execution."
        }
      ]
    },
    response_contract: {
      shape_ref: "LocalJsonRequestResponseRunnerResponseEnvelopeShape",
      required_fields: [
        {
          path: "response_observation_summary_json.agent_readable_contract",
          value_type: "string",
          required: true,
          const_value: "agent-readable-local-json-response-observation/v1",
          purpose: "Identify the agent-readable response summary contract."
        },
        {
          path: "response_observation_summary_json.agent_response_status",
          value_type: "string",
          required: true,
          const_value: "bounded_context_ready_for_agent_use",
          purpose: "Tell an AI agent the bounded context can be read safely."
        },
        {
          path: "response_observation_summary_json.selected_source_refs",
          value_type: "string[]",
          required: true,
          purpose: "Expose selected source refs for grounding."
        },
        {
          path: "response_observation_summary_json.selected_scope_ids",
          value_type: "string[]",
          required: true,
          purpose: "Expose selected scope ids for bounded context traceability."
        },
        {
          path: "response_observation_summary_json.safe_agent_use_hints",
          value_type: "string[]",
          required: true,
          purpose: "Tell the consuming agent which read-only actions are safe."
        },
        {
          path: "response_observation_summary_json.denied_agent_action_hints",
          value_type: "string[]",
          required: true,
          purpose: "Tell the consuming agent which execution actions remain denied."
        },
        {
          path: "response_observation_summary_json.runtime_permission_granted",
          value_type: "boolean",
          required: true,
          const_value: false,
          purpose: "Confirm no runtime permission was granted."
        },
        {
          path: "response_observation_summary_json.actual_contour_execution_allowed_now",
          value_type: "boolean",
          required: true,
          const_value: false,
          purpose: "Confirm no contour execution was allowed."
        }
      ]
    },
    path_policy: {
      allowed_request_variation_paths: [
        "intent.task_signal",
        "intent.read_mode_hint",
        "intent.depth_hint",
        "intent.requested_scope_hints"
      ],
      denied_request_variation_paths: [
        "authority.*",
        "execution_posture.*",
        "requester.*",
        "operation_id",
        "operation_version",
        "contract_only",
        "bounded_context_requested",
        "bounded_context_delivered"
      ]
    },
    local_io: {
      command_ref: "tool:local-json:run",
      input_argument: "--request",
      output_argument: "--response",
      variation_arguments: ["--task-signal", "--read-mode", "--depth", "--scope-hints"],
      reads_only_explicit_request_fixture: true,
      writes_only_explicit_response_fixture: true,
      arbitrary_source_loading_allowed: false,
      multi_request_runner_implemented: false
    },
    safe_agent_use_hints: [
      "read_selected_bounded_context",
      "use_selected_source_refs_for_grounding",
      "preserve_authority_provenance_permission_audit_refs",
      "treat_response_as_non_executing_context"
    ],
    denied_agent_action_hints: [
      "do_not_execute_runtime_handlers",
      "do_not_call_provider_sdks",
      "do_not_read_or_write_concrete_persistence",
      "do_not_issue_permission_grants",
      "do_not_perform_model_calls",
      "do_not_perform_storage_writes",
      "do_not_invoke_contours"
    ],
    default_deny_execution_posture: {
      mcp_server_implemented: false,
      mcp_tool_registered: false,
      mcp_resource_registered: false,
      api_route_registered: false,
      api_controller_registered: false,
      runtime_handler_bound: false,
      network_access_allowed_now: false,
      provider_sdk_call_allowed_now: false,
      transport_execution_allowed_now: false,
      concrete_persistence_read_allowed_now: false,
      concrete_persistence_write_allowed_now: false,
      real_model_call_allowed_now: false,
      real_storage_write_allowed_now: false,
      runtime_permission_granted: false,
      actual_contour_execution_allowed_now: false
    },
    notes: [
      "This schema is an agent-readable contract artifact, not a runtime server.",
      "It describes the bounded local JSON request/response path for AI agents.",
      "It does not register MCP/API routes, bind handlers, call providers, validate tokens, grant permissions, or execute contours."
    ]
  });
