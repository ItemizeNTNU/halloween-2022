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

const KEY = "BoOOoooOOOoOOoOoOOooooOOoooOOooOOOoooooOOooooooOOoooooOOOOoooOo";
const db = new Database("db.sqlite3");
db.exec(`DROP TABLE IF EXISTS users;`);
db.exec(`CREATE TABLE IF NOT EXISTS users(
	id PRIMARY KEY,  
	name NOT NULL,
	levels INTEGER NOT NULL
);`);
db.exec(`INSERT INTO users (id, name, levels) VALUES (
	':)', 'Jonny', 10
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
		db.exec(`INSERT INTO users (id, name, levels) VALUES (
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

app.get("/logout", (req, res) => {
	parseAuth(req, res);
	res.cookie("auth", "", { expires: new Date(0) });
	return res.redirect("/");
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
	console.log("[*] Server listening at port %s\n", port);
});
