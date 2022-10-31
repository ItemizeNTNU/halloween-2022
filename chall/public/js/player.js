import Tile from "./tile.js";
export default class Player extends Tile {
	constructor(x, y, width, height, color) {
		super(x, y, width, height, color);
		this.sx = 16 * 4;
		this.lean = 0.5;
	}
	draw(ctx) {
		ctx.shadowBlur = 10;
		ctx.shadowColor = "black";
		super.draw(ctx);
	}
}
