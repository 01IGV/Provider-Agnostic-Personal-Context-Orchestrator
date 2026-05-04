#!/usr/bin/env node

import { createHash } from "node:crypto";
import { closeSync, openSync, readSync, statSync, writeFileSync } from "node:fs";
import { dirname, isAbsolute, normalize, resolve, relative } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
  createDeterministicNarrowLocalRealSourceReadBoundaryContracts
} from "../packages/system-assembly/dist/index.js";

const stableJson = (value) => `${JSON.stringify(value, null, 2)}\n`;
const usage =
  "Usage: node scripts/local-real-source-adapter-v0-cli.mjs --response-output <path> --summary-output <path> --index-output <path> [--source-ref <repo-file://...>]";
const requiredArgs = ["response-output", "summary-output", "index-output"];
const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

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
  const allowedArgs = new Set([...requiredArgs, "source-ref"]);

  if (missing.length > 0 || [...args.keys()].some((key) => !allowedArgs.has(key))) {
    throw new Error(usage);
  }

  return {
    response_output_path: resolve(args.get("response-output")),
    summary_output_path: resolve(args.get("summary-output")),
    index_output_path: resolve(args.get("index-output")),
    requested_source_refs: args.has("source-ref") ? [args.get("source-ref")] : undefined
  };
};

const hasGlob = (path) => /[*?[\]{}]/u.test(path);
const digestText = (content) =>
  `sha256:${createHash("sha256").update(content, "utf8").digest("hex")}`;

const assertRepoRelativeAllowlistedPath = ({ repo_relative_path, allowedRoot }) => {
  if (
    typeof repo_relative_path !== "string" ||
    repo_relative_path.length === 0 ||
    isAbsolute(repo_relative_path) ||
    repo_relative_path.includes("..") ||
    hasGlob(repo_relative_path)
  ) {
    throw new Error("requested_source_ref_path_denied");
  }

  const normalizedPath = normalize(repo_relative_path);
  const normalizedRoot = normalize(allowedRoot.repo_relative_root);

  if (
    normalizedPath !== repo_relative_path ||
    !(
      normalizedPath === normalizedRoot ||
      normalizedPath.startsWith(`${normalizedRoot}/`)
    )
  ) {
    throw new Error("requested_source_ref_outside_allowlisted_root");
  }

  const absolutePath = resolve(repoRoot, normalizedPath);
  const relativePath = relative(repoRoot, absolutePath);

  if (
    relativePath.startsWith("..") ||
    isAbsolute(relativePath) ||
    relativePath !== normalizedPath
  ) {
    throw new Error("requested_source_ref_resolves_outside_repo");
  }

  return absolutePath;
};

const selectSourceRefs = ({ boundary, requested_source_refs }) => {
  const allowedSourceRefs = boundary.allowed_source_refs ?? [];

  if (!requested_source_refs || requested_source_refs.length === 0) {
    return allowedSourceRefs;
  }

  return requested_source_refs.map((sourceRef) => {
    const allowed = allowedSourceRefs.find((candidate) => candidate.source_ref === sourceRef);

    if (!allowed) {
      throw new Error("requested_source_ref_not_allowlisted");
    }

    return allowed;
  });
};

const readAllowlistedSourceItem = ({ boundary, sourceRef, deterministicOrder }) => {
  const allowedRoot = boundary.allowed_roots?.find(
    (root) => root.root_ref === sourceRef.root_ref
  );

  if (!allowedRoot) {
    throw new Error("requested_source_ref_root_not_allowlisted");
  }

  const absolutePath = assertRepoRelativeAllowlistedPath({
    repo_relative_path: sourceRef.repo_relative_path,
    allowedRoot
  });
  const stat = statSync(absolutePath);

  if (!stat.isFile()) {
    throw new Error("requested_source_ref_not_a_file");
  }

  const readBuffer = Buffer.alloc(sourceRef.max_bytes_per_read);
  const fileDescriptor = openSync(absolutePath, "r");
  let bytesRead = 0;

  try {
    bytesRead = readSync(
      fileDescriptor,
      readBuffer,
      0,
      sourceRef.max_bytes_per_read,
      0
    );
  } finally {
    closeSync(fileDescriptor);
  }

  const contentText = readBuffer.subarray(0, bytesRead).toString("utf8");
  const byteLength = Buffer.byteLength(contentText, "utf8");

  if (byteLength > sourceRef.max_bytes_per_read) {
    throw new Error("requested_source_ref_exceeds_max_bytes_per_read");
  }

  return {
    source_item_id: `${boundary.agent_context_request_id}:local-real-source-item:${deterministicOrder}`,
    source_ref: sourceRef.source_ref,
    source_kind: sourceRef.ref_kind,
    scope_id: sourceRef.scope_id,
    repo_relative_path: sourceRef.repo_relative_path,
    deterministic_order: deterministicOrder,
    byte_length: byteLength,
    source_file_byte_length: stat.size,
    content_truncated_to_max_bytes: stat.size > sourceRef.max_bytes_per_read,
    max_bytes_per_read: sourceRef.max_bytes_per_read,
    content_digest: digestText(contentText),
    content_text: contentText,
    provenance_ref: boundary.provenance_envelope_ref,
    permission_ref: boundary.permission_envelope_ref,
    audit_ref: boundary.audit_envelope_ref
  };
};

