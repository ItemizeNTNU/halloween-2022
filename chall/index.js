import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import Database from "better-sqlite3";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";
import {
	uniqueNamesGenerator,
	adjectives,
	colors,
	animals,
} from "unique-names-generator";
import LEVELS from "./map.js";

const KEY = "BoOOoooOOOoOOoOoOOooooOOoooOOooOOOoooooOOooooooOOoooooOOOOoooOo";
const DEBUG = Boolean(process.env.DEBUG);
console.log("Debug mode:", DEBUG);
const db = new Database("db.sqlite3");
db.exec(`PRAGMA foreign_keys = ON;`);
if (DEBUG) db.exec(`DROP TABLE IF EXISTS scores;`);
if (DEBUG) db.exec(`DROP TABLE IF EXISTS users;`);
db.exec(`CREATE TABLE IF NOT EXISTS users(
	id PRIMARY KEY,  
	name NOT NULL,
	pumpkin INTEGER NOT NULL,
	enabled_skin INTEGER DEFAULT 1,
	skin1 INTEGER DEFAULT 1,
	skin2 INTEGER DEFAULT 0,
	skin3 INTEGER DEFAULT 0,
	skin4 INTEGER DEFAULT 0
);`);
db.exec(`CREATE TABLE IF NOT EXISTS scores(
	user_id NOT NULL,  
	level INTEGER NOT NULL,
	moves INTEGER NOT NULL,
	FOREIGN KEY (user_id) REFERENCES users (id) 
);`);
const query = `SELECT id, pumpkin, enabled_skin, skin1, skin2, skin3, skin4 FROM users WHERE id = ':)';`;
try {
	const user = db.prepare(query).get();
	if (!user) {
		db.exec(
			`INSERT INTO users (id, name, pumpkin) VALUES (':)', 'Admin', 666)`
		);
		const insert = db.prepare(
			"INSERT INTO scores (user_id, level, moves) VALUES (':)', @level, @moves)"
		);
		const insertMany = db.transaction((scores) => {
			for (const score of scores) insert.run(score);
		});
		insertMany([
			{ level: 1, moves: 1 },
			{ level: 2, moves: 1 },
			{ level: 3, moves: 1 },
			{ level: 4, moves: 1 },
			{ level: 5, moves: 1 },
			{ level: 6, moves: 1 },
			{ level: 7, moves: 1 },
			{ level: 8, moves: 1 },
			{ level: 9, moves: 1 },
			{ level: 10, moves: 1 },
			{ level: 11, moves: 1 },
			{ level: 12, moves: 1 },
			{ level: 13, moves: 1 },
		]);
	}
} catch (error) {
	console.log(error);
}

// Helper constants
const starMapping = {
	1: [33, 43],
	2: [16, 26],
	3: [41, 51],
	4: [23, 33],
	5: [27, 37],
	6: [107, 117],
	7: [38, 48],
	8: [115, 125],
	9: [30, 40],
	10: [91, 101],
	11: [10, 20],
	12: [100, 110],
	13: [282, 292],
	1337: [0, 0],
};
const skins = {
	1: { skinOffset: 0, cost: 50 },
	2: { skinOffset: 1, cost: 100 },
	3: { skinOffset: 2, cost: 100 },
	4: { skinOffset: 3, cost: 150 },
};
// Helper functions
const generateToken = (id) => {
	return jwt.sign({ id: id }, KEY);
};
const parseAuth = (req, _res) => {
	const { auth: token } = req.cookies;
	try {
		jwt.verify(token, KEY);
	} catch (error) {
		return null;
	}
	const auth = jwt.verify(token, KEY);
	const query = `SELECT id, pumpkin, enabled_skin, skin1, skin2, skin3, skin4 FROM users WHERE id=?;`;
	try {
		const user = db.prepare(query).get(auth.id);
		if (user) return user;
	} catch (error) {
		return null;
	}
	return null;
};
const movesToStars = (level, moves) => {
	const stars = starMapping[level];
	if (moves <= stars[0]) return [3, "three"];
	else if (moves <= stars[1]) return [2, "two"];
	else return [1, "one"];
};

const app = express();
app.use(cors());

// Configuring parsers middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

// View engine setup
app.set("view engine", "ejs");
app.use(express.static("public"));

// Begin routes
app.get("/", (req, res) => {
	const user = parseAuth(req, res);
	if (!user) {
		const id = uuidv4();
		const name = uniqueNamesGenerator({
			dictionaries: [adjectives, colors, animals],
			separator: "-",
			length: 2,
		});
		console.log(id, name);
		db.exec(`INSERT INTO users (id, name, pumpkin) VALUES (
			'${id}', '${name}', 13
		)`);
		res.cookie("auth", generateToken(id));
	}
	return res.render("index");
	//return res.render("game", { user: user });
});

