require('dotenv').config(); // Ensure this is at the top
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const purchaseRoutes = require('./routes/purchases');

const app = express();

app.use(cors());
app.use(express.json());

// Log the MongoDB URI to verify it's loaded correctly
console.log('MONGODB_URI:', process.env.MONGODB_URI);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Use the auth routes
app.use('/auth', authRoutes);

// Use the project routes
app.use('/projects', projectRoutes);

// Use the purchase routes
app.use('/purchases', purchaseRoutes);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
