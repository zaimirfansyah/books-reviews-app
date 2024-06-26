const express = require('express');
const books = require('./booksdb.js');
const public_users = express.Router();

// Get all book
public_users.get('/', async (req, res) => {
    try {
        res.json(Object.values(books));
    } catch (error) {
        console.error('Error fetching all books:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async (req, res) => {
    const isbn = req.params.isbn;
    try {
        const book = Object.values(books).find(b => b.isbn === isbn);
        if (!book) {
            throw new Error('Book not found');
        }
        res.json(book);
    } catch (error) {
        console.error(`Error fetching book with ISBN ${isbn}:`, error.message);
        res.status(404).json({ message: 'Book not found' });
    }
});

// Get book details based on author
public_users.get('/author/:author', async (req, res) => {
    const author = req.params.author;
    try {
        const booksByAuthor = Object.values(books).filter(b => b.author === author);
        if (booksByAuthor.length === 0) {
            throw new Error(`No books found by author ${author}`);
        }
        res.json(booksByAuthor);
    } catch (error) {
        console.error(`Error fetching books by author ${author}:`, error.message);
        res.status(404).json({ message: `No books found by author ${author}` });
    }
});

// Get all books based on title
public_users.get('/title/:title', async (req, res) => {
    const title = req.params.title;
    try {
        const booksByTitle = Object.values(books).filter(b => b.title === title);
        if (booksByTitle.length === 0) {
            throw new Error(`No books found with title ${title}`);
        }
        res.json(booksByTitle);
    } catch (error) {
        console.error(`Error fetching books with title ${title}:`, error.message);
        res.status(404).json({ message: `No books found with title ${title}` });
    }
});

// Get book review
public_users.get('/review/:isbn', async (req, res) => {
    const isbn = req.params.isbn;
    try {
        const book = books[isbn];
        if (!book || !book.reviews) {
            throw new Error('Book not found or no reviews available');
        }
        res.json(book.reviews);
    } catch (error) {
        console.error(`Error fetching reviews for book with ISBN ${isbn}:`, error.message);
        res.status(404).json({ message: 'Book not found or no reviews available' });
    }
});

module.exports = public_users;
