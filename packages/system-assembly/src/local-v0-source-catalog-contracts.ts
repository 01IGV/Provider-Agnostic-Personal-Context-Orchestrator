import { asCanonicalId } from "@orchestrator/core-foundation";
import type { LocalDeterministicContextSourceItemShape } from "@orchestrator/integration-contracts";
import type {
  LocalV0SourceCatalogEntryShape,
  LocalV0SourceCatalogExecutionPostureShape,
  LocalV0SourceCatalogShape
} from "./local-v0-source-catalog-contracts-types.js";

export const DEFAULT_LOCAL_V0_SOURCE_SCOPE_ID = "scope:deterministic-agent-context-request";
export const PROJECT_ORIENTATION_SCOPE_ID = "scope:project-orientation";
export const ACTIVE_BOUNDARY_CHAIN_SCOPE_ID = "scope:active-boundary-chain";

const sourceCatalogExecutionPosture = (): LocalV0SourceCatalogExecutionPostureShape => ({
  contract_only: true,
  local_only: true,
  deterministic: true,
  allowlisted_source_catalog: true,
  arbitrary_file_read_allowed_now: false,
  user_selected_path_read_allowed_now: false,
  directory_traversal_allowed_now: false,
  network_access_allowed_now: false,
  provider_sdk_call_allowed_now: false,
  concrete_persistence_read_allowed_now: false,
  concrete_persistence_write_allowed_now: false,
  real_model_call_allowed_now: false,
  real_storage_write_allowed_now: false,
  runtime_permission_granted: false,
  actual_contour_execution_allowed_now: false
});

const createCatalogEntry = ({
  request_id,
  scope_id,
  source_ref,
  source_kind,
  deterministic_order,
  content_digest,
  description,
  content_shape_ref,
  content
}: {
  request_id: string;
  scope_id: string;
  source_ref: string;
  source_kind: LocalDeterministicContextSourceItemShape["source_kind"];
  deterministic_order: number;
  content_digest: string;
  description: string;
  content_shape_ref: string;
  content: Record<string, unknown>;
}): LocalV0SourceCatalogEntryShape => {
  const suffix = scope_id.replace("scope:", "");
  const sourceItem = {
    source_item_id: `${request_id}:local-source-item:${suffix}`,
    source_ref,
    source_kind,
    scope_id: asCanonicalId<"scope_id">(scope_id),
    visibility: "subject_scoped",
    deterministic_order,
    provenance_ref: `${request_id}:provenance:${suffix}`,
    permission_ref: `${request_id}:permission:${suffix}`,
    audit_ref: `${request_id}:audit:${suffix}`,
    content_digest,
    content
  } satisfies LocalDeterministicContextSourceItemShape;

  return {
    catalog_entry_id: `local-v0-source-catalog-entry:${suffix}`,
    scope_id: sourceItem.scope_id,
    source_ref,
    source_kind,
    deterministic_order,
    content_digest,
    provenance_ref: sourceItem.provenance_ref,
    permission_ref: sourceItem.permission_ref,
    audit_ref: sourceItem.audit_ref,
    description,
    content_shape_ref,
    source_item_template: sourceItem
  };
};

export const createLocalV0SourceCatalog = (request_id: string): LocalV0SourceCatalogShape => {
  const entries = [
    createCatalogEntry({
      request_id,
      scope_id: PROJECT_ORIENTATION_SCOPE_ID,
      source_ref: "local://deterministic/context/project-orientation",
      source_kind: "inline_seeded_context",
      deterministic_order: 1,
      content_digest: "sha256:local-deterministic-project-orientation-v1",
      description: "Project orientation for the AI-facing Context Authority Gateway.",
      content_shape_ref: "local-v0-source-content/project-orientation/v1",
      content: {
        purpose: "AI-facing Context Authority Gateway",
        posture: "default-deny",
        runtime_execution_allowed_now: false
      }
    }),
    createCatalogEntry({
      request_id,
      scope_id: ACTIVE_BOUNDARY_CHAIN_SCOPE_ID,
      source_ref: "local://deterministic/context/active-boundary-chain",
      source_kind: "local_fixture_context",
      deterministic_order: 2,
      content_digest: "sha256:local-deterministic-active-boundary-chain-v1",
      description: "Active proof and boundary chain for the local v0 agent path.",
      content_shape_ref: "local-v0-source-content/active-boundary-chain/v1",
      content: {
        chain: [
          "end-to-end non-executing proof",
          "invocation denial proof",
          "handler-boundary denial proof",
          "surface-boundary denial proof",
          "authority-boundary denial proof",
          "agent context request boundary",
          "local v0 single-command runner"
        ],
        bounded_context_materialization: "local deterministic contract only"
      }
    })
  ];

  return {
    catalog_id: "local-v0-source-catalog",
    catalog_version: "local-v0-source-catalog/v1",
    catalog_boundary: "contract_only_allowlisted_local_source_catalog",
    intended_consumer: "ai_agent",
    supported_scope_ids: entries.map((entry) => entry.scope_id),
    entries,
    entry_count: entries.length,
    default_scope_id: asCanonicalId<"scope_id">(DEFAULT_LOCAL_V0_SOURCE_SCOPE_ID),
    selection_policy: {
      request_scope_hints_allowed: true,
      fallback_to_all_catalog_entries: true,
      arbitrary_file_paths_allowed: false,
      unknown_scope_grants_access: false
    },
    execution_posture: sourceCatalogExecutionPosture()
  };
};

export const selectLocalV0SourceCatalogItems = (
  request_id: string,
  requested_scope_hints: string[] = [DEFAULT_LOCAL_V0_SOURCE_SCOPE_ID]
): LocalDeterministicContextSourceItemShape[] => {
  const catalog = createLocalV0SourceCatalog(request_id);
  const requestedScopes = new Set(requested_scope_hints);

  if (requestedScopes.has(DEFAULT_LOCAL_V0_SOURCE_SCOPE_ID)) {
    return catalog.entries.map((entry) => entry.source_item_template);
  }

  const selectedEntries = catalog.entries.filter((entry) => requestedScopes.has(entry.scope_id));

  return (selectedEntries.length > 0 ? selectedEntries : catalog.entries).map(
    (entry) => entry.source_item_template
  );
};
