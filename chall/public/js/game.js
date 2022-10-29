import Tile from "./tile.js";
import Player from "./player.js";
import Box from "./box.js";
import { MAP, WIDTH, HEIGHT, TILE_SIZE } from "./constants.js";

export default class Game {
	constructor() {
		this.tiles = [];
		this.loadLevel(MAP);
	}
	loadLevel(level) {
		const tiles = [];
		for (let y = 0; y < level.length; y++) {
			for (let x = 0; x < level[y].length; x++) {
				const tile = level[y][x];
				if (tile === "@") {
					// Player
					this.player = new Player(x, y, TILE_SIZE, TILE_SIZE, "tomato");
				} else if (tile === "#") {
					// Block
					tiles.push(new Tile(x, y, TILE_SIZE, TILE_SIZE, "black"));
				} else if (tile === ".") {
					// Open
					tiles.push(new Tile(x, y, TILE_SIZE, TILE_SIZE, "aqua"));
				} else if (tile === "*") {
					// Placed
					tiles.push(new Tile(x, y, TILE_SIZE, TILE_SIZE, "darkblue"));
				} else if (tile === "$") {
					// Box
					tiles.push(new Box(x, y, TILE_SIZE, TILE_SIZE, "blue"));
				}
			}
		}
		this.tiles = tiles;
	}
	draw(ctx) {
		ctx.clearRect(0, 0, WIDTH, HEIGHT);
		for (const tile of this.tiles) {
			tile.draw(ctx);
		}
		this.player.draw(ctx);
	}
}
