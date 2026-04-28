#!/usr/bin/env node

import {
  ACTIVE_BOUNDARY_CHAIN_SCOPE_ID,
  DEFAULT_LOCAL_V0_SOURCE_SCOPE_ID,
  PROJECT_ORIENTATION_SCOPE_ID,
  REPO_WORK_CONTEXT_SCOPE_ID,
  createDeterministicLocalContextSourceAdapterContracts,
  createLocalV0SourceCatalog,
  selectLocalV0SourceCatalogItems
} from "../packages/system-assembly/dist/index.js";

const requestId = "local-v0-source-catalog-contracts:verification-request";
const catalog = createLocalV0SourceCatalog(requestId);
const allSelectedItems = selectLocalV0SourceCatalogItems(requestId, [
  DEFAULT_LOCAL_V0_SOURCE_SCOPE_ID
]);
const activeBoundaryItems = selectLocalV0SourceCatalogItems(requestId, [
  ACTIVE_BOUNDARY_CHAIN_SCOPE_ID
]);
const repoWorkContextItems = selectLocalV0SourceCatalogItems(requestId, [
  REPO_WORK_CONTEXT_SCOPE_ID
]);
const unknownScopeItems = selectLocalV0SourceCatalogItems(requestId, ["scope:unknown"]);
const adapterContracts = createDeterministicLocalContextSourceAdapterContracts();
const adapterSourceItems = adapterContracts.adapter_result.source_items;

