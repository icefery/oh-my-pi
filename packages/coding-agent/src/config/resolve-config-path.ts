import * as fs from "node:fs";
import * as path from "node:path";

/**
 * Synchronous resolver for use in Settings constructor (cold path).
 * Prefers config.yaml if it exists; falls back to config.yml.
 * When neither exists, returns config.yml (backward-compatible default).
 */
export function resolveConfigPathSync(agentDir: string): string {
	const yamlPath = path.join(agentDir, "config.yaml");
	if (fs.existsSync(yamlPath)) return yamlPath;
	return path.join(agentDir, "config.yml");
}

/**
 * Async resolver for discovery contexts (builtin.ts, discover.ts).
 * Same preference: config.yaml > config.yml.
 */
export async function resolveConfigPath(agentDir: string): Promise<string> {
	const yamlPath = path.join(agentDir, "config.yaml");
	if (await Bun.file(yamlPath).exists()) return yamlPath;
	return path.join(agentDir, "config.yml");
}
