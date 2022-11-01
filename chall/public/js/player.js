import Tile from "./tile.js";
import { DEBUG } from "./constants.js";
export default class Player extends Tile {
	constructor(x, y, width, height, color) {
		super(x, y, width, height, color);
		this.flag = "Itemize{y0u_f0und_th3_truth}";
		this.loadUserData();
		this.loadSprite();
	}
	loadUserData(data = window.globalUser) {
		this.enabled_skin = data.enabled_skin;
		this.sx = 16 * (data.enabled_skin - 1);
		this.skins = { 1: data.skin1, 2: data.skin2, 3: data.skin3, 4: data.skin4 };
	}
	spawn(x, y) {
		this.x = x;
		this.y = y;
	}
	loadSprite() {
		// Check for existing sprite
		if (!Player.sprite) {
			Player.sprite = new Image();
			Player.sprite.onload = () => {
				// Loaded image
				console.log(Player.sprite.src);
			};
			Player.sprite.src = "/images/skins.png";
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
		ctx.shadowBlur = 10;
		ctx.shadowColor = "black";
		if (Player.sprite.complete) {
			ctx.beginPath();
			ctx.drawImage(
				Player.sprite,
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
		ctx.shadowBlur = 0;
	}
}
