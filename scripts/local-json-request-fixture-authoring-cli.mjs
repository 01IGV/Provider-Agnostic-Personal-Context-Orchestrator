#!/usr/bin/env node

import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import {
  createDeterministicLocalJsonRequestResponseRunnerShape
} from "../packages/system-assembly/dist/index.js";

const ALLOWED_READ_MODES = new Set([
  "quick_answer",
  "continuation",
  "planning",
  "handoff_recovery",
  "workflow_execution",
  "deep_context",
  "state_reconstruction"
]);

const ALLOWED_DEPTH_HINTS = new Set(["shallow", "standard", "deep"]);
const MAX_TASK_SIGNAL_LENGTH = 240;
const MAX_SCOPE_HINT_LENGTH = 160;

const usage =
  "Usage: node scripts/local-json-request-fixture-authoring-cli.mjs --output <path> [--task-signal <text>] [--read-mode <mode>] [--depth <hint>] [--scope-hints <scope:a,scope:b>]";

const parseArgs = (argv) => {
  const args = new Map();

  for (let index = 0; index < argv.length; index += 2) {
    const key = argv[index];
    const value = argv[index + 1];

    if (!key?.startsWith("--") || !value) {
      throw new Error(usage);
    }

    args.set(key.slice(2), value);
  }

  const output = args.get("output");

  if (!output) {
    throw new Error("--output is required.");
  }

  return {
    output_path: resolve(output),
    variation: {
      task_signal: args.get("task-signal"),
      read_mode_hint: args.get("read-mode"),
      depth_hint: args.get("depth"),
      requested_scope_hints: args.get("scope-hints")?.split(",").map((scopeHint) => scopeHint.trim()).filter(Boolean)
    }
  };
};

const stableJson = (value) => `${JSON.stringify(value, null, 2)}\n`;

const cloneJson = (value) => JSON.parse(JSON.stringify(value));

const normalizeVariation = (variation = {}) => {
  const normalized = {};

  if (variation.task_signal !== undefined) {
    if (typeof variation.task_signal !== "string" || variation.task_signal.trim().length === 0) {
      throw new Error("--task-signal must be a non-empty string.");
    }

    if (variation.task_signal.length > MAX_TASK_SIGNAL_LENGTH) {
      throw new Error(`--task-signal must be ${MAX_TASK_SIGNAL_LENGTH} characters or fewer.`);
    }

    normalized.task_signal = variation.task_signal;
  }

  if (variation.read_mode_hint !== undefined) {
    if (!ALLOWED_READ_MODES.has(variation.read_mode_hint)) {
      throw new Error(`--read-mode must be one of: ${Array.from(ALLOWED_READ_MODES).join(", ")}.`);
    }

    normalized.read_mode_hint = variation.read_mode_hint;
  }

  if (variation.depth_hint !== undefined) {
    if (!ALLOWED_DEPTH_HINTS.has(variation.depth_hint)) {
      throw new Error(`--depth must be one of: ${Array.from(ALLOWED_DEPTH_HINTS).join(", ")}.`);
    }

    normalized.depth_hint = variation.depth_hint;
  }

  if (variation.requested_scope_hints !== undefined) {
    if (!Array.isArray(variation.requested_scope_hints) || variation.requested_scope_hints.length === 0) {
      throw new Error("--scope-hints must contain at least one comma-separated scope hint.");
    }

    for (const scopeHint of variation.requested_scope_hints) {
      if (typeof scopeHint !== "string" || scopeHint.trim().length === 0) {
        throw new Error("--scope-hints entries must be non-empty strings.");
      }

      if (!scopeHint.startsWith("scope:")) {
        throw new Error("--scope-hints entries must use the scope:<id> form.");
      }

      if (scopeHint.length > MAX_SCOPE_HINT_LENGTH) {
        throw new Error(`--scope-hints entries must be ${MAX_SCOPE_HINT_LENGTH} characters or fewer.`);
      }
    }

    normalized.requested_scope_hints = variation.requested_scope_hints;
  }

  return normalized;
};

const applyConstrainedIntentVariation = (requestJson, variation) => ({
  ...requestJson,
  intent: {
    ...requestJson.intent,
    ...normalizeVariation(variation)
  }
});

export const writeLocalJsonRequestFixture = ({ output_path, variation }) => {
  const runnerShape = createDeterministicLocalJsonRequestResponseRunnerShape();
  const requestJson = applyConstrainedIntentVariation(
    cloneJson(runnerShape.runner_request.request_json),
    variation
  );

  writeFileSync(output_path, stableJson(requestJson), "utf8");

  return {
    verification_result: "local_json_request_fixture_authored",
    output_path,
    agent_context_request_id: requestJson.agent_context_request_id,
    operation_id: requestJson.operation_id,
    request_kind: requestJson.intent.request_kind,
    task_signal: requestJson.intent.task_signal,
    read_mode_hint: requestJson.intent.read_mode_hint,
    depth_hint: requestJson.intent.depth_hint,
    requested_scope_hints: requestJson.intent.requested_scope_hints,
    variation_applied: Object.keys(normalizeVariation(variation)).length > 0,
    file_write_performed: true,
    file_read_performed: false,
    child_process_spawned: false,
    mcp_server_implemented: false,
    mcp_tool_registered: false,
    mcp_resource_registered: false,
    api_route_registered: false,
    api_controller_registered: false,
    runtime_handler_bound: false,
    provider_sdk_call_allowed_now: false,
    transport_execution_allowed_now: false,
    concrete_persistence_read_allowed_now: false,
    concrete_persistence_write_allowed_now: false,
    real_model_call_allowed_now: false,
    real_storage_write_allowed_now: false,
    runtime_permission_granted: false,
    actual_contour_execution_allowed_now: false,
    failure_count: 0,
    failures: []
  };
};

const isDirectRun = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectRun) {
  try {
    const result = writeLocalJsonRequestFixture(parseArgs(process.argv.slice(2)));
    console.log(stableJson(result));
    process.exit(0);
  } catch (error) {
    console.error(
      stableJson({
        verification_result: "local_json_request_fixture_authoring_failed",
        message: error instanceof Error ? error.message : String(error),
        file_write_performed: false,
        runtime_permission_granted: false,
        actual_contour_execution_allowed_now: false,
        failure_count: 1
      })
    );
    process.exit(1);
  }
}
