import type { IsoDateTimeString } from "@orchestrator/core-foundation";
import type {
  LocalJsonFixtureRunnerCliBoundaryShape,
  LocalJsonFixtureRunnerCliBoundarySummaryShape
} from "@orchestrator/integration-contracts";
import type { LocalJsonFixtureRunnerProofSummaryShape } from "./local-json-fixture-runner-proof-types.js";
import type { LocalJsonRequestResponseRunnerShapeResult } from "./local-json-request-response-runner-shape-types.js";

export interface MinimalLocalJsonFixtureRunnerCliBoundaryInputShape {
  runner_shape?: LocalJsonRequestResponseRunnerShapeResult;
  fixture_runner_proof?: LocalJsonFixtureRunnerProofSummaryShape;
  input_fixture_path_ref?: string;
  output_fixture_path_ref?: string;
  now?: IsoDateTimeString;
}

export interface MinimalLocalJsonFixtureRunnerCliBoundaryResultShape {
  cli_boundary: LocalJsonFixtureRunnerCliBoundaryShape;
  cli_boundary_summary: LocalJsonFixtureRunnerCliBoundarySummaryShape;
  fixture_runner_proof: LocalJsonFixtureRunnerProofSummaryShape;
}

export interface MinimalLocalJsonFixtureRunnerCliBoundaryBuilder {
  create(
    input?: MinimalLocalJsonFixtureRunnerCliBoundaryInputShape
  ): MinimalLocalJsonFixtureRunnerCliBoundaryResultShape;
}
