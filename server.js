const express = require("express");
const bodyParser = require("body-parser");
const sqlite = require("sqlite3").verbose();

const app = express();
app.use(express.static("."));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

console.log("Server starting...");

// Insecure DB
let db = new sqlite.Database("./data.db");

db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS products (id INTEGER PRIMARY KEY, name TEXT)");
    db.run("DELETE FROM products");
    db.run("INSERT INTO products (name) VALUES ('Apple'), ('Banana'), ('Carrot'), ('ʟ③③ŧⓢ③ςяєŧ')");
});

// XSS
app.post("/comment", (req, res) => {
    res.send(`
        <h2>Your Comment:</h2>
        ${req.body.text} 
        <br><br><a href="/">Back</a>
    `);
});

// Broken Access Control
app.get("/admin", (req, res) => {
    res.send(`
        <h1>Admin Panel</h1>
        <p>Congrats, you bypassed frontend security 😈</p>
        <a href="/">Back</a>
    `);
});

// SQL Injection
app.get("/search", (req, res) => {
    const q = req.query.q;
    const sql = `SELECT * FROM products WHERE name LIKE '%${q}%'`;
    //SELECT * FROM Products WHERE name LIKE '% OR '1'='1%'
    db.all(sql, [], (err, rows) => {
        if (err) return res.send("SQL error: " + err);
        res.json(rows);
    });
});

app.listen(3000, () => console.log("Vulnerable app running → http://localhost:3000"));
