import Tile from "./tile.js";
import Player from "./player.js";
import Box from "./box.js";
import Location from "./location.js";
import { lerp } from "./utils.js";
import { smoke, energy } from "./particle.js";
import { MAP, WIDTH, HEIGHT, TILE_SIZE } from "./constants.js";

export default class Game {
	constructor(transition) {
		this.tiles = [];
		this.locations = [];
		this.particles = [];
		this.player = new Player(0, 0, TILE_SIZE, TILE_SIZE, "tomato", globalUser);
		this.loadLevel(MAP);
		this.scroll = { x: 0, y: 0 };
		this.transition = { element: transition, y: 200 };
		this.loadedLevel = MAP;
		this.moveCount = 0;
	}

	toggleTransition() {
		this.transition.y = -1400;
		this.transition.element.style.transform = `translate(-50%, ${this.transition.y}px)`;
	}

	reset() {
		this.loadLevel(this.loadedLevel);
	}

	loadLevel(level) {
		this.moveCount = 0;
		this.loadedLevel = level;
		const tiles = [];
		const locations = [];
		// Microban game map syntax
		for (let y = 0; y < level.length; y++) {
			for (let x = 0; x < level[y].length; x++) {
				const tile = level[y][x];
				if (tile === "@") {
					// Player
					this.player.spawn(x, y);
				} else if (tile === "#") {
					// Block
					tiles.push(new Tile(x, y, TILE_SIZE, TILE_SIZE, "black"));
				} else if (tile === ".") {
					// Open
					locations.push(new Location(x, y, TILE_SIZE, TILE_SIZE, "aqua"));
				} else if (tile === "*") {
					// Placed
					locations.push(new Location(x, y, TILE_SIZE, TILE_SIZE, "aqua"));
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
			smoke({
				x: this.player.x * TILE_SIZE + 20,
				y: this.player.y * TILE_SIZE + 35,
				size: 1,
				amount: 30,
				particleArr: this.particles,
			});
			this.player.x += px;
			this.player.y += py;
			this.moveCount++;
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
			smoke({
				x: box.x * TILE_SIZE + 20,
				y: box.y * TILE_SIZE + 35,
				size: 1,
				amount: 80,
				particleArr: this.particles,
			});
			box.x += px;
			box.y += py;
		}
		return canMove;
	}

	draw(ctx) {
		// Clear screen
		ctx.clearRect(0, 0, WIDTH, HEIGHT);

		// Camera scroll
		this.scroll.x = parseInt(
			lerp(this.scroll.x, WIDTH / 2 - this.player.x * TILE_SIZE, 0.05)
		);
		this.scroll.y = parseInt(
			lerp(this.scroll.y, HEIGHT / 2 - this.player.y * TILE_SIZE, 0.05)
		);
		ctx.translate(this.scroll.x, this.scroll.y);

		// Draw tiles
		let correct = 0;
		for (const location of this.locations) {
			location.draw(ctx);
		}

		// Draw move count
		ctx.font = "25px m6x11";
		ctx.fillStyle = "#e3d7ad";
		ctx.fillText(
			`${this.moveCount}`,
			this.player.x - this.scroll.x + 90,
			this.player.y - this.scroll.y + 28
		);

		// Draw particles
		for (let i = this.particles.length - 1; i >= 0; i--) {
			const particle = this.particles[i];
			particle.update();
			particle.draw(ctx);
			if (particle.lifeTime <= 0) this.particles.splice(i, 1);
		}
		for (const tile of this.tiles) {
			tile.draw(ctx);
			for (const location of this.locations) {
				if (tile.x === location.x && tile.y === location.y) {
					correct += 1;
					energy({
						x: tile.x * TILE_SIZE + 20,
						y: tile.y * TILE_SIZE + 20,
						size: 0.1,
						amount: 25,
						particleArr: this.particles,
					});
				}
			}
		}
		// Check win condition
		if (correct === this.locations.length) {
			console.log("WIN");
		}

		// Transition
		if (this.transition.y < 200) {
			this.transition.y += 20;
			this.transition.element.style.transform = `translate(-50%, ${this.transition.y}px)`;
		}
		this.player.draw(ctx, this.scroll);
		ctx.translate(-this.scroll.x, -this.scroll.y);
	}
}
