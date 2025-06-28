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

// Get the book list available in the shop using async Promise
public_users.get('/', async (req, res) => {
  const getBooks = () => {
    return new Promise((resolve, reject) => {
      const keys = Object.keys(books);
      if (keys.length === 0) {
        reject({ status: 404, message: "No books available" });
      } else {
        resolve(books);
      }
    });
  };

  try {
    const allBooks = await getBooks();
    return res.status(200).send(JSON.stringify(allBooks, null, 4));
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    }
    return res.status(500).json({ message: "Unexpected error" });
  }
});

// Get book details based on ISBN using async Promise
public_users.get('/isbn/:isbn', async (req, res) => {
  const getBookByISBN = (isbn) => {
    return new Promise((resolve, reject) => {
      const book = books[isbn];
      if (book) {
        resolve(book);
      } else {
        reject({ status: 404, message: "Book not found" });
      }
    });
  };

  try {
    const book = await getBookByISBN(req.params.isbn);
    return res.status(200).json(book);
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    }
    return res.status(500).json({ message: "Unexpected error" });
  }
});

// Get book details based on author using async Promise
public_users.get('/author/:author', async (req, res) => {
  const getBooksByAuthor = (author) => {
    return new Promise((resolve, reject) => {
      const matches = Object.values(books).filter(
        book => book.author.toLowerCase() === author.toLowerCase()
      );
      if (matches.length > 0) {
        resolve(matches);
      } else {
        reject({ status: 404, message: "No books found by this author" });
      }
    });
  };

  try {
    const matches = await getBooksByAuthor(req.params.author);
    return res.status(200).json(matches);
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    }
    return res.status(500).json({ message: "Unexpected error" });
  }
});

// Get all books based on title using async Promise
public_users.get('/title/:title', async (req, res) => {
  const getBooksByTitle = (title) => {
    return new Promise((resolve, reject) => {
      const matches = Object.values(books).filter(
        book => book.title.toLowerCase() === title.toLowerCase()
      );
      if (matches.length > 0) {
        resolve(matches);
      } else {
        reject({ status: 404, message: "No books found with this title" });
      }
    });
  };

  try {
    const matches = await getBooksByTitle(req.params.title);
    return res.status(200).json(matches);
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    }
    return res.status(500).json({ message: "Unexpected error" });
  }
});

// Get book review using async Promise
public_users.get('/review/:isbn', async (req, res) => {
  const getBookReviews = (isbn) => {
    return new Promise((resolve, reject) => {
      const reviews = books[isbn]?.reviews;
      if (reviews) {
        resolve(reviews);
      } else {
        reject({ status: 404, message: "No reviews found for this book" });
      }
    });
  };

  try {
    const reviews = await getBookReviews(req.params.isbn);
    return res.status(200).json(reviews);
  } catch (error) {
    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    }
    return res.status(500).json({ message: "Unexpected error" });
  }
});


module.exports.general = public_users;
