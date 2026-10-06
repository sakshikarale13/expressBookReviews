const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');

const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use(
  "/customer",
  session({
    secret: "fingerprint_customer",
    resave: true,
    saveUninitialized: true
  })
);

// Authentication mechanism
app.use("/customer/auth/*", function auth(req, res, next) {

  const authHeader = req.headers.authorization;

  // Check whether Authorization header exists
  if (!authHeader) {
    return res.status(401).json({
      message: "Authentication required"
    });
  }

  // Expected format: Bearer TOKEN
  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      message: "Invalid authorization header"
    });
  }

  try {
    // Verify JWT token
    const decoded = jwt.verify(
      token,
      "fingerprint_customer"
    );

    // Store decoded user information
    req.user = decoded;

    // Continue to the requested route
    next();

  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token"
    });
  }
});

const PORT = 5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT, () => console.log("Server is running"));