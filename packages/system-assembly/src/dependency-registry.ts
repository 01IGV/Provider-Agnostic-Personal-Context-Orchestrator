import type { DependencyRegistrySnapshot, MissingDependency } from "./types.js";

export interface DependencyRegistry {
  register(token: string, dependency: unknown): void;
  resolve<TDependency>(token: string): TDependency | undefined;
  has(token: string): boolean;
  snapshot(required_tokens?: Array<{ token: string; required_by_module: string; code: MissingDependency["code"] }>): DependencyRegistrySnapshot;
}

export const createDependencyRegistry = (): DependencyRegistry => {
  const registry = new Map<string, unknown>();

  return {
    register(token: string, dependency: unknown): void {
      registry.set(token, dependency);
    },

    resolve<TDependency>(token: string): TDependency | undefined {
      return registry.get(token) as TDependency | undefined;
    },

    has(token: string): boolean {
      return registry.has(token);
    },

    snapshot(required_tokens?: Array<{ token: string; required_by_module: string; code: MissingDependency["code"] }>): DependencyRegistrySnapshot {
      const missingTokens: MissingDependency[] = (required_tokens ?? [])
        .filter((item) => !registry.has(item.token))
        .map((item) => ({
          code: item.code,
          dependency_token: item.token,
          required_by_module: item.required_by_module
        }));

      return {
        registered_tokens: [...registry.keys()],
        missing_tokens: missingTokens
      };
    }
  };
};
