const express = require('express');
const axios = require('axios');

let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;

const public_users = express.Router();

const BASE_URL = "http://localhost:5000";


// Register a new user
public_users.post("/register", (req, res) => {

  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({
      message: "Username and password are required"
    });
  }

  if (isValid(username)) {
    return res.status(409).json({
      message: "User already exists"
    });
  }

  users.push({
    username: username,
    password: password
  });

  return res.status(201).json({
    message: "User successfully registered"
  });
});


// Internal endpoint used as the Axios data source
public_users.get("/books-data", (req, res) => {

  return res.status(200).json(books);

});


// Task: Get all books
// Uses Axios with async/await
public_users.get("/", async (req, res) => {

  try {

    const response = await axios.get(`${BASE_URL}/books-data`);

    return res.status(200).json(response.data);

  } catch (error) {

    return res.status(500).json({
      message: "Error fetching books"
    });

  }

});


// Task: Get book by ISBN
// Uses Axios Promise callback
public_users.get("/isbn/:isbn", (req, res) => {

  const isbn = req.params.isbn;

  axios.get(`${BASE_URL}/books-data`)
    .then((response) => {

      const book = response.data[isbn];

      if (!book) {
        return res.status(404).json({
          message: "Book not found"
        });
      }

      return res.status(200).json(book);

    })
    .catch((error) => {

      return res.status(500).json({
        message: "Error fetching book"
      });

    });

});


// Task: Get books by author
// Uses Axios with async/await
public_users.get("/author/:author", async (req, res) => {

  try {

    const response = await axios.get(`${BASE_URL}/books-data`);

    const author = req.params.author.toLowerCase();

    const result = Object.values(response.data).filter(
      book => book.author.toLowerCase() === author
    );

    if (result.length === 0) {
      return res.status(404).json({
        message: "No books found for this author"
      });
    }

    return res.status(200).json(result);

  } catch (error) {

    return res.status(500).json({
      message: "Error fetching books"
    });

  }

});


// Task: Get books by title
// Uses Axios with async/await
public_users.get("/title/:title", async (req, res) => {

  try {

    const response = await axios.get(`${BASE_URL}/books-data`);

    const title = req.params.title.toLowerCase();

    const result = Object.values(response.data).filter(
      book => book.title.toLowerCase() === title
    );

    if (result.length === 0) {
      return res.status(404).json({
        message: "No books found for this title"
      });
    }

    return res.status(200).json(result);

  } catch (error) {

    return res.status(500).json({
      message: "Error fetching books"
    });

  }

});


// Task: Get book review
public_users.get("/review/:isbn", (req, res) => {

  const isbn = req.params.isbn;

  if (!books[isbn]) {
    return res.status(404).json({
      message: "Book not found"
    });
  }

  return res.status(200).json(
    books[isbn].reviews
  );

});


module.exports.general = public_users;