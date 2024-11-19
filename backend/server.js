// backend/server.js
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const addRecipe = require('./routes/recipes');
const MealPlan = require('./routes/meal_plan');
const Review = require('./routes/reviews.js');
const Profile = require('./routes/user.js');
require('dotenv').config();
const db = require('./config/db'); // Ensure this points to your database connection setup

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', authRoutes);
app.use('/api', addRecipe);
app.use('/api', MealPlan);
app.use('/api', Review);
app.use('/api', Profile);

// Function to test database connection
async function testDbConnection() {
  try {
    const connection = await db.getConnection();
    console.log('Successfully connected to the database');
    connection.release();
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  testDbConnection(); // Test the database connection on startup
});
