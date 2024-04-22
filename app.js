const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('./database');

const app = express();
const SECRET_KEY = 'dY3kIBPMyWaoEK3Yd7ES';
const PORT = process.env.PORT || 80;

app.use(express.json());

// Middleware to validate tokens
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401); // If no token, return Unauthorized

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) return res.sendStatus(403); // If token is not valid, return Forbidden
        req.user = decoded;
        next();
    });
};

// Basic route to check if the server is running
app.get('/', (req, res) => {
    res.send('Nothing Here!');
});


app.post('/register', async (req, res) => {
    const { username, password, email } = req.body;
    if (!(email && password && username)) {
        return res.status(400).send("All input is required");
    }

    db.insertUser(username, email, password, 'user', (err, userId) => {
        if (err) {
            return res.status(400).send("Error registering new user.");
        }
        res.send('Account created successfully!');
    });
});

// Login route to authenticate users and return JWT
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    db.getUserByEmail(email, (err, user) => {
        if (err) {
            res.status(500).send("Server error");
            return;
        }
        if (!user || user.password !== password) {
            res.status(401).send("Invalid email or password");
            return;
        }
        const token = jwt.sign({ id: user.id, role: user.role }, SECRET_KEY, { expiresIn: '1h' });
        res.json({ accessToken: token });
    });
});

// Endpoint to get all users - Should be restricted to admins
app.get('/users', authenticateToken, (req, res) => {
    if (req.user.role !== 'admin') {
        return res.sendStatus(403); // Return Forbidden if not admin
    }
    db.getAllUsers((err, users) => {
        if (err) {
            res.status(500).send('Error retrieving users');
            return;
        }
        res.json(users);
    });
});

// Vulnerable endpoint: Exposes sensitive user details including the session token
app.get('/users/:id/details', authenticateToken, (req, res) => {
    const id = req.params.id;
    db.getUserById(id, (err, user) => {
        if (err) {
            res.status(500).send('Error fetching user details');
            return;
        }
        if (!user) {
            res.status(404).send('User not found');
            return;
        }
        // Generates a new token for the user which could be used insecurely
        res.json({ user, token: jwt.sign({ id: user.id, role: user.role }, SECRET_KEY, { expiresIn: '1h' }) });
    });
});

// Endpoint for updating user email
app.post('/users/:id/updateEmail', authenticateToken, (req, res) => {
    const id = req.params.id;
    const { newEmail } = req.body;

    if (parseInt(req.user.id) !== parseInt(id)) {
        return res.sendStatus(403); // Return Forbidden if the ID does not match the token user ID
    }

    db.updateUserEmail(id, newEmail, err => {
        if (err) {
            res.status(500).send('Failed to update email');
            return;
        }
        res.send('Email updated successfully');
    });
});

// Endpoint for deleting a user
app.delete('/users/:id', authenticateToken, (req, res) => {
    const id = req.params.id;
    if (req.user.role !== 'admin') {
        return res.sendStatus(403); // Return Forbidden if not admin
    }

    db.deleteUser(id, err => {
        if (err) {
            res.status(500).send('Failed to delete user');
            return;
        }
        // Include a flag in the successful deletion response
        res.json({ message: 'User deleted successfully', flag: "THM{uQFWet3KkTxBIeV}" });
    });
});


// Starting the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Handling graceful shutdown
process.on('SIGINT', () => {
    db.close();
    console.log('Server and database connection closed');
    process.exit(0);
});
