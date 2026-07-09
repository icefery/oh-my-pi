import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import * as fs from "node:fs";
import * as path from "node:path";
import {
	resetSettingsForTest,
	Settings,
} from "@oh-my-pi/pi-coding-agent/config/settings";
import { TempDir } from "@oh-my-pi/pi-utils";
import { YAML } from "bun";
import { beginSettingsTest, restoreSettingsTestState, type SettingsTestState } from "./helpers/settings-test-state";

describe("config.yaml resolution", () => {
	let settingsState: SettingsTestState | undefined;
	let tempDir: TempDir;
	let agentDir: string;

	beforeEach(() => {
		settingsState = beginSettingsTest();
		tempDir = TempDir.createSync("@pi-config-yaml-");
		agentDir = tempDir.join("agent");
		fs.mkdirSync(agentDir, { recursive: true });
	});

	afterEach(async () => {
		restoreSettingsTestState(settingsState);
		settingsState = undefined;
		await Bun.sleep(0);
		await tempDir?.remove();
	});

	const writeConfig = async (name: string, data: Record<string, unknown>) => {
		await Bun.write(path.join(agentDir, name), YAML.stringify(data, null, 2));
	};

	it("reads from config.yaml when only config.yaml exists", async () => {
		await writeConfig("config.yaml", { autocompleteMaxVisible: 42 });
		const settings = await Settings.init({ agentDir, inMemory: false });
		expect(settings.get("autocompleteMaxVisible")).toBe(42);
		resetSettingsForTest();
	});

	it("reads from config.yml when only config.yml exists", async () => {
		await writeConfig("config.yml", { autocompleteMaxVisible: 15 });
		const settings = await Settings.init({ agentDir, inMemory: false });
		expect(settings.get("autocompleteMaxVisible")).toBe(15);
		resetSettingsForTest();
	});

	it("prefers config.yaml when both exist", async () => {
		await writeConfig("config.yaml", { autocompleteMaxVisible: 42 });
		await writeConfig("config.yml", { autocompleteMaxVisible: 15 });
		const settings = await Settings.init({ agentDir, inMemory: false });
		expect(settings.get("autocompleteMaxVisible")).toBe(42);
		resetSettingsForTest();
	});
});
