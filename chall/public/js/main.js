import Game from "./game.js";
import { fetchAsync, loadLevels } from "./utils.js";

// Game window
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;
const game = new Game(transition);
window.game = game;

const keyDownHandler = (event) => {
	if (event.key === "ArrowLeft" || event.key === "a") {
		game.movePlayer(-1, 0);
	} else if (event.key === "ArrowUp" || event.key === "w") {
		game.movePlayer(0, -1);
	} else if (event.key === "ArrowRight" || event.key === "d") {
		game.movePlayer(1, 0);
	} else if (event.key === "ArrowDown" || event.key === "s") {
		game.movePlayer(0, 1);
	}
};
document.addEventListener("keydown", keyDownHandler, false);

const draw = () => {
	game.draw(ctx);
	requestAnimationFrame(draw);
};
requestAnimationFrame(draw);

// Scoreboard window

// Shop window

// Levels window
const levelButtons = document.querySelectorAll(
	"button.level-btn:not(.disabled)"
);
for (let i = 0; i < levelButtons.length; i++) {
	const button = levelButtons[i];
	button.addEventListener("click", async () => {
		const data = await fetchAsync(`/api/levels/${i + 1}`);
		console.log(i + 1, data);
		game.loadLevel(data.level);
		game.toggleTransition();
	});
}
console.log(123);
const scores = await loadLevels();
for (const score of scores.levels) {
	levelButtons[score.level - 1].className = `level-btn ${score.stars}`;
}
