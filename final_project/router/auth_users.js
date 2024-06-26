const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const books = require('./booksdb.js');

const regd_users = express.Router();

// Dummy users array (in-memory storage)
let users = [];

// Function to check if username is valid
const isValid = (username) => {
    return users.some(user => user.username === username);
};

// Function to check if username and password match
const authenticatedUser = (username, password) => {
    const user = users.find(user => user.username === username);
    if (!user) return false;
    return bcrypt.compareSync(password, user.password);
};

// Function to generate JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, 'jwt_secret', { expiresIn: '1h' });
};

// Register new user
regd_users.post('/register', async (req, res) => {
    const { username, password } = req.body;
    if (isValid(username)) {
        return res.status(400).json({ message: 'Username already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = { id: users.length + 1, username, password: hashedPassword };
    users.push(user);
    res.status(201).json({ message: 'User registered successfully' });
});

// Login user
regd_users.post('/login', async (req, res) => {
    const { username, password } = req.body;
    if (!isValid(username)) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }
    if (!authenticatedUser(username, password)) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = generateToken(users.find(user => user.username === username).id);
    res.json({ token });
});

// Add a new review for a book (logged in users only)
regd_users.post('/auth/add-review/:isbn', (req, res) => {
    const { isbn } = req.params;
    const { review } = req.body;
    const userId = req.userId; // Get userId from middleware

    // Check if the book exists
    if (!books[isbn]) {
        return res.status(404).json({ message: 'Book not found' });
    }

    // Add the review to the book
    if (!books[isbn].reviews) {
        books[isbn].reviews = {};
    }
    books[isbn].reviews[userId] = review;

    res.status(201).json({ message: 'Review added successfully' });
});

// Modify a book review (logged in users can modify only their own reviews)
regd_users.put('/auth/modify-review/:isbn', (req, res) => {
    const { isbn } = req.params;
    const { review } = req.body;
    const userId = req.userId; // Get userId from middleware

    // Check if the review exists for the given user ID
    if (!books[isbn].reviews || !books[isbn].reviews[userId]) {
        return res.status(404).json({ message: 'Review not found' });
    }

    // Update the review
    books[isbn].reviews[userId] = review;

    res.json({ message: 'Review modified successfully' });
});

// Delete a book review (logged in users can delete only their own reviews)
regd_users.delete('/auth/delete-review/:isbn', (req, res) => {
    const { isbn } = req.params;
    const userId = req.userId; // Get userId from middleware

    // Check if the review exists for the given user ID
    if (!books[isbn].reviews || !books[isbn].reviews[userId]) {
        return res.status(404).json({ message: 'Review not found' });
    }

    // Delete the review
    delete books[isbn].reviews[userId];

    res.json({ message: 'Review deleted successfully' });
});

module.exports = {
    authenticated: regd_users,
    isValid,
    users,
    authenticatedUser,
    generateToken,
};
