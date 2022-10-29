import Tile from "./tile.js";
export default class Player extends Tile {
	constructor(x, y, width, height, color) {
		super(x, y, width, height, color);
	}
	setPos(x, y) {
		this.x = x;
		this.y = y;
	}
	move(x, y) {
		this.x += x;
		this.y += y;
	}
}
