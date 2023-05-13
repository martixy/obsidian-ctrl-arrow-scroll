// @ts-nocheck
import { App, Plugin, PluginSettingTab, Setting } from 'obsidian';

interface MyPluginSettings {
	lines: number;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	lines: 1
}

//From the default stylesheet. Themes can probably change this. It's not that big of an issue.
const LINE_HEIGHT = 1.5

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;

	async onload() {
		this.addSettingTab(new MySettingTab(this.app, this));

		await this.loadSettings();

		this.registerDomEvent(document, 'keydown', (ev: KeyboardEvent) => {
			let isFocused = document.querySelector('.cm-editor.cm-focused')
			if (!isFocused) return

			let fontSize = this.app.vault.getConfig("baseFontSize") //Not public API. But someone on the discord suggested.

			let editor = this.app.workspace.activeEditor?.editor
			if (!editor) return
			ev.preventDefault()
			switch (ev.code) {
				case 'ArrowUp':
					if (ev.ctrlKey) {
						//Don't need to bother calculating extreme values. The editor stops scrolling automatically at its limits.
						let scrollPos = editor.getScrollInfo().top - this.settings.lines * fontSize * LINE_HEIGHT
						editor.scrollTo(null, scrollPos)
					}
					break;
				case 'ArrowDown':
					if (ev.ctrlKey) {
						let scrollPos = editor.getScrollInfo().top + this.settings.lines * fontSize * LINE_HEIGHT
						editor.scrollTo(null, scrollPos)
					}
					break;
				default:
					break;
			}
		})
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}


class MySettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();
		//Class is recreated every time you visit the settings so it should always be correct.
		const currentLineHeight = this.app.vault.getConfig("baseFontSize") * LINE_HEIGHT

		new Setting(containerEl)
			.setName("Lines")
			.setDesc(`How many lines does each keypress scroll? It isn't entirely accurate (some lines are bigger) and themes might break this slightly, but eh ¯\\_(ツ)_/¯. The current base line height is ${currentLineHeight} pixels.`)
			.addText(text => text
				.setPlaceholder("Number of lines")
				.setValue(this.plugin.settings.lines.toString())
				.onChange(async (value) => {
					this.plugin.settings.lines = Number(value);
					await this.plugin.saveSettings();
				}));
	}
}
