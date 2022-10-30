import Tile from "./tile.js";
import Player from "./player.js";
import Box from "./box.js";
import { MAP, WIDTH, HEIGHT, TILE_SIZE } from "./constants.js";

export default class Game {
	constructor() {
		this.tiles = [];
		this.locations = [];
		this.player = null;
		this.loadLevel(MAP);
	}

	loadLevel(level) {
		const tiles = [];
		const locations = [];
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
					locations.push(new Tile(x, y, TILE_SIZE, TILE_SIZE, "aqua"));
				} else if (tile === "*") {
					// Placed
					locations.push(new Tile(x, y, TILE_SIZE, TILE_SIZE, "aqua"));
					tiles.push(new Box(x, y, TILE_SIZE, TILE_SIZE, "blue"));
				} else if (tile === "$") {
					// Box
					tiles.push(new Box(x, y, TILE_SIZE, TILE_SIZE, "blue"));
				}
			}
		}
		this.tiles = tiles;
		this.locations = locations;
	}

	movePlayer(px, py) {
		// Collision
		let collision = false;
		let canMove = true;
		for (const tile of this.tiles) {
			if (tile.x === this.player.x + px && tile.y === this.player.y + py)
				collision = true;
			if (collision) {
				canMove = tile instanceof Box ? this.moveBox(tile, px, py) : false;
				break;
			}
		}
		// Move
		if (canMove) {
			this.player.x += px;
			this.player.y += py;
		}
	}

	moveBox(box, px, py) {
		let collision = false;
		let canMove = true;
		for (const tile of this.tiles) {
			if (tile.x === box.x + px && tile.y === box.y + py) collision = true;
			if (collision) {
				canMove = false;
				break;
			}
		}
		if (canMove) {
			box.x += px;
			box.y += py;
		}
		return canMove;
	}

	draw(ctx) {
		ctx.clearRect(0, 0, WIDTH, HEIGHT);
		let correct = 0;
		for (const location of this.locations) {
			location.draw(ctx);
		}
		for (const tile of this.tiles) {
			tile.draw(ctx);
			for (const location of this.locations) {
				if (tile.x === location.x && tile.y === location.y) correct += 1;
			}
		}
		if (correct === this.locations.length) {
			console.log("WIN");
		}
		this.player.draw(ctx);
	}
}
