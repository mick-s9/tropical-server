const express = require('express');
const multer = require('multer');
const bcrypt = require('bcrypt');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');


// Configure multer
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Client registration
router.post('/register/client', upload.single('profileImage'), async (req, res) => {
  console.log('Client registration data received:', req.body);

  try {
    const {
      email,
      password,
      firstName,
      lastName,
      id,
      dateOfBirth,
      address,
      phoneNumber,
      profileTitle,
      description
    } = req.body;
    const profileImage = req.file;

    // Validate required fields
    if (!email || !password || !firstName || !lastName || !id || !dateOfBirth || !address || !phoneNumber) {
      console.log('Missing required fields:', req.body);
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('User already exists:', email);
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = new User({
      email,
      password: hashedPassword, // Save the hashed password
      firstName,
      lastName,
      id,
      dateOfBirth,
      address,
      phoneNumber,
      profileImage: profileImage ? profileImage.buffer : null, // Assuming you store the image as a buffer
      profileTitle,
      description,
      accountType: 'client'
    });
    await user.save();

    console.log('Client registration successful:', user);

    res.status(201).json({ userId: user._id });
  } catch (error) {
    console.error("Error during client registration:", error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Freelancer registration
router.post('/register/freelancer', upload.single('profileImage'), async (req, res) => {
  console.log('Freelancer registration data received:', req.body);

  try {
    const {
      email,
      password,
      firstName,
      lastName,
      nif,
      dateOfBirth,
      address,
      phoneNumber,
      profileTitle,
      description,
      hourlyRate,
      categories,
      subcategories
    } = req.body;
    const profileImage = req.file;

    // Validate required fields
    if (!email || !password || !firstName || !lastName || !nif || !dateOfBirth || !address || !phoneNumber) {
      console.log('Missing required fields:', req.body);
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('User already exists:', email);
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = new User({
      email,
      password: hashedPassword, // Save the hashed password
      firstName,
      lastName,
      nif,
      dateOfBirth,
      address,
      phoneNumber,
      profileImage: profileImage ? profileImage.buffer : null, // Assuming you store the image as a buffer
      profileTitle,
      description,
      hourlyRate,
      categories,
      subcategories,
      accountType: 'freelancer'
    });
    await user.save();

    console.log('Freelancer registration successful:', user);

    res.status(201).json({ userId: user._id });
  } catch (error) {
    console.error("Error during freelancer registration:", error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    console.log('Login attempt:', { email, password });
  
    try {
      const user = await User.findOne({ email });
      if (!user) {
        console.log('User not found:', email);
        return res.status(400).json({ success: false, message: 'Invalid email or password' });
      }
  
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        console.log('Invalid password for user:', email);
        return res.status(400).json({ success: false, message: 'Invalid email or password' });
      }
  
      // Ensure that JWT_SECRET is loaded
      const secret = process.env.JWT_SECRET;
      if (!secret) {
        console.error('JWT_SECRET is not defined');
        return res.status(500).json({ success: false, message: 'Server error' });
      }
  
      const token = jwt.sign({ userId: user._id }, secret, { expiresIn: '1h' });
      console.log('Login successful for user:', email);
  
      res.json({ success: true, message: 'Login successful', token });
    } catch (error) {
      console.error('Error during login:', error);
      res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
  });

module.exports = router;
