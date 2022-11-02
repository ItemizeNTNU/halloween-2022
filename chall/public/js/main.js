import Game from "./game.js";
import { fetchAsync } from "./utils.js";

const interact = { button: true, timeout: 1300, window: "menu-btn" };
window.interact = interact;
const skinSelection = { selected: 0 };
const bgAudio = new Audio("/music/background.mp3");
bgAudio.loop = true;
bgAudio.volume = 0.1;
bgAudio.play();
const buttonAudio = new Audio("/music/button.wav");
buttonAudio.volume = 0.1;
const playButtonAudio = () => {
	buttonAudio.pause();
	buttonAudio.currentTime = 0;
	buttonAudio.play();
};

// Game window
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;
const game = new Game(transition);
window.game = game;

// Navigation
const navigationButtons = document.querySelectorAll(".navigation > button");
for (const button of navigationButtons) {
	button.addEventListener("click", () => {
		if (!interact.button) return;
		game.toggleTransition();
		if (button.className.startsWith("reset")) {
			game.reset();
		} else changeWindow(button.className);
		interact.button = false;
		setTimeout(() => (interact.button = true), interact.timeout);
		playButtonAudio();
	});
}

// Scoreboard window
const loadScoreboard = async () => {
	const scores = await fetchAsync("/api/scoreboard");
	const scoreboardDiv = document.querySelector("#scoreboard > div");
	scoreboardDiv.innerHTML = `
			<div class="scoreboard-row">
				<span>Name</span>
				<span>Pumpkin</span>
				<span>Cleared</span>
				<span>Stars</span>
			</div>
		`;
	for (const score of scores.scoreboard) {
		scoreboardDiv.innerHTML += `
			<div class="scoreboard-row">
				<span>${score.name}</span>
				<span>${score.pumpkin}</span>
				<span>${score.levels}</span>
				<span>${score.stars}</span>
			</div>
		`;
	}
};

// Flag window
const loadFlags = async () => {
	const flags = await fetchAsync("/api/flags");
	const flagsDiv = document.querySelector("#flag > div");
	flagsDiv.innerHTML = `
			<div class="flag-row">
				<span>Name</span>
				<span>Hint</span>
				<span>Flag</span>
			</div>
		`;
	for (const flag of flags.flags) {
		flagsDiv.innerHTML += `
			<div class="flag-row">
				<span>${flag.flag}</span>
				<span>${flag.hint}</span>
				<span>${flag.display}</span>
			</div>
		`;
	}
};

// Shop window
const skinButtons = document.querySelectorAll(".skin-btn");
const resetSkinButtons = () => {
	for (const skinButton of skinButtons) {
		skinButton.className = `skin-btn`;
	}
};
const loadSkins = async () => {
	const skins = await fetchAsync("/api/skins");
	game.player.loadUserData({
		...skins,
		skin1: skins.skinStatus[0],
		skin2: skins.skinStatus[1],
		skin3: skins.skinStatus[2],
		skin4: skins.skinStatus[3],
	});
	shoppumpkin.innerHTML = `${skins.pumpkin}🎃`;
	for (let i = 0; i < skinButtons.length; i++) {
		const btn = skinButtons[i];
		btn.className = `skin-btn`;
		if (skins.skinStatus[i] === 0)
			btn.style = `--skin-cost: "${skins.skins[i + 1].cost}🎃"`;
		else btn.style = `--skin-cost: ""`;

		if (skins.enabled_skin - 1 === i) {
			btn.className = `skin-btn selected`;
			btn.style = `--skin-cost: "^"`;
			skinSelection.selected = skins.enabled_skin;
		}
		btn.addEventListener("click", function () {
			resetSkinButtons();
			this.className = `skin-btn selected`;
			skinSelection.selected = i + 1;
			if (skins.skinStatus[i] === 0) {
				buyskin.style.display = "block";
				useskin.style.display = "none";
			} else {
				buyskin.style.display = "none";
				useskin.style.display = "block";
			}
			playButtonAudio();
		});
	}
};
buyskin.addEventListener("click", async () => {
	const skins = await fetchAsync("/api/skins", "POST", {
		skinId: skinSelection.selected,
	});
	skinSelection.selected = skins.enabled_skin;
	await loadSkins();
	playButtonAudio();
});
useskin.addEventListener("click", async () => {
	if (game.player.enabled_skin != skinSelection.selected) {
		const skins = await fetchAsync("/api/skins", "PUT", {
			skinId: skinSelection.selected,
		});
		game.player.enabled_skin = skins.enabled_skin;
		await loadSkins();
		playButtonAudio();
	}
});

