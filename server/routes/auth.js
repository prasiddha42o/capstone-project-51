const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcrypt");

/**
 * REGISTER
 */
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    console.log("REGISTER BODY:", req.body);

    // 1. Validate input
    if (!name || !email || !password) {
      return res.status(400).json({
        error: "Name, email, and password are required",
      });
    }

    // 2. Normalize values
    const nameClean = String(name).trim();
    const emailClean = String(email).trim().toLowerCase();

    // 3. Validate email format
    if (!emailClean.includes("@")) {
      return res.status(400).json({
        error: "Invalid email format",
      });
    }

    // 4. Check existing user
    const existing = db
      .prepare("SELECT id FROM users WHERE email = ?")
      .get(emailClean);

    if (existing) {
      return res.status(409).json({
        error: "User already exists",
      });
    }

    // 5. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 6. Insert into DB (IMPORTANT: correct columns)
    const result = db
      .prepare(
        "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)"
      )
      .run(nameClean, emailClean, hashedPassword);

    // 7. Response
    return res.status(201).json({
      success: true,
      user: {
        id: result.lastInsertRowid,
        name: nameClean,
        email: emailClean,
      },
    });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
});

/**
 * LOGIN
 */
router.post("/login", (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("LOGIN BODY:", req.body);

    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required",
      });
    }

    const emailClean = String(email).trim().toLowerCase();

    // find user
    const user = db
      .prepare("SELECT * FROM users WHERE email = ?")
      .get(emailClean);

    if (!user) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    // compare password
    const isMatch = bcrypt.compareSync(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    return res.json({
      success: true,
      user: {
        id: user.id,
        name: user.username,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
});

module.exports = router;