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


// Internal data endpoint used by Axios
// This is not one of the graded public endpoints.
public_users.get('/books-data', function (req, res) {
  return res.status(200).json(books);
});


// Get all books using Axios + async/await
public_users.get('/', async function (req, res) {

  try {

    const response = await axios.get(`${BASE_URL}/books-data`);

    return res.status(200).json(response.data);

  } catch (error) {

    return res.status(500).json({
      message: "Error fetching books"
    });

  }

});


// Get book details based on ISBN using Axios + Promise
public_users.get('/isbn/:isbn', function (req, res) {

  const isbn = req.params.isbn;

  axios.get(`${BASE_URL}/books-data`)

    .then(response => {

      const book = response.data[isbn];

      if (book) {
        return res.status(200).json(book);
      }

      return res.status(404).json({
        message: "Book not found"
      });

    })

    .catch(error => {

      return res.status(500).json({
        message: "Error fetching book"
      });

    });

});


// Get book details based on author using Axios + async/await
public_users.get('/author/:author', async function (req, res) {

  try {

    const response = await axios.get(`${BASE_URL}/books-data`);

    const author = req.params.author.toLowerCase();

    const result = Object.values(response.data).filter(book =>
      book.author.toLowerCase() === author
    );

    if (result.length > 0) {
      return res.status(200).json(result);
    }

    return res.status(404).json({
      message: "No books found for this author"
    });

  } catch (error) {

    return res.status(500).json({
      message: "Error fetching books"
    });

  }

});


// Get all books based on title using Axios + async/await
public_users.get('/title/:title', async function (req, res) {

  try {

    const response = await axios.get(`${BASE_URL}/books-data`);

    const title = req.params.title.toLowerCase();

    const result = Object.values(response.data).filter(book =>
      book.title.toLowerCase() === title
    );

    if (result.length > 0) {
      return res.status(200).json(result);
    }

    return res.status(404).json({
      message: "No books found for this title"
    });

  } catch (error) {

    return res.status(500).json({
      message: "Error fetching books"
    });

  }

});


// Get book review
public_users.get('/review/:isbn', function (req, res) {

  const isbn = req.params.isbn;

  if (books[isbn]) {

    return res.status(200).json(
      books[isbn].reviews
    );

  }

  return res.status(404).json({
    message: "Book not found"
  });

});


module.exports.general = public_users;