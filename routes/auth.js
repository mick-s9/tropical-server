const express = require('express');
const multer = require('multer');
const router = express.Router();
const User = require('../models/User'); // Assuming you have a User model set up

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
      nif,
      dateOfBirth,
      address,
      phoneNumber,
      profileTitle,
      description
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

    // Create new user
    const user = new User({
      email,
      password, // In a real app, make sure to hash the password
      firstName,
      lastName,
      nif,
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

    // Create new user
    const user = new User({
      email,
      password, // In a real app, make sure to hash the password
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

module.exports = router;
