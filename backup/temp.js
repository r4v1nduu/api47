function initializeDB() {
    db.exec('PRAGMA foreign_keys = ON;', (error) => {
        if (error) {
            console.error("Pragma statement didn't execute.", error);
        } else {
            console.log("Foreign Key Enforcement is on.");
        }
    });
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT UNIQUE,
        password TEXT,
        role TEXT DEFAULT 'user'
    )`, (err) => {
        if (err) {
            console.error('Error creating users table:', err.message);
        } else {
            console.log('Users table created or already exists.');
            insertDemoUsers();
        }
    });
}

function insertDemoUsers() {
    const insertSql = `INSERT OR IGNORE INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`;
    const users = [
        { name: "Ravindu Kavishka", email: "ravindu47@proton.me", password: "RavinGG@02", role: "admin" },
        { name: "Ashan Vimodh", email: "avi2001@gmail.com", password: "Ashan@2001", role: "user" },
        { name: "Minsandha Pathirana", email: "mpathir02@gmail.com", password: "MinaAA@007", role: "user" }
    ];

    users.forEach(user => {
        db.run(insertSql, [user.name, user.email, user.password, user.role], function(err) {
            if (err) {
                console.error('Error inserting demo user:', err.message);
            } else {
                console.log(`Inserted demo user with ID ${this.lastID}`);
            }
        });
    });
}