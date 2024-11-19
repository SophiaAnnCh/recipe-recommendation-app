const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// GET user details
router.get('/user/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
    const [results] = await pool.execute('SELECT * FROM users WHERE id = ?', [userId]);

    if (results.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json(results[0]); // Assuming user exists, return their data
  } catch (err) {
    console.error('Error fetching user details:', err);
    return res.status(500).json({ error: 'Failed to fetch user details' });
  }
});

// PUT update user details
router.put('/user/:userId', async (req, res) => {
  const userId = req.params.userId;
  const { username, password, role } = req.body;

  try {
    const [results] = await pool.execute(`
      UPDATE users 
      SET username = ?, password = ?, role = ? 
      WHERE id = ?
    `, [username, password, role, userId]);

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Fetch the updated user details
    const [updatedUser] = await pool.execute('SELECT * FROM users WHERE id = ?', [userId]);

    return res.status(200).json(updatedUser[0]);
  } catch (err) {
    console.error('Error updating user details:', err);
    return res.status(500).json({ error: 'Failed to update user details' });
  }
});

// DELETE user account
router.delete('/user/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
    const [results] = await pool.execute('DELETE FROM users WHERE id = ?', [userId]);

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json({ message: 'User account deleted successfully' });
  } catch (err) {
    console.error('Error deleting user account:', err);
    return res.status(500).json({ error: 'Failed to delete user account' });
  }
});

// GET recipes by user (for authors)
router.get('/recipes/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
    const [results] = await pool.execute(`
      SELECT 
        r.recipe_id,
        r.recipe_name,
        r.instructions,
        r.time_taken,
        r.rating,
        r.category_id,
        r.image_path,
        r.nutritional_value,
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'quantity', ri.quantity,
            'ingredient_name', i.ingredient_name
          )
        ) AS ingredients
      FROM 
        recipes r
      JOIN 
        recipe_ingredients ri ON r.recipe_id = ri.recipe_id
      JOIN 
        ingredients i ON ri.ingredient_id = i.ingredient_id
      WHERE 
        r.author_id = ?
      GROUP BY 
        r.recipe_id, r.recipe_name, r.instructions, r.time_taken, r.rating, r.category_id, r.image_path, r.nutritional_value
    `, [userId]);

    if (results.length === 0) {
      return res.status(404).json({ error: 'No recipes found for this author' });
    }

    return res.status(200).json(results);
  } catch (err) {
    console.error('Error fetching recipes:', err);
    return res.status(500).json({ error: 'Failed to fetch recipes' });
  }
});


// DELETE recipe by recipe ID
router.delete('/recipe/:recipeId', async (req, res) => {
  const recipeId = req.params.recipeId;

  try {
    const [results] = await pool.execute('DELETE FROM recipes WHERE recipe_id = ?', [recipeId]);

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    return res.status(200).json({ message: 'Recipe deleted successfully' });
  } catch (err) {
    console.error('Error deleting recipe:', err);
    return res.status(500).json({ error: 'Failed to delete recipe' });
  }
});

// GET reviews by user (for readers)
router.get('/reviews/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
    const [results] = await pool.execute(`
      SELECT r.review_id, r.comment, r.rating, r.timestamp, recipes.recipe_name
      FROM review r
      JOIN recipe_review rr ON r.review_id = rr.review_id
      JOIN recipes ON rr.recipe_id = recipes.recipe_id
      WHERE r.user_id = ?
      ORDER BY r.timestamp DESC
    `, [userId]);

    return res.status(200).json(results);
  } catch (err) {
    console.error('Error fetching reviews:', err);
    return res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// DELETE review by review ID
router.delete('/review/:reviewId', async (req, res) => {
  const reviewId = req.params.reviewId;

  try {
    const [results] = await pool.execute('DELETE FROM review WHERE review_id = ?', [reviewId]);

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Review not found' });
    }

    return res.status(200).json({ message: 'Review deleted successfully' });
  } catch (err) {
    console.error('Error deleting review:', err);
    return res.status(500).json({ error: 'Failed to delete review' });
  }
});



module.exports = router;