const deniedProbe = ({ label, requested_source_refs }) => {
  try {
    runLocalRealSourceAdapterV0({
      response_output_path: undefined,
      summary_output_path: undefined,
      index_output_path: undefined,
      requested_source_refs,
      write_artifacts: false
    });

    return {
      label,
      denied: false,
      failure: "probe_unexpectedly_allowed"
    };
  } catch (error) {
    return {
      label,
      denied: true,
      failure: error instanceof Error ? error.message : String(error)
    };
  }
};

export const runLocalRealSourceAdapterV0 = ({
  response_output_path,
  summary_output_path,
  index_output_path,
  requested_source_refs,
  write_artifacts = true
}) => {
  const {
    request,
    bounded_real_source_adapter_contract: boundedContract,
    narrow_local_real_source_read_boundary: boundary
  } = createDeterministicNarrowLocalRealSourceReadBoundaryContracts();
  const selectedSourceRefs = selectSourceRefs({ boundary, requested_source_refs });
  const sourceItems = selectedSourceRefs.map((sourceRef, index) =>
    readAllowlistedSourceItem({
      boundary,
      sourceRef,
      deterministicOrder: index + 1
    })
  );
  const selectedScopeIds = [...new Set(sourceItems.map((item) => item.scope_id))];
  const selectedSourceRefIds = sourceItems.map((item) => item.source_ref);
  const readDigests = sourceItems.map((item) => item.content_digest);
  const receipt = {
    receipt_id: `${request.agent_context_request_id}:local-real-source-adapter-v0-receipt`,
    receipt_version: "local-v0-source-materialization-receipt/v1",
    agent_context_request_id: request.agent_context_request_id,
    adapter_result_id: `${request.agent_context_request_id}:local-real-source-adapter-v0-result`,
    source_catalog_ref: boundary.source_catalog_ref,
    read_boundary_ref: boundary.boundary_version,
    materialization_boundary: "bounded_local_real_source_adapter_v0_materialization",
    requested_source_refs: requested_source_refs ?? selectedSourceRefIds,
    selected_scope_ids: selectedScopeIds,
    selected_source_refs: selectedSourceRefIds,
    selected_source_item_count: sourceItems.length,
    receipt_items: sourceItems.map((item) => ({
      receipt_item_id: `${request.agent_context_request_id}:local-real-source-receipt-item:${item.deterministic_order}`,
      source_item_id: item.source_item_id,
      scope_id: item.scope_id,
      source_ref: item.source_ref,
      source_kind: item.source_kind,
      deterministic_order: item.deterministic_order,
      byte_length: item.byte_length,
      content_digest: item.content_digest,
      provenance_ref: item.provenance_ref,
      permission_ref: item.permission_ref,
      audit_ref: item.audit_ref
    })),
    provenance_envelope_ref: boundary.provenance_envelope_ref,
    permission_envelope_ref: boundary.permission_envelope_ref,
    audit_envelope_ref: boundary.audit_envelope_ref,
    execution_posture: {
      contract_only: false,
      deterministic: true,
      local_only: true,
      allowlisted_source_catalog: true,
      live_source_read_performed: true,
      direct_agent_repo_file_access_allowed_now: false,
      arbitrary_file_read_allowed_now: false,
      user_selected_path_read_allowed_now: false,
      directory_traversal_allowed_now: false,
      directory_listing_allowed_now: false,
      repo_scanning_allowed_now: false,
      runtime_permission_granted: false,
      actual_contour_execution_allowed_now: false
    },
    generated_at: boundary.generated_at
  };
  const responseArtifact = {
    verification_result: "local_real_source_adapter_v0_response_ready",
    output_contract_ref: "local-real-source-adapter-v0-response/v1",
    intended_consumer: "ai_agent",
    artifact_boundary: "agent_consumable_bounded_context_response",
    agent_context_request_id: request.agent_context_request_id,
    bounded_real_source_adapter_contract_ref: boundedContract.contract_version,
    read_boundary_ref: boundary.boundary_version,
    source_catalog_ref: boundary.source_catalog_ref,
    receipt_contract_ref: boundary.receipt_contract_ref,
    selected_scope_ids: selectedScopeIds,
    selected_source_refs: selectedSourceRefIds,
    source_items: sourceItems,
    source_materialization_receipt: receipt,
    provenance_envelope_ref: boundary.provenance_envelope_ref,
    permission_envelope_ref: boundary.permission_envelope_ref,
    audit_envelope_ref: boundary.audit_envelope_ref,
    execution_posture: {
      local_only: true,
      deterministic: true,
      bounded_real_source_read_performed: true,
      live_source_read_performed: true,
      reads_only_narrow_local_real_source_boundary_refs: true,
      direct_agent_repo_file_access_allowed_now: false,
      arbitrary_file_read_allowed_now: false,
      user_selected_path_read_allowed_now: false,
      directory_traversal_allowed_now: false,
      directory_listing_allowed_now: false,
      repo_scanning_allowed_now: false,
      git_command_execution_allowed_now: false,
      network_access_allowed_now: false,
      mcp_server_allowed_now: false,
      mcp_tool_resource_registration_allowed_now: false,
      api_route_controller_allowed_now: false,
      runtime_handler_bound: false,
      provider_sdk_call_allowed_now: false,
      concrete_persistence_read_allowed_now: false,
      concrete_persistence_write_allowed_now: false,
      auth_iam_implementation_allowed_now: false,
      token_session_validation_allowed_now: false,
      policy_engine_execution_allowed_now: false,
      permission_grant_allowed_now: false,
      real_model_call_allowed_now: false,
      real_storage_write_allowed_now: false,
      runtime_permission_granted: false,
      actual_contour_execution_allowed_now: false
    },
    failure_count: 0,
    failures: []
  };
  const summaryArtifact = {
    verification_result: "local_real_source_adapter_v0_summary_ready",
    output_contract_ref: "local-real-source-adapter-v0-summary/v1",
    intended_consumer: "ai_agent",
    selected_scope_ids: selectedScopeIds,
    selected_source_refs: selectedSourceRefIds,
    selected_source_item_count: sourceItems.length,
    content_digests: readDigests,
    source_materialization_receipt_id: receipt.receipt_id,
    source_materialization_receipt_ref: receipt.receipt_version,
    read_boundary_ref: boundary.boundary_version,
    direct_agent_repo_file_access_allowed_now: false,
    live_source_read_performed: true,
    runtime_permission_granted: false,
    actual_contour_execution_allowed_now: false,
    failure_count: 0,
    failures: []
  };
  const indexArtifact = {
    verification_result: "local_real_source_adapter_v0_artifact_set_written",
    output_contract_ref: "local-real-source-adapter-v0-artifact-set/v1",
    intended_consumer: "ai_agent",
    sample_command:
      "npm run tool:local-real-source-adapter-v0:run -- --response-output <path> --summary-output <path> --index-output <path> [--source-ref <repo-file://...>]",
    artifact_paths: {
      response_output_path,
      summary_output_path,
      index_output_path
    },
    artifact_contract_refs: {
      response: responseArtifact.output_contract_ref,
      summary: summaryArtifact.output_contract_ref,
      source_materialization_receipt: receipt.receipt_version,
      read_boundary: boundary.boundary_version,
      source_catalog: boundary.source_catalog_ref
    },
    selected_scope_ids: selectedScopeIds,
    selected_source_refs: selectedSourceRefIds,
    content_digests: readDigests,
    writes_only_explicit_local_real_source_adapter_v0_paths: true,
    reads_only_narrow_local_real_source_boundary_refs: true,
    file_read_performed: true,
    file_write_performed: write_artifacts,
    live_source_read_performed: true,
    direct_agent_repo_file_access_allowed_now: false,
    arbitrary_file_read_allowed_now: false,
    user_selected_path_read_allowed_now: false,
    directory_traversal_allowed_now: false,
    directory_listing_allowed_now: false,
    repo_scanning_allowed_now: false,
    runtime_permission_granted: false,
    actual_contour_execution_allowed_now: false,
    failure_count: 0,
    failures: []
  };

  if (write_artifacts) {
    writeFileSync(response_output_path, stableJson(responseArtifact), "utf8");
    writeFileSync(summary_output_path, stableJson(summaryArtifact), "utf8");
    writeFileSync(index_output_path, stableJson(indexArtifact), "utf8");
  }

  return indexArtifact;
};

