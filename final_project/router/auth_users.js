const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// Check if username is valid
const isValid = (username)=>{ //returns boolean
  // Username should be alphanumeric and at least 3 characters long
  const regex = /^[a-zA-Z0-9_]{3,9}$/;
  return regex.test(username);
}

// Check if password is valid
const isPasswordValid = (password) => {
  // Minimum 8 characters, at least one uppercase, one lowercase, one number, and one special character
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[^\s]{8,}$/;
  return regex.test(password);
};


const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const { username, password } = req.body;
  // Check if username and password are provided
  if (!username || !password) {
    return res.status(400).json({message: "Username and password are required"});
  }
  // Check if user exists and password is valid
  if (!isValid(username) || !isPasswordValid(password)) {
    return res.status(401).json({message: "Invalid username or password"});
  }
  // Generate an access token
  const accessToken = jwt.sign({ username }, 'bull', { expiresIn: '1h' });
  // Store the token in session
  req.session.authorization = { username, accessToken };
  return res.status(200).json({message: "User logged in successfully", accessToken});
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const { review } = req.body;

  // Ensure a review is provided
  if (!review) {
    return res.status(400).json({ message: "Review is required" });
  }

  // Check if the book exists
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Initialize reviews object if not already present
  if (!books[isbn].reviews) {
    books[isbn].reviews = {};
  }

  const username = req.session.authorization?.username;

  // Safety check: ensure username is available from session
  if (!username) {
    return res.status(401).json({ message: "Unauthorized: No user session found" });
  }

  const isUpdate = Boolean(books[isbn].reviews[username]);
  books[isbn].reviews[username] = review;

  return res.status(200).json({
    message: isUpdate ? "Review updated successfully" : "Review added successfully",
    book: books[isbn]
  });
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization?.username;
  // Ensure the user is logged in
  if (!username) {
    return res.status(401).json({ message: "Unauthorized: No user session found" });
  }
  // Check if the book exists
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }
  // Check if the user has a review for this book
  if (!books[isbn].reviews || !books[isbn].reviews[username]) {
    return res.status(404).json({ message: "Review not found for this book" });
  }
  // Delete the review
  delete books[isbn].reviews[username];
  return res.status(200).json({ message: "Review deleted successfully", book: books[isbn] });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.isPasswordValid = isPasswordValid;
module.exports.authenticatedUser = authenticatedUser;
module.exports.users = users;
