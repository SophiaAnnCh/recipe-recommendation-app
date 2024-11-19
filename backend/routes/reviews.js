const express = require('express');
const router = express.Router();
const pool = require('../config/db'); // Assuming you're using a connection pool for mysql2

// POST route to submit a review
// POST route to submit a review
router.post('/reviews', async (req, res) => {
  const { user_id, recipe_id, rating, comment } = req.body;

  // Validate the input
  if (!user_id || !recipe_id || !rating || !comment) {
      return res.status(400).json({ message: 'All fields are required' });
  }

  if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
  }

  try {
      const connection = await pool.getConnection();

      // Insert the review into the review table
      const [reviewResult] = await connection.execute(
          'INSERT INTO review (user_id, comment, rating) VALUES (?, ?, ?)',
          [user_id, comment, rating]
      );

      const reviewId = reviewResult.insertId; // Get the newly created review ID

      // Now link the review to the recipe
      await connection.execute(
          'INSERT INTO recipe_review (review_id, recipe_id) VALUES (?, ?)',
          [reviewId, recipe_id]
      );

      // Calculate the new average rating
      const [ratings] = await connection.execute(
          'SELECT rating FROM review r JOIN recipe_review rr ON r.review_id = rr.review_id WHERE rr.recipe_id = ?',
          [recipe_id]
      );

      const totalRatings = ratings.length;
      const sumRatings = ratings.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = (totalRatings > 0) ? (sumRatings / totalRatings) : 0;

      // Update the average rating in the recipes table
      await connection.execute(
          'UPDATE recipes SET rating = ? WHERE recipe_id = ?',
          [averageRating, recipe_id]
      );

      connection.release();

      res.status(201).json({ message: 'Review submitted successfully' });
  } catch (error) {
      console.error('Error submitting review:', error);
      res.status(500).json({ message: 'Failed to submit review', error: error.message });
  }
});

// Fetch reviews for a specific recipe
// Fetch reviews for a specific recipe along with the average rating
router.get('/reviews', async (req, res) => {
    const { recipeId } = req.query; // Get recipeId from query parameters
  
    if (!recipeId) {
        return res.status(400).json({ message: 'Recipe ID is required' });
    }
  
    try {
        const connection = await pool.getConnection();

        const [reviews] = await connection.execute(`
            SELECT r.review_id, u.username, r.comment, r.rating, r.timestamp,
            (SELECT AVG(rating) FROM review r2 
             JOIN recipe_review rr2 ON r2.review_id = rr2.review_id 
             WHERE rr2.recipe_id = ?) AS average_rating
            FROM review r
            JOIN recipe_review rr ON r.review_id = rr.review_id
            JOIN users u ON r.user_id = u.id  -- Join with the users table to get the username
            WHERE rr.recipe_id = ?
            ORDER BY r.timestamp DESC
        `, [recipeId, recipeId]);
  
        connection.release();
  
        res.status(200).json(reviews);
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ message: 'Failed to fetch reviews', error: error.message });
    }
  });
module.exports = router;
