import Game from "./game.js";

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
