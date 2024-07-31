const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  accountType: { type: String, required: true }, // "freelancer" or "client"
  phoneNumber: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  address: { type: String, required: true },
  // Fields for freelancer
  firstName: { type: String },
  lastName: { type: String },
  nif: { type: String },
  citizenCard: { type: String },
  profileImage: { type: String },
  professionalTitle: { type: String },
  description: { type: String },
  hourlyRate: { type: Number },
  categories: { type: [String] },
  subcategories: { type: [[String]] }, // Array of arrays
  // Fields for client
  id: { type: String },
  profileTitle: { type: String },
  // Fields for tracking experience
  experienceLevel: { type: String, default: 'Beginner' }, // "Beginner", "Intermediate", etc.
  completedProjects: { type: Number, default: 0 },
});

module.exports = mongoose.model('User', UserSchema);
