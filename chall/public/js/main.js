import Game from "./game.js";

const ctx = canvas.getContext("2d");
const game = new Game();
window.game = game;
const keyDownHandler = (event) => {
	if (event.key === "ArrowLeft" || event.key === "a") {
		game.player.move(-1, 0);
	} else if (event.key === "ArrowUp" || event.key === "w") {
		game.player.move(0, -1);
	} else if (event.key === "ArrowRight" || event.key === "d") {
		game.player.move(1, 0);
	} else if (event.key === "ArrowDown" || event.key === "s") {
		game.player.move(0, 1);
	}
};
document.addEventListener("keydown", keyDownHandler, false);
const draw = () => {
	game.draw(ctx);
	requestAnimationFrame(draw);
};
requestAnimationFrame(draw);
