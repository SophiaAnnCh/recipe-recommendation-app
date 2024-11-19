const express = require('express');
const User = require('../models/user');
const Recipe = require('../models/recipe');

const router = express.Router();

router.post('/register', async (req, res) => {
  const { username, email, password, role } = req.body;

  try {
    const existingUser = await User.findByEmail(email);

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user and get the result
    const result = await User.create(username, email, password, role);
    
    // Return the newly created user information
    res.status(201).json({ 
      message: 'User registered successfully!',
      userId: result.id,
      username: result.username,
      email: result.email,
      role: result.role,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findByEmail(email);
    console.log('User found:', user);

    if (!user) {
      return res.status(401).json({ message: 'User does not exist' });
    }

    if (user.password !== password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.json({ 
      message: 'Login successful',
      userId: user.id,
      user: {
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
});

// Route to search recipes
router.get('/top-recipes', async (req, res) => {
  try {
    const recipes = await Recipe.getTopRecipes();
    res.json(recipes);
  } catch (error) {
    console.error('Error fetching top recipes:', error);
    res.status(500).json({ message: 'Failed to fetch top recipes', error: error.message });
  }
});

// Route to search recipes
router.get('/search-recipes', async (req, res) => {
  const { q } = req.query;

  try {
    const recipes = await Recipe.searchRecipes(q);
    res.json(recipes);
  } catch (error) {
    console.error('Error searching recipes:', error);
    res.status(500).json({ message: 'Failed to search recipes' });
  }
});

module.exports = router;