const assertions = {
  catalog_contract_shape:
    catalog.catalog_id === "local-v0-source-catalog" &&
    catalog.catalog_version === "local-v0-source-catalog/v1" &&
    catalog.catalog_boundary === "contract_only_allowlisted_local_source_catalog" &&
    catalog.intended_consumer === "ai_agent" &&
    catalog.entry_count === catalog.entries.length &&
    catalog.entry_count === 3,
  catalog_lists_supported_scopes:
    catalog.supported_scope_ids.includes(PROJECT_ORIENTATION_SCOPE_ID) &&
    catalog.supported_scope_ids.includes(ACTIVE_BOUNDARY_CHAIN_SCOPE_ID) &&
    catalog.supported_scope_ids.includes(REPO_WORK_CONTEXT_SCOPE_ID) &&
    catalog.default_scope_id === DEFAULT_LOCAL_V0_SOURCE_SCOPE_ID,
  catalog_entries_are_machine_readable:
    catalog.entries.every((entry) =>
      typeof entry.catalog_entry_id === "string" &&
      entry.catalog_entry_id.startsWith("local-v0-source-catalog-entry:") &&
      typeof entry.description === "string" &&
      entry.description.length > 0 &&
      typeof entry.content_shape_ref === "string" &&
      entry.content_shape_ref.startsWith("local-v0-source-content/") &&
      entry.source_item_template.scope_id === entry.scope_id &&
      entry.source_item_template.source_ref === entry.source_ref &&
      entry.source_item_template.content_digest === entry.content_digest &&
      entry.source_item_template.provenance_ref === entry.provenance_ref &&
      entry.source_item_template.permission_ref === entry.permission_ref &&
      entry.source_item_template.audit_ref === entry.audit_ref
    ),
  selection_policy_is_bounded:
    catalog.selection_policy.request_scope_hints_allowed === true &&
    catalog.selection_policy.fallback_to_all_catalog_entries === true &&
    catalog.selection_policy.arbitrary_file_paths_allowed === false &&
    catalog.selection_policy.unknown_scope_grants_access === false,
  execution_posture_preserves_default_deny:
    catalog.execution_posture.contract_only === true &&
    catalog.execution_posture.local_only === true &&
    catalog.execution_posture.deterministic === true &&
    catalog.execution_posture.allowlisted_source_catalog === true &&
    catalog.execution_posture.arbitrary_file_read_allowed_now === false &&
    catalog.execution_posture.user_selected_path_read_allowed_now === false &&
    catalog.execution_posture.directory_traversal_allowed_now === false &&
    catalog.execution_posture.network_access_allowed_now === false &&
    catalog.execution_posture.provider_sdk_call_allowed_now === false &&
    catalog.execution_posture.concrete_persistence_read_allowed_now === false &&
    catalog.execution_posture.concrete_persistence_write_allowed_now === false &&
    catalog.execution_posture.real_model_call_allowed_now === false &&
    catalog.execution_posture.real_storage_write_allowed_now === false &&
    catalog.execution_posture.runtime_permission_granted === false &&
    catalog.execution_posture.actual_contour_execution_allowed_now === false,
  default_scope_selects_catalog:
    allSelectedItems.length === catalog.entries.length &&
    allSelectedItems.map((item) => item.scope_id).join("|") ===
      catalog.supported_scope_ids.join("|"),
  requested_scope_selects_one_catalog_entry:
    activeBoundaryItems.length === 1 &&
    activeBoundaryItems[0].scope_id === ACTIVE_BOUNDARY_CHAIN_SCOPE_ID &&
    activeBoundaryItems[0].source_ref ===
      "local://deterministic/context/active-boundary-chain",
  repo_work_context_scope_is_allowlisted_and_deterministic:
    repoWorkContextItems.length === 1 &&
    repoWorkContextItems[0].scope_id === REPO_WORK_CONTEXT_SCOPE_ID &&
    repoWorkContextItems[0].source_ref ===
      "local://deterministic/context/repo-work-context" &&
    repoWorkContextItems[0].source_kind === "local_fixture_context" &&
    repoWorkContextItems[0].content_digest ===
      "sha256:local-deterministic-repo-work-context-v1" &&
    repoWorkContextItems[0].content.live_repo_file_reads_allowed_now === false &&
    repoWorkContextItems[0].content.arbitrary_file_paths_allowed_now === false &&
    repoWorkContextItems[0].content.runtime_execution_allowed_now === false,
  unknown_scope_does_not_grant_new_access:
    unknownScopeItems.length === catalog.entries.length &&
    unknownScopeItems.map((item) => item.source_ref).join("|") ===
      allSelectedItems.map((item) => item.source_ref).join("|"),
  adapter_uses_catalog_source_items:
    adapterSourceItems.length === catalog.entries.length &&
    adapterSourceItems.map((item) => item.source_ref).join("|") ===
      catalog.entries.map((entry) => entry.source_ref).join("|") &&
    adapterSourceItems.map((item) => item.content_digest).join("|") ===
      catalog.entries.map((entry) => entry.content_digest).join("|"),
  adapter_remains_default_deny:
    adapterContracts.adapter_result.execution_posture.network_access_allowed_now === false &&
    adapterContracts.adapter_result.execution_posture.provider_sdk_call_allowed_now === false &&
    adapterContracts.adapter_result.execution_posture.concrete_persistence_read_allowed_now === false &&
    adapterContracts.adapter_result.execution_posture.concrete_persistence_write_allowed_now === false &&
    adapterContracts.adapter_result.execution_posture.real_model_call_allowed_now === false &&
    adapterContracts.adapter_result.execution_posture.real_storage_write_allowed_now === false &&
    adapterContracts.adapter_result.execution_posture.actual_contour_execution_allowed_now === false
};

const failed = Object.entries(assertions)
  .filter(([, passed]) => passed !== true)
  .map(([name]) => name);

const verification = {
  verification_result:
    failed.length === 0
      ? "local_v0_source_catalog_contracts_verified"
      : "local_v0_source_catalog_contracts_failed",
  catalog_id: catalog.catalog_id,
  catalog_version: catalog.catalog_version,
  supported_scope_ids: catalog.supported_scope_ids,
  entry_count: catalog.entry_count,
  selected_source_refs: activeBoundaryItems.map((item) => item.source_ref),
  arbitrary_file_read_allowed_now: catalog.execution_posture.arbitrary_file_read_allowed_now,
  user_selected_path_read_allowed_now:
    catalog.execution_posture.user_selected_path_read_allowed_now,
  runtime_permission_granted: catalog.execution_posture.runtime_permission_granted,
  actual_contour_execution_allowed_now:
    catalog.execution_posture.actual_contour_execution_allowed_now,
  failure_count: failed.length,
  failures: failed
};

console.log(JSON.stringify(verification, null, 2));

if (failed.length > 0) {
  process.exit(1);
}
