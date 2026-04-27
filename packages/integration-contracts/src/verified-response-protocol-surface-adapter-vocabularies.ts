export const VERIFIED_RESPONSE_PROTOCOL_SURFACE_ADAPTER_KINDS = [
  "mcp_api_adjacent_verified_response_adapter"
] as const;
export type VerifiedResponseProtocolSurfaceAdapterKind =
  (typeof VERIFIED_RESPONSE_PROTOCOL_SURFACE_ADAPTER_KINDS)[number];

export const VERIFIED_RESPONSE_PROTOCOL_SURFACE_ADAPTER_STATUSES = [
  "verified_response_adapter_shape_ready",
  "verified_response_adapter_shape_denied"
] as const;
export type VerifiedResponseProtocolSurfaceAdapterStatus =
  (typeof VERIFIED_RESPONSE_PROTOCOL_SURFACE_ADAPTER_STATUSES)[number];

export const VERIFIED_RESPONSE_PROTOCOL_SURFACE_ADAPTER_BOUNDARIES = [
  "protocol_adjacent_adapter_shape_only"
] as const;
export type VerifiedResponseProtocolSurfaceAdapterBoundary =
  (typeof VERIFIED_RESPONSE_PROTOCOL_SURFACE_ADAPTER_BOUNDARIES)[number];
