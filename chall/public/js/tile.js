import { DEBUG } from "./constants.js";
export default class Tile {
	constructor(x, y, width, height, color) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.color = color;
		// Sprite
		this.loadSprite();
		this.sx = 16 * 1;
		this.sy = 0;
	}
	loadSprite() {
		// Check for existing sprite
		if (!Tile.sprite) {
			Tile.sprite = new Image();
			Tile.sprite.onload = () => {
				// Loaded image
				console.log(Tile.sprite.src);
			};
			Tile.sprite.src = "/images/tiles.png";
		}
	}
	draw(ctx) {
		if (DEBUG) {
			ctx.beginPath();
			ctx.strokeStyle = this.color;
			ctx.rect(
				this.x * this.width,
				this.y * this.height,
				this.width,
				this.height
			);
			ctx.stroke();
		}
		if (Tile.sprite.complete) {
			ctx.beginPath();
			ctx.drawImage(
				Tile.sprite,
				this.sx,
				this.sy,
				16, // sprite width
				16, // sprite height
				this.x * this.width,
				this.y * this.height,
				this.width,
				this.height
			);
			ctx.closePath();
		}
	}
}
