import { DEBUG } from "./constants.js";
import { lerp, getRGBColor } from "./utils.js";
export default class Particle {
	constructor(
		x,
		y,
		width,
		height,
		color,
		velocity,
		acceleration,
		lifeTime,
		lifeTimeDrain,
		friction = 0.96
	) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.color = color;
		this.velocity = velocity;
		this.acceleration = acceleration;
		this.lifeTime = lifeTime;
		this.lifeTimeDrain = lifeTimeDrain;
		this.friction = friction;
	}
	update() {
		this.velocity[0] *= this.friction;
		this.x +=
			Math.cos(this.velocity[1]) * this.velocity[0] + this.acceleration[0];
		this.y +=
			Math.sin(this.velocity[1]) * this.velocity[0] + this.acceleration[1];
	}
	draw(ctx) {
		if (this.lifeTime !== 0) this.lifeTime -= this.lifeTimeDrain;
		this.width = lerp(this.width, 0, 0.005);
		ctx.beginPath();
		ctx.fillStyle = `rgba(${getRGBColor(this.color)}, ${this.lifeTime})`;
		ctx.arc(this.x, this.y, this.width, 0, Math.PI * 2);
		ctx.fill();
	}
}
export const smoke = ({ x, y, size, amount, particleArr }) => {
	for (let i = 1; i <= amount; i++) {
		const speed = Math.random() * 0.5;
		const angle = Math.random() * Math.PI * 2;
		particleArr.push(
			new Particle(
				x,
				y,
				Math.random() * size + 4.5,
				size,
				"#ffffff",
				[speed, angle],
				[Math.random() * 0.5, 0],
				0.01,
				0.0001
			)
		);
	}
};

export const energy = ({ x, y, size, amount, particleArr }) => {
	for (let i = 1; i <= amount; i++) {
		const speed = Math.random() * 1;
		const angle = Math.random() * Math.PI * 2;
		particleArr.push(
			new Particle(
				x,
				y,
				Math.random() * size + 2,
				size,
				"#ffefdf",
				[speed, angle],
				[0, 0],
				0.7,
				0.01,
				0.97
			)
		);
	}
};