export const readLocalRealSourceAdapterV0DeniedProbes = () => [
  deniedProbe({
    label: "absolute_path_source_ref_denied",
    requested_source_refs: ["repo-file:///tmp/secret.md"]
  }),
  deniedProbe({
    label: "parent_directory_source_ref_denied",
    requested_source_refs: ["repo-file://docs/04-implementation/../README.md"]
  }),
  deniedProbe({
    label: "unknown_source_ref_denied",
    requested_source_refs: ["repo-file://docs/04-implementation/README.md"]
  }),
  deniedProbe({
    label: "directory_ref_denied",
    requested_source_refs: ["repo-file://docs/04-implementation"]
  })
];

const isDirectRun = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectRun) {
  try {
    const result = runLocalRealSourceAdapterV0(parseArgs(process.argv.slice(2)));

    console.log(stableJson(result));
    process.exit(result.failure_count === 0 ? 0 : 1);
  } catch (error) {
    console.error(
      stableJson({
        verification_result: "local_real_source_adapter_v0_failed",
        output_contract_ref: "local-real-source-adapter-v0-artifact-set/v1",
        message: error instanceof Error ? error.message : String(error),
        file_read_performed: false,
        file_write_performed: false,
        direct_agent_repo_file_access_allowed_now: false,
        runtime_permission_granted: false,
        actual_contour_execution_allowed_now: false,
        failure_count: 1
      })
    );
    process.exit(1);
  }
}
