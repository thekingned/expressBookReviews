const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let isPasswordValid = require("./auth_users.js").isPasswordValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  const { username, password } = req.body;
  // Check if username is valid 
  if (!isValid(username)) {
    return res.status(400).json({message: "Invalid username"});
  }

  // Check if password is valid
  if (!isPasswordValid(password)) {
    return res.status(400).json({message: "Invalid password"});
  }
  // Check if username and password are provided
  if (!username || !password) {
    return res.status(400).json({message: "Username and password are required"});
  }

  // Check if user already exists
  if (users.some(user => user.username === username)) {
    return res.status(400).json({message: "User already exists"});
  }
  // Add new user
  users.push({ username, password });
  return res.status(201).json({message: "User registered successfully"});
});

// Get the book list available in the shop
public_users.get('/', async (req, res) => {
  try {
    const keys = Object.keys(books);
    if (keys.length === 0) {
      return res.status(404).json({ message: "No books available" });
    }
    return res.status(200).send(JSON.stringify(books, null, 4));
  } catch (error) {
    return res.status(500).json({ message: "Unexpected error" });
  }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async (req, res) => {
  try {
    const book = books[req.params.isbn];
    if (book) {
      return res.status(200).json(book);
    } else {
      return res.status(404).json({ message: "Book not found" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Unexpected error" });
  }
});

// Get book details based on author
public_users.get('/author/:author', async (req, res) => {
  try {
    const author = req.params.author.toLowerCase();
    const matches = Object.values(books).filter(
      book => book.author.toLowerCase() === author
    );
    if (matches.length > 0) {
      return res.status(200).json(matches);
    } else {
      return res.status(404).json({ message: "No books found by this author" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Unexpected error" });
  }
});

// Get all books based on title
public_users.get('/title/:title', async (req, res) => {
  try {
    const title = req.params.title.toLowerCase();
    const matches = Object.values(books).filter(
      book => book.title.toLowerCase() === title
    );
    if (matches.length > 0) {
      return res.status(200).json(matches);
    } else {
      return res.status(404).json({ message: "No books found with this title" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Unexpected error" });
  }
});

// Get book review
public_users.get('/review/:isbn', async (req, res) => {
  try {
    const reviews = books[req.params.isbn]?.reviews;
    if (reviews) {
      return res.status(200).json(reviews);
    } else {
      return res.status(404).json({ message: "No reviews found for this book" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Unexpected error" });
  }
});


module.exports.general = public_users;
