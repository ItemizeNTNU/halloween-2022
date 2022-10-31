import Tile from "./tile.js";
export default class Location extends Tile {
	constructor(x, y, width, height, color) {
		super(x, y, width, height, color);
		this.sx = 16 * 0;
	}
}