app.get("/game", (req, res) => {
	const user = parseAuth(req, res);
	if (!user) res.redirect("/");
	return res.render("game", { user: user });
});

app.get("/api/levels", (req, res) => {
	const user = parseAuth(req, res);
	if (!user) res.status(401).json({ error: "Unauthorized" });
	const query = `SELECT level, moves FROM scores WHERE user_id=?;`;
	try {
		let scores = db.prepare(query).all(user.id);
		scores = scores.map((score) => {
			return { ...score, stars: movesToStars(score.level, score.moves)[1] };
		});
		console.log(scores);
		return res.json({
			levels: scores,
		});
	} catch (error) {
		return res.status(500).json({ error: "Could not retrieve levels" });
	}
});
app.get("/api/levels/:level", (req, res) => {
	const { level } = req.params;
	if (!Object.keys(starMapping).includes("" + level))
		return res.status(400).json({ error: "Value of level not found" });
	const user = parseAuth(req, res);
	if (!user) res.status(401).json({ error: "Unauthorized" });
	return res.json({ level: LEVELS[level] });
});
app.post("/api/levels/:level", (req, res) => {
	const { level } = req.params;
	const { moves } = req.body;
	const user = parseAuth(req, res);
	if (!user) res.status(401).json({ error: "Unauthorized" });
	if (isNaN(moves))
		return res.status(400).json({ error: "Value of moves is not a number" });
	if (!Object.keys(starMapping).includes("" + level))
		return res.status(400).json({ error: "Value of level not found" });
	// Check if level is cleared, insert if not
	const selectQuery = `SELECT * from scores WHERE user_id = ? AND level = ?;`;
	const insertQuery = `INSERT INTO scores (user_id, level, moves) VALUES (?,?,?);`;
	const updateQuery = `UPDATE scores SET moves = ? WHERE user_id = ? AND level = ?;`;
	const pumpkinQuery = `UPDATE users SET pumpkin = ? WHERE id = ?;`;
	try {
		const cleared = db.prepare(selectQuery).get(user.id, level);
		console.log(cleared, moves);
		if (!cleared) {
			db.prepare(insertQuery).run(user.id, level, moves);
		} else if (cleared.moves > moves) {
			db.prepare(updateQuery).run(moves, user.id, level);
		}
		db.prepare(pumpkinQuery).run(
			user.pumpkin + movesToStars(level, moves)[0],
			user.id
		);
	} catch (error) {
		console.log(error);
		return res.status(500).json({ error: "Level clear submission failed" });
	}
	console.log(level, moves);
	return res.status(200).json({ success: "Level clear submitted" });
});

