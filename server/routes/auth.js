const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');

const router = express.Router();
const client = new OAuth2Client("YOUR_GOOGLE_CLIENT_ID"); // Replace with your real client ID

// -------------------- REGISTER --------------------
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// -------------------- LOGIN --------------------
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) throw new Error("User not found");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error("Invalid credentials");

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, user: { username: user.username, email: user.email } });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// -------------------- GOOGLE LOGIN --------------------
router.post('/google-login', async (req, res) => {
  const { token } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: "YOUR_GOOGLE_CLIENT_ID", // Replace with actual client ID
    });

    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    let user = await User.findOne({ email });
    if (!user) {
      user = new User({
        username: name,
        email: email,
        profilePic: picture,
        password: '', // Google users may not have a password
      });
      await user.save();
    }

    const jwtToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({
      token: jwtToken,
      user: {
        username: user.username,
        email: user.email,
        profilePic: user.profilePic
      }
    });

  } catch (err) {
    console.error("Google login error:", err);
    res.status(401).json({ error: "Invalid Google token" });
  }
});

module.exports = router;



// const express = require('express');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const User = require('../models/User');
// const router = express.Router();

// // Register
// router.post('/register', async (req, res) => {
//   try {
//     const { username, email, password } = req.body;
//     const user = new User({ username, email, password });
//     await user.save();
//     res.status(201).json({ message: "User registered successfully" });
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// });

// // Login
// router.post('/login', async (req, res) => {
//   try {
//     const { username, password } = req.body;
//     const user = await User.findOne({ username });
//     if (!user) throw new Error("User not found");

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) throw new Error("Invalid credentials");

//     const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
//     res.json({ token, user: { username: user.username, email: user.email } });
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// });

// module.exports = router;