// Levels window
const levelButtons = document.querySelectorAll("button.level-btn");
const loadScores = async () => {
	const scores = await fetchAsync("/api/levels");
	for (const score of scores.levels) {
		levelButtons[score.level - 1].className = `level-btn ${score.stars}`;
	}
	levelButtons[12].classList.add("disabled");
};
const changeWindow = async (btn) => {
	// Hide all window
	const windows = document.querySelectorAll(".window");
	for (const window of windows) {
		window.style.opacity = 0;
		window.style.pointerEvents = "none";
	}
	canvas.style.opacity = 0;
	// Show specific window
	let window;
	interact.window = btn;
	if (btn === "menu-btn") {
		window = document.querySelector("#levels");
		await loadScores();
	} else if (btn === "shop-btn") {
		window = document.querySelector("#shop");
		await loadSkins();
	} else if (btn === "scoreboard-btn") {
		window = document.querySelector("#scoreboard");
		await loadScoreboard();
	} else if (btn === "flag-btn") {
		window = document.querySelector("#flag");
		await loadFlags();
	} else {
		if (btn === "levels-btn") canvas.style.opacity = 1;
		navigationRight.style.display = "none";
		return;
	}
	window.style.opacity = 1;
	window.style.pointerEvents = "all";
	setTimeout(() => {
		navigationRight.style.display = "flex";
		reset.style.display = "none";
	}, 800);
};
for (let i = 0; i < levelButtons.length; i++) {
	const button = levelButtons[i];
	button.addEventListener("click", async () => {
		if (i === 12) return;
		if (!interact.button) return;
		const data = await fetchAsync(`/api/levels/${i + 1}`);
		setTimeout(() => {
			reset.style.display = "block";
			changeWindow("levels-btn");
		}, 800);
		game.loadLevel(data.level, i + 1);
		game.toggleTransition();
		interact.button = false;
		setTimeout(() => (interact.button = true), interact.timeout);
		if (bgAudio.paused) bgAudio.play();
		playButtonAudio();
	});
}

// Game loop
const keyDownHandler = (event) => {
	if (interact.window !== "levels-btn") return;
	if (event.key === "ArrowLeft" || event.key === "a" || event.key === "h") {
		game.movePlayer(-1, 0);
	} else if (
		event.key === "ArrowUp" ||
		event.key === "w" ||
		event.key === "k"
	) {
		game.movePlayer(0, -1);
	} else if (
		event.key === "ArrowRight" ||
		event.key === "d" ||
		event.key === "l"
	) {
		game.movePlayer(1, 0);
	} else if (
		event.key === "ArrowDown" ||
		event.key === "s" ||
		event.key === "j"
	) {
		game.movePlayer(0, 1);
	} else if (event.key === "r") {
		if (!interact.button) return;
		game.toggleTransition();
		game.reset();
		interact.button = false;
		setTimeout(() => (interact.button = true), interact.timeout);
	}
};
document.addEventListener("keydown", keyDownHandler, false);

const draw = () => {
	game.draw(ctx);
	requestAnimationFrame(draw);
};
requestAnimationFrame(draw);
changeWindow("menu-btn");
game.changeWindow = changeWindow;
reset.style.display = "none";
await loadScores();
