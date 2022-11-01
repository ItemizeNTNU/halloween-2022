import Tile from "./tile.js";
export default class Player extends Tile {
	constructor(x, y, width, height, color) {
		super(x, y, width, height, color);
		this.sx = 16 * 4;
		this.flag = "Itemize{y0u_f0und_th3_truth}";
	}
	draw(ctx) {
		ctx.shadowBlur = 10;
		ctx.shadowColor = "black";
		super.draw(ctx);
		ctx.shadowBlur = 0;
	}
}
