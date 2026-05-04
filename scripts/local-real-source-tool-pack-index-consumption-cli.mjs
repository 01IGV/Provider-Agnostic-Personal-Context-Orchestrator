#!/usr/bin/env node

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, isAbsolute, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import {
  runLocalRealSourceToolPackConsumption
} from "./local-real-source-tool-pack-consumption-cli.mjs";

const stableJson = (value) => `${JSON.stringify(value, null, 2)}\n`;
const usage =
  "Usage: node scripts/local-real-source-tool-pack-index-consumption-cli.mjs --tool-pack-index <path> --consumption-summary-output <path>";
const requiredArgs = ["tool-pack-index", "consumption-summary-output"];

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

  const missing = requiredArgs.filter((key) => !args.has(key));

  if (missing.length > 0 || args.size !== requiredArgs.length) {
    throw new Error(usage);
  }

  return {
    tool_pack_index_path: resolve(args.get("tool-pack-index")),
    consumption_summary_output_path: resolve(args.get("consumption-summary-output"))
  };
};

const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));

const requiredArtifactPathKeys = [
  "manifest_output_path",
  "request_output_path",
  "response_output_path",
  "summary_output_path",
  "index_output_path",
  "sample_index_output_path",
  "tool_pack_index_output_path"
];

const validateIndexArtifactPaths = ({ toolPackIndex, tool_pack_index_path }) => {
  const artifactPaths = toolPackIndex?.artifact_paths ?? {};
  const toolPackDirectory = dirname(tool_pack_index_path);
  const failures = [];

  for (const key of requiredArtifactPathKeys) {
    const path = artifactPaths[key];

    if (typeof path !== "string") {
      failures.push(`${key}_missing`);
      continue;
    }

    if (!isAbsolute(path)) {
      failures.push(`${key}_not_absolute`);
    }

    if (dirname(resolve(path)) !== toolPackDirectory) {
      failures.push(`${key}_outside_tool_pack_directory`);
    }
  }

  if (artifactPaths.tool_pack_index_output_path !== tool_pack_index_path) {
    failures.push("tool_pack_index_path_mismatch");
  }

  return failures;
};

export const runLocalRealSourceToolPackIndexConsumption = ({
  tool_pack_index_path,
  consumption_summary_output_path
}) => {
  const toolPackIndex = readJson(tool_pack_index_path);
  const pathBoundaryFailures = validateIndexArtifactPaths({
    toolPackIndex,
    tool_pack_index_path
  });

  if (pathBoundaryFailures.length > 0) {
    const failedSummary = {
      verification_result: "local_real_source_tool_pack_index_consumption_failed",
      output_contract_ref: "local-real-source-tool-pack-index-consumption/v1",
      tool_pack_index_path,
      consumption_summary_output_path,
      input_mode: "tool_pack_index_only",
      discovered_artifact_paths_from_tool_pack_index: false,
      artifact_paths_confined_to_tool_pack_directory: false,
      file_read_performed: true,
      file_write_performed: true,
      writes_only_explicit_consumption_summary_path: true,
      direct_agent_repo_file_access_allowed_now: false,
      arbitrary_source_loading_allowed: false,
      user_selected_path_read_allowed_now: false,
      directory_traversal_allowed_now: false,
      directory_listing_allowed_now: false,
      repo_scanning_allowed_now: false,
      runtime_permission_granted: false,
      actual_contour_execution_allowed_now: false,
      failure_count: pathBoundaryFailures.length,
      failures: pathBoundaryFailures
    };

    writeFileSync(consumption_summary_output_path, stableJson(failedSummary), "utf8");

    return failedSummary;
  }

  const artifactPaths = toolPackIndex.artifact_paths;
  const consumptionSummary = runLocalRealSourceToolPackConsumption({
    tool_pack_index_path,
    manifest_path: artifactPaths.manifest_output_path,
    request_path: artifactPaths.request_output_path,
    response_path: artifactPaths.response_output_path,
    summary_path: artifactPaths.summary_output_path,
    index_path: artifactPaths.index_output_path,
    sample_index_path: artifactPaths.sample_index_output_path,
    consumption_summary_output_path
  });
  const indexConsumptionSummary = {
    ...consumptionSummary,
    verification_result:
      consumptionSummary.failure_count === 0
        ? "local_real_source_tool_pack_index_consumption_completed"
        : "local_real_source_tool_pack_index_consumption_failed",
    output_contract_ref: "local-real-source-tool-pack-index-consumption/v1",
    underlying_consumption_contract_ref: consumptionSummary.output_contract_ref,
    input_mode: "tool_pack_index_only",
    discovered_artifact_paths_from_tool_pack_index: true,
    artifact_paths_confined_to_tool_pack_directory: true,
    writes_only_explicit_consumption_summary_path: true
  };

  writeFileSync(consumption_summary_output_path, stableJson(indexConsumptionSummary), "utf8");

  return indexConsumptionSummary;
};

const isDirectRun = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectRun) {
  try {
    const result = runLocalRealSourceToolPackIndexConsumption(parseArgs(process.argv.slice(2)));

    console.log(stableJson(result));
    process.exit(result.failure_count === 0 ? 0 : 1);
  } catch (error) {
    console.error(
      stableJson({
        verification_result: "local_real_source_tool_pack_index_consumption_failed",
        output_contract_ref: "local-real-source-tool-pack-index-consumption/v1",
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
