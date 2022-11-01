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
const db = new Database("db.sqlite3");
db.exec(`PRAGMA foreign_keys = ON;`);
db.exec(`DROP TABLE IF EXISTS scores;`);
db.exec(`DROP TABLE IF EXISTS users;`);
db.exec(`CREATE TABLE IF NOT EXISTS users(
	id PRIMARY KEY,  
	name NOT NULL,
	pumpkin INTEGER NOT NULL
);`);
db.exec(`INSERT INTO users (id, name, pumpkin) VALUES (
	':)', 'Admin', 1337
)`);
db.exec(`CREATE TABLE IF NOT EXISTS scores(
	user_id NOT NULL,  
	level INTEGER NOT NULL,
	moves INTEGER NOT NULL,
	FOREIGN KEY (user_id) REFERENCES users (id) 
);`);
db.exec(`INSERT INTO scores (user_id, level, moves) VALUES (
	':)', 1, 15
)`);
db.exec(`INSERT INTO scores (user_id, level, moves) VALUES (
	':)', 2, 300
)`);
db.exec(`INSERT INTO scores (user_id, level, moves) VALUES (
	':)', 3, 0
)`);

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
	const query = `SELECT id FROM users WHERE id=?;`;
	try {
		const user = db.prepare(query).get(auth.id);
		if (user) return user;
	} catch (error) {
		return null;
	}
	return null;
};
const movesToStars = (level, moves) => {
	const starMapping = {
		1: [10, 20],
		2: [10, 20],
		3: [10, 20],
		4: [10, 20],
		5: [10, 20],
		6: [10, 20],
		7: [10, 20],
		8: [10, 20],
		9: [10, 20],
		10: [10, 20],
		11: [10, 20],
		12: [10, 20],
		13: [10, 20],
	};
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
			'${id}', '${name}', 0
		)`);
		res.cookie("auth", generateToken(id));
	}
	//return res.render("index");
	return res.render("game");
});

app.get("/game", (req, res) => {
	const user = parseAuth(req, res);
	if (!user) res.redirect("/");
	return res.render("game", { user: user });
});

app.get("/api/levels", (req, res) => {
	const user = parseAuth(req, res);
	if (!user) res.status(401).send("Unauthorized");
	user.id = ":)";
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
		return res.status(500).send("Could not retrieve levels");
	}
});
app.get("/api/levels/:level", (req, res) => {
	const { level } = req.params;
	const user = parseAuth(req, res);
	if (!user) res.status(401).send("Unauthorized");
	console.log(level);
	return res.json({ level: LEVELS[level] });
});
app.post("/api/levels/:level", (req, res) => {
	const { level } = req.params;
	const { moves } = req.body;
	const user = parseAuth(req, res);
	if (!user) res.status(401).send("Unauthorized");
	const query = `INSERT INTO scores (id, level, moves) VALUES (?,?,?);`;
	try {
		const stmt = db.prepare(query);
		stmt.run(user.id, level, moves);
	} catch (error) {
		return res.status(500).send("Level clear submission failed");
	}
	console.log(level, moves);
	return res.status(200).send("Level clear submitted");
});

app.get("/api/scoreboard", (req, res) => {
	const user = parseAuth(req, res);
	if (!user) res.status(401).send("Unauthorized");
	const query =
		"SELECT id, name, pumpkin, level, moves FROM users INNER JOIN scores ON users.id = scores.user_id;";
	try {
		const users = db.prepare(query).all();
		const userIds = [...new Set(users.map((user) => user.id))];
		return res.json({
			scoreboard: userIds.map((userId) => {
				const user = { levels: 0, stars: 0 };
				const userScores = users.filter((user) => user.id === userId);
				for (const userScore of userScores) {
					user.levels += 1;
					user.stars += movesToStars(userScore.level, userScore.moves)[0];
				}
				return { name: userScores[0].name, ...user };
			}),
		});
	} catch (error) {
		console.log(error);
		return res.status(500).send("Could not retrieve scoreboard");
	}
});

app.get("/api/flags", (req, res) => {
	const user = parseAuth(req, res);
	if (!user) res.status(401).send("Unauthorized");
	user.id = ":)";
	const query =
		"SELECT id, name, pumpkin, level, moves FROM users INNER JOIN scores ON users.id = scores.user_id WHERE users.id = ?;";
	const hiddenQuery = "SELECT * FROM scores WHERE user_id = ? AND level = 13;";
	const starsQuery = `SELECT level, moves FROM scores WHERE user_id=?;`;
	try {
		const userInfo = db.prepare(query).get(user.id);
		const hidden = db.prepare(hiddenQuery).get(user.id);
		let stars = db.prepare(starsQuery).all(user.id);
		console.log(stars);
		stars = stars
			.map((score) => {
				return movesToStars(score.level, score.moves)[0];
			})
			.reduce((a, b) => a + b);
		const flags = [
			{
				flag: "Welcoming gift",
				hint: "It's free",
				display: "Itemize{sp00ky_h4ll0w33n}",
			},
			{ flag: "Truth seeker", hint: "Seek the source", display: "???" },
			{ flag: "Normie", hint: "Clear 6 stages", display: "???" },
			{ flag: "All clear", hint: "Clear 12 stages", display: "???" },
			{ flag: "Shinobi", hint: "Clear the hidden level", display: "???" },
			{ flag: "Star warrior", hint: "Collect all stars", display: "???" },
			{
				flag: "I am the flag",
				hint: "Owner of an expensive skin",
				display: "???",
			},
			{ flag: "Deep pocket", hint: "Richer than admin", display: "???" },
		];
		console.log(userInfo, hidden, stars);
		if (userInfo.level >= 6) flags[2].display = "Itemize{th4t_w4s_34sy}";
		if (userInfo.level >= 12) flags[3].display = "Itemize{pr0_g4m3r}";
		if (hidden) flags[4].display = "Itemize{h4ck_n0_jutsu}";
		if (stars >= 39) flags[5].display = "Itemize{d3f3nd3rs_0f_th3_g4l4xy}";
		if (stars) flags[6].display = "Itemize{pr0ud_fl4g_0wn3r}";
		if (userInfo.pumpkin >= 13371337) flags[7].display = "Itemize{m0th3rl0d3}";
		return res.json({ flags: flags });
	} catch (error) {
		console.error(error);
		return res.status(500).send("Could not retrieve user flags");
	}
});

app.get("/api/skins", (req, res) => {
	const user = parseAuth(req, res);
	if (!user) res.status(401).send("Unauthorized");
	return res.json({ skins: [] });
});
app.post("/api/skins", (req, res) => {
	const { skinId } = req.body;
	const user = parseAuth(req, res);
	if (!user) res.status(401).send("Unauthorized");
	return res.json({ skins: [] });
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
