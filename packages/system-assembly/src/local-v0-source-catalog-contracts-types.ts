import type { ScopeId } from "@orchestrator/core-foundation";
import type {
  LocalDeterministicContextSourceItemShape,
  LocalDeterministicContextSourceKind
} from "@orchestrator/integration-contracts";

export interface LocalV0SourceCatalogEntryShape {
  catalog_entry_id: string;
  scope_id: ScopeId;
  source_ref: string;
  source_kind: LocalDeterministicContextSourceKind;
  deterministic_order: number;
  content_digest: string;
  provenance_ref: string;
  permission_ref: string;
  audit_ref: string;
  description: string;
  content_shape_ref: string;
  source_item_template: LocalDeterministicContextSourceItemShape;
}

export interface LocalV0SourceCatalogExecutionPostureShape {
  contract_only: true;
  local_only: true;
  deterministic: true;
  allowlisted_source_catalog: true;
  arbitrary_file_read_allowed_now: false;
  user_selected_path_read_allowed_now: false;
  directory_traversal_allowed_now: false;
  network_access_allowed_now: false;
  provider_sdk_call_allowed_now: false;
  concrete_persistence_read_allowed_now: false;
  concrete_persistence_write_allowed_now: false;
  real_model_call_allowed_now: false;
  real_storage_write_allowed_now: false;
  runtime_permission_granted: false;
  actual_contour_execution_allowed_now: false;
}

export interface LocalV0SourceCatalogShape {
  catalog_id: "local-v0-source-catalog";
  catalog_version: "local-v0-source-catalog/v1";
  catalog_boundary: "contract_only_allowlisted_local_source_catalog";
  intended_consumer: "ai_agent";
  supported_scope_ids: ScopeId[];
  entries: LocalV0SourceCatalogEntryShape[];
  entry_count: number;
  default_scope_id: ScopeId;
  selection_policy: {
    request_scope_hints_allowed: true;
    fallback_to_all_catalog_entries: true;
    arbitrary_file_paths_allowed: false;
    unknown_scope_grants_access: false;
  };
  execution_posture: LocalV0SourceCatalogExecutionPostureShape;
}
