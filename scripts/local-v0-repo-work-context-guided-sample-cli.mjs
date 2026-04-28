#!/usr/bin/env node

import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import {
  writeLocalV0SourceCatalogGuidedCommandSampleArtifactSet
} from "./local-v0-source-catalog-guided-command-sample-cli.mjs";

const stableJson = (value) => `${JSON.stringify(value, null, 2)}\n`;
const usage =
  "Usage: node scripts/local-v0-repo-work-context-guided-sample-cli.mjs --manifest-output <path> --schema-output <path> --source-catalog-output <path> --tool-pack-sample-request-output <path> --tool-pack-sample-response-output <path> --tool-pack-sample-summary-output <path> --tool-pack-sample-index-output <path> --tool-pack-index-output <path> --guided-request-output <path> --guided-response-output <path> --guided-summary-output <path> --guided-index-output <path>";

const requiredArgs = [
  "manifest-output",
  "schema-output",
  "source-catalog-output",
  "tool-pack-sample-request-output",
  "tool-pack-sample-response-output",
  "tool-pack-sample-summary-output",
  "tool-pack-sample-index-output",
  "tool-pack-index-output",
  "guided-request-output",
  "guided-response-output",
  "guided-summary-output",
  "guided-index-output"
];

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

  return Object.fromEntries(
    requiredArgs.map((key) => [
      `${key.replaceAll("-", "_")}_path`,
      resolve(args.get(key))
    ])
  );
};

export const writeLocalV0RepoWorkContextGuidedSampleArtifactSet = (paths) =>
  writeLocalV0SourceCatalogGuidedCommandSampleArtifactSet({
    ...paths,
    scope_id: "scope:repo-work-context",
    task_signal: "repo work context guided sample bounded planning request",
    verification_result: "local_v0_repo_work_context_guided_sample_artifact_set_written",
    output_contract_ref: "local-v0-repo-work-context-guided-sample-artifact-set/v1"
  });

const isDirectRun = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectRun) {
  try {
    const result = writeLocalV0RepoWorkContextGuidedSampleArtifactSet(
      parseArgs(process.argv.slice(2))
    );

    console.log(stableJson(result));
    process.exit(result.failure_count === 0 ? 0 : 1);
  } catch (error) {
    console.error(
      stableJson({
        verification_result: "local_v0_repo_work_context_guided_sample_artifact_set_failed",
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
