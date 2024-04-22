const sqlite3 = require('sqlite3').verbose();
const DB_PATH = 'database.db'; // Specify the path to your database file

const db = new sqlite3.Database(DB_PATH, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
        console.error("Error opening database: " + err.message);
    } else {
        console.log("Connected to the SQLite database.");
    }
});


const dbOperations = {
    insertUser: function (username, email, password, role, callback) {
        const sql = `INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)`;
        db.run(sql, [username, email, password, role], function (err) {
            callback(err, this.lastID);
        });
    },
    getUserById: function (id, callback) {
        db.get("SELECT * FROM users WHERE id = ?", [id], (err, row) => {
            callback(err, row);
        });
    },
    getUserByEmail: function (email, callback) {
        db.get("SELECT * FROM users WHERE email = ?", [email], (err, row) => {
            callback(err, row);
        });
    },
    getAllUsers: function (callback) {
        db.all("SELECT id, name, email FROM users", [], (err, rows) => {
            callback(err, rows);
        });
    },
    insertUser: function (name, email, password, role, callback) {
        const sql = "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)";
        db.run(sql, [name, email, password, role], function (err) {
            callback(err, this.lastID);
        });
    },
    updateUserEmail: function (id, email, callback) {
        db.run("UPDATE users SET email = ? WHERE id = ?", [email, id], (err) => {
            callback(err);
        });
    },
    deleteUser: function (id, callback) {
        db.run("DELETE FROM users WHERE id = ?", [id], (err) => {
            callback(err);
        });
    },
    close: function() {
        db.close((err) => {
            if (err) {
                console.error('Failed to close database connection:', err.message);
            } else {
                console.log('Database connection closed.');
            }
        });
    }
};

module.exports = dbOperations;
