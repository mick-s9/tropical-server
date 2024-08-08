const express = require('express');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const sgMail = require('@sendgrid/mail');
const axios = require('axios');
const twilio = require('twilio');

require('dotenv').config();

// Configure multer
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Configure SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Configure Twilio
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Memory storage for verification codes
const phoneVerificationCodes = new Map();
const emailVerificationCodes = new Map();

// Generate a random verification code
function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Function to send verification email
async function sendVerificationEmail(email, code) {
  const msg = {
    to: email,
    from: process.env.EMAIL_USER, // This should be a verified email on SendGrid
    subject: 'Email Verification Code',
    text: `Your verification code is: ${code}`,
  };

  try {
    await sgMail.send(msg);
    console.log('Verification email sent');
  } catch (error) {
    console.error('Error during sendMail:', error);
    if (error.response) {
      console.error('Error response:', error.response.body);
    }
  }
}

// Function to send verification SMS using Twilio
async function sendVerificationSMS(phoneNumber, code) {
  try {
    await twilioClient.messages.create({
      body: `Your verification code is: ${code}`,
      from: process.env.TWILIO_PHONE_NUMBER, // Your Twilio phone number
      to: phoneNumber
    });
    console.log('Verification SMS sent');
  } catch (error) {
    console.error('Error during sendSMS:', error);
  }
}

// Route to send phone verification code
router.post('/send-phone-code', (req, res) => {
  const { phone } = req.body;
  const code = generateVerificationCode();
  phoneVerificationCodes.set(phone, code);
  sendVerificationSMS(phone, code);
  res.json({ success: true });
});

// Route to verify phone code
router.post('/verify-phone-code', (req, res) => {
  const { phone, code } = req.body;
  const storedCode = phoneVerificationCodes.get(phone);
  if (storedCode && storedCode === code) {
    phoneVerificationCodes.delete(phone); // Remove the code after verification
    res.json({ success: true });
  } else {
    res.json({ success: false, message: 'Invalid verification code' });
  }
});

// Route to send email verification code
router.post('/send-email-code', (req, res) => {
  const { email } = req.body;
  const code = generateVerificationCode();
  emailVerificationCodes.set(email, code);
  sendVerificationEmail(email, code);
  res.json({ success: true });
});

// Route to verify email code
router.post('/verify-email-code', (req, res) => {
  const { email, code } = req.body;
  const storedCode = emailVerificationCodes.get(email);
  if (storedCode && storedCode === code) {
    emailVerificationCodes.delete(email); // Remove the code after verification
    res.json({ success: true });
  } else {
    res.json({ success: false, message: 'Invalid verification code' });
  }
});


async function sendPasswordResetEmail(email, token) {
  const msg = {
    to: email,
    from: process.env.EMAIL_USER, // This should be a verified email on SendGrid
    subject: 'Password Reset',
    text: `Click the link to reset your password: https://tropical-server-9435d6950866.herokuapp.com/reset-password?token=${token}`,
  };

  try {
    await sgMail.send(msg);
    console.log('Email sent');
  } catch (error) {
    console.error('Error during sendMail:', error);
    if (error.response) {
      console.error('Error response:', error.response.body);
    }
  }
}

// Route to request password reset
router.post('/request-password-reset', async (req, res) => {
  const { email } = req.body;
  console.log('email:', email);
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    await sendPasswordResetEmail(email, token);
    res.json({ message: 'Password reset email sent' });
  } catch (error) {
    console.error('Error during password reset request:', error);
    if (error.response) {
      console.error(error.response.body);
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Route to reset password
router.post('/reset-password', async (req, res) => {
  console.log('Reset password route hit'); // Log aggiunto
  const { token, newPassword } = req.body;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decoded:', decoded); // Log aggiunto
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(decoded.userId, { password: hashedPassword });
    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Error during password reset:', error);
    res.status(400).json({ message: 'Invalid or expired token' });
  }
});

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

router.get('/nif-validate', async (req, res) => {
  const { nif } = req.query;
  const apiKey = 'ee66b9d99bd0d60a471f9e0b7b30736c';
  
  console.log('Received request to validate NIF:', nif);

  try {
    const response = await axios.get(`https://nifvalidator-api.azurewebsites.net/Validate?nif=${nif}`); https://nifvalidator-api.azurewebsites.net/Validate?nif=325882244

    console.log('Response from NIF API:', response.data);
    
    
    if (response.data.isValid) {
      res.json({ valid: true, message: 'NIF esiste' });
    } else {
      res.json({ valid: false, message: 'NIF non valido' });
    }
  } catch (error) {
    console.error('Error during NIF validation:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
    res.status(500).json({ error: 'Errore durante la verifica del NIF' });
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
