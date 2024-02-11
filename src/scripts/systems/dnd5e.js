export function init() {
	/* Уведомление выбора перевода */
	game.settings.register("ua-ua", "altTranslationSelected", {
		type: Boolean,
		default: false,
		scope: "world",
		restricted: true,
		onChange: (value) => {
			window.location.reload();
		}
	});

	/* Настройка Babele */
	game.settings.register("ua-ua", "compendiumTranslation", {
		name: "Переклад бібліотек",
		hint: "(Потрібен модуль Babele) Деякі бібліотеки системи D&D5e будуть перекладені.",
		type: Boolean,
		default: true,
		scope: "world",
		config: true,
		restricted: true,
		onChange: (value) => {
			window.location.reload();
		}
	});

	if (!game.settings.get("ua-ua", "altTranslationSelected")) {
		new Dialog({
			title: "Ласкаво просимо у нашу спільноту!",
			content: `<p>Заходьте у наш <a href="discord.gg/ewy44agyeV">Discord</a> та <a href="t.me/posidenkisdicemi">Telegram</a></p>`,
			buttons: {
				hw: {
					label: "Продовжити",
					callback: () => {
						game.settings.set("ua-ua", "altTranslation", false);
						game.settings.set("ua-ua", "altTranslationSelected", true);
					}
				}
			}
		}).render(true);
	}

	/* Регистрация Babele */
	if (typeof Babele !== "undefined") {
		Babele.get().register({
			module: "ua-ua",
			lang: "ua",
			dir: game.settings.get("ua-ua", "altTranslation")
				? "compendium/dnd5e-alt"
				: "compendium/dnd5e"
		});

		game.settings.set("babele", "showOriginalName", true);
	} else {
		if (game.settings.get("ua-ua", "compendiumTranslation")) {
			new Dialog({
				title: "Переклад бібліотек",
				content: `<p>Для перекладу бібліотек системи D&D5 потрібно активувати модуль <b>Babele</b>. Ви можете вимкнути переклад бібліотек у налаштуваннях модуля</p>`,
				buttons: {
					done: {
						label: "Добре"
					},
					never: {
						label: "Більше не показувати",
						callback: () => {
							game.settings.set("ua-ua", "compendiumTranslation", false);
						}
					}
				}
			}).render(true);
		}
	}

	/* Приключение HOUSE DIVIDED */
	if (game.modules.get("house-divided")?.active) {
		localizeHouseDivided();
	}

	/*  Настройка автоопределения анимаций AA  */
	Hooks.on("renderSettingsConfig", (app, html, data) => {
		if (!game.user.isGM) return;

		const lastMenuSetting = html
			.find(`input[name="ua-ua.compendiumTranslation"]`)
			.closest(".form-group");

		const updateAAButton = $(`
  <label>
    Перед перекладом анімацій потрібно увімкнути модулі Automated Animations, D&D5e Animations, JB2A Patreon
  </label>
  <div class="form-group">
      <button type="button">
          <i class="fas fa-cogs"></i>
          <label>Перекласти анімації</label>
      </button>
  </div>
  `);
		updateAAButton.find("button").click((e) => {
			e.preventDefault();
			updateAA();
		});

		lastMenuSetting.after(updateAAButton);
	});
}

async function updateAA() {
	const translatedSettings = await foundry.utils.fetchJsonWithTimeout(
		"/modules/ua-ua/i18n/modules/aa-autorec.json"
	);

	const currentSettings = AutomatedAnimations.AutorecManager.getAutorecEntries();

	const newSettings = {
		melee: mergeArrays(currentSettings.melee, translatedSettings.melee),
		range: mergeArrays(currentSettings.range, translatedSettings.range),
		ontoken: mergeArrays(currentSettings.ontoken, translatedSettings.ontoken),
		templatefx: mergeArrays(currentSettings.templatefx, translatedSettings.templatefx),
		aura: mergeArrays(currentSettings.aura, translatedSettings.aura),
		preset: mergeArrays(currentSettings.preset, translatedSettings.preset),
		aefx: mergeArrays(currentSettings.aefx, translatedSettings.aefx),
		version: "5"
	};

	AutomatedAnimations.AutorecManager.overwriteMenus(JSON.stringify(newSettings), {
		submitAll: true
	});
}

function localizeHouseDivided() {
	/* Поддержка кириллицы в стилях */
	const moduleCSS = document.createElement("link");
	moduleCSS.rel = "stylesheet";
	moduleCSS.href = `/modules/ua-ua/styles/house-divided.css`;
	document.head.appendChild(moduleCSS);

	/* Изменения в журнале */
	class HouseDividedRussianJournalSheet extends JournalSheet {
		constructor(doc, options) {
			super(doc, options);
			this.options.classes.push("house-divided", doc.getFlag("house-divided", "realm"));
			this.sidebarSections = doc.getFlag("house-divided", "sidebar-sections") ?? false;
		}

		async _renderInner(...args) {
			const html = await super._renderInner(...args);
			if (this.sidebarSections) this._insertSidebarSections(html);
			return html;
		}

		_insertSidebarSections(html) {
			const toc = html[0].querySelector(".pages-list .directory-list");
			if (!toc.children.length) return;
			const sections = { overview: false, quests: false, events: false };
			const divider = document.createElement("li");
			divider.classList.add("directory-section", "level1");
			for (const li of Array.from(toc.children)) {
				if (!sections.overview) {
					const d = divider.cloneNode();
					d.innerHTML = "<h2 class='section-header'>Обзор</h2>";
					li.before(d);
					sections.overview = true;
					continue;
				}

				const title = li.querySelector(".page-title").innerText;
				if (!sections.events && title.startsWith("Подія:")) {
					const d = divider.cloneNode();
					d.innerHTML = "<h2 class='section-header'>Події</h2>";
					li.before(d);
					sections.events = true;
					continue;
				}

				if (!sections.quests && title.startsWith("Завдання:")) {
					const d = divider.cloneNode();
					d.innerHTML = "<h2 class='section-header'>Завдання</h2>";
					li.before(d);
					sections.quests = true;
				}
			}
		}
	}

	/* Регистрация шаблона журнала */
	DocumentSheetConfig.registerSheet(
		JournalEntry,
		"house-divided",
		HouseDividedRussianJournalSheet,
		{
			types: ["base"],
			label: "Розділений будинок",
			makeDefault: false
		}
	);
}

function mergeArrays(array1, array2) {
	const mergedArray = array1.map((item1) => {
		const matchingItem = array2.find((item2) => item2.metaData.label === item1.metaData.label);
		if (matchingItem) {
			return { ...item1, ...matchingItem };
		}
		return item1;
	});

	return mergedArray;
}
