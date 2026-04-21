export const OPERATIONAL_CONTOURS = [
  "read_path",
  "pack_loop",
  "write_path",
  "handoff"
] as const;

export type OperationalContour = (typeof OPERATIONAL_CONTOURS)[number];
