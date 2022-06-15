const express = require('express');
const router = express.Router();
// const router = require('express').Router()
const argon2 = require('argon2');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

// @route POST api/auth/register
// desc Register user
// @access Public
router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  // Simple validation
  // Nếu không có username và passwd thì về cái message báo lỗi
  if (!username || !password)
    return res
      .status(400)
      .json({ success: false, meesage: 'Missing username and/or password' });

  try {
    // Check for existing user
    const user = await User.findOne({ username }); // User.findOne({ usename: username })
    if (user)
      return res
        .status(400)
        .json({ success: false, meesage: 'Username already taken' });

    // All good
    const hashedPassword = await argon2.hash(password); // Mã hoá passwd
    const newUser = new User({ username, password: hashedPassword }); // Sau khi hash xong thì tạo ra 1 người dùng mới
    await newUser.save(); // Lưu lại để đưa vào cơ sở dữ liệu

    // Return Token
    const accessToken = jwt.sign(
      { userId: newUser._id },
      process.env.ACCESS_TOKEN_SECRET
    );

    res.json({
      success: true,
      meesage: 'User created successfully!',
      accessToken,
    });
  } catch (err) {}
});

module.exports = router;