app.get("/api/scoreboard", (req, res) => {
	const user = parseAuth(req, res);
	if (!user) res.status(401).json({ error: "Unauthorized" });
	const query =
		"SELECT id, name, pumpkin, level, moves FROM users INNER JOIN scores ON users.id = scores.user_id;";
	try {
		const users = db.prepare(query).all();
		const userIds = [...new Set(users.map((user) => user.id))];
		const data = userIds
			.map((userId) => {
				const user = { levels: 0, stars: 0 };
				const userScores = users.filter((user) => user.id === userId);
				for (const userScore of userScores) {
					user.levels += 1;
					user.stars += movesToStars(userScore.level, userScore.moves)[0];
				}
				return {
					name: userScores[0].name,
					...user,
					pumpkin: userScores[0].pumpkin,
				};
			})
			.sort((a, b) => b.stars - a.stars);
		console.log(data);
		return res.json({
			scoreboard: data,
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({ error: "Could not retrieve scoreboard" });
	}
});

app.get("/api/flags", (req, res) => {
	const user = parseAuth(req, res);
	if (!user) res.status(401).json({ error: "Unauthorized" });
	const query =
		"SELECT id, name, pumpkin, COUNT(scores.level) as level, moves, skin1, skin2, skin3, skin4 FROM users INNER JOIN scores ON users.id = scores.user_id WHERE users.id = ?;";
	const hiddenQuery = "SELECT * FROM scores WHERE user_id = ? AND level = 13;";
	const starsQuery = `SELECT level, moves FROM scores WHERE user_id=?;`;
	try {
		const userInfo = db.prepare(query).get(user.id);
		const hidden = db.prepare(hiddenQuery).get(user.id);
		let stars = db.prepare(starsQuery).all(user.id);
		console.log(stars);
		stars = stars.map((score) => {
			return movesToStars(score.level, score.moves)[0];
		});
		if (stars.length > 0) stars = stars.reduce((a, b) => a + b);
		else stars = 0;
		const flags = [
			{
				flag: "Welcoming gift",
				hint: "It's free",
				display: "Itemize{sp00ky_hall0w33n}",
			},
			{ flag: "Truth seeker", hint: "Seek the source", display: "?&nbsp;" },
			{ flag: "Gamer", hint: "Clear 6 stages", display: "???" },
			{ flag: "L337 gamer", hint: "Clear 12 stages", display: "???" },
			{ flag: "Shinobi", hint: "Clear the hidden stage", display: "???" },
			{ flag: "Star warrior", hint: "Collect all stars", display: "???" },
			{
				flag: "All about the fashion",
				hint: "Collect all skins",
				display: "???",
			},
			{ flag: "Deep pocket", hint: "Richer than admin", display: "???" },
			{ flag: "Easter egg", hint: "LvL. 1337", display: "?&nbsp;" },
		];
		console.log(user, userInfo, hidden, stars);
		if (userInfo) {
			if (userInfo.level >= 6) flags[2].display = "Itemize{that_was_3asy}";
			if (userInfo.level >= 12) flags[3].display = "Itemize{l337_gam3r}";
			if (userInfo.pumpkin > 666) flags[7].display = "Itemize{m0th3rl0d3}";
		}
		if (hidden) flags[4].display = "Itemize{hack_n0_jutsu}";
		if (stars >= 39) flags[5].display = "Itemize{d3f3nd3rs_0f_th3_galaxy}";
		if (
			user.skin1 !== 0 &&
			user.skin2 !== 0 &&
			user.skin3 !== 0 &&
			user.skin4 !== 0
		)
			flags[6].display = "Itemize{pr0ud_sk1n_c0ll3ct0r}";
		return res.json({ flags: flags });
	} catch (error) {
		console.error(error);
		return res.status(500).json({ error: "Could not retrieve user flags" });
	}
});

app.get("/api/skins", (req, res) => {
	const user = parseAuth(req, res);
	if (!user) res.status(401).json({ error: "Unauthorized" });
	return res.json({
		skins: skins,
		skinStatus: [user.skin1, user.skin2, user.skin3, user.skin4],
		enabled_skin: user.enabled_skin,
		pumpkin: user.pumpkin,
	});
});
app.post("/api/skins", (req, res) => {
	const { skinId } = req.body;
	const user = parseAuth(req, res);
	if (!user) res.status(401).json({ error: "Unauthorized" });
	if (!Object.keys(skins).includes("" + skinId))
		res.status(400).json({ error: "Value of skinId not found" });
	const skin = skins[skinId];
	console.log(skinId, skin, user);
	if (user.pumpkin >= skin.cost) {
		const skinQuery = `UPDATE users SET skin${skinId} = 1 WHERE id = ?;`;
		const pumpkinQuery = `UPDATE users SET pumpkin = ? WHERE id = ?;`;
		try {
			db.prepare(skinQuery).run(user.id);
			db.prepare(pumpkinQuery).run(user.pumpkin - skin.cost, user.id);
			user["skin" + skinId] = 1;
		} catch (error) {
			return res.status(500).json({ error: "Buy skin failed" });
		}
	} else {
		return res.status(400).json({ error: "Not enough pumpkin" });
	}
	return res.json({
		skins: skins,
		skinStatus: [user.skin1, user.skin2, user.skin3, user.skin4],
		enabled_skin: user.enabled_skin,
		pumpkin: user.pumpkin - skin.cost,
	});
});
app.put("/api/skins", (req, res) => {
	const { skinId } = req.body;
	const user = parseAuth(req, res);
	if (!user) res.status(401).json({ error: "Unauthorized" });
	if (!Object.keys(skins).includes("" + skinId))
		res.status(400).json({ error: "Value of skinId not found" });
	const skin = skins[skinId];
	const skinQuery = `UPDATE users SET enabled_skin = ? WHERE id = ?;`;
	try {
		db.prepare(skinQuery).run(skinId, user.id);
		user.enabled_skin = skinId;
	} catch (error) {
		return res.status(500).json({ error: "Buy skin failed" });
	}

	return res.json({
		skins: skins,
		skinStatus: [user.skin1, user.skin2, user.skin3, user.skin4],
		enabled_skin: user.enabled_skin,
		pumpkin: user.pumpkin - skin.cost,
	});
});

app.get("/logout", (req, res) => {
	parseAuth(req, res);
	res.cookie("auth", "", { expires: new Date(0) });
	return res.redirect("/");
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
	console.log("[*] Server listening at port %s\n", port);
});
