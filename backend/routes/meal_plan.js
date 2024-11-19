const express = require('express');
const router = express.Router();
const pool = require('../config/db.js'); // Ensure you are using the correct database connection

// Add recipe to meal plan
router.post('/meal-plan', async (req, res) => {
    const { recipe_id, user_id } = req.body;

    console.log('Received data:', req.body);

    try {
        const connection = await pool.getConnection();

        const [rows] = await connection.execute(
            'INSERT INTO meal_plan (recipe_id, user_id) VALUES (?, ?)', 
            [recipe_id, user_id]
        );

        // Insert ingredients into ingredient_list
        const [ingredients] = await connection.execute(
            'SELECT ingredient_id, quantity FROM recipe_ingredients WHERE recipe_id = ?',
            [recipe_id]
        );

        const ingredientInserts = ingredients.map(ingredient => (
            [user_id, ingredient.ingredient_id, ingredient.quantity, false, rows.insertId]
        ));

        await connection.query(
            'INSERT INTO ingredient_list (user_id, ingredient_id, quantity, bought, meal_plan_recipe_id) VALUES ?',
            [ingredientInserts]
        );

        connection.release();

        res.status(201).json({
            message: 'Recipe added to meal plan successfully',
            data: { recipe_id, user_id }
        });
    } catch (error) {
        console.error('Error adding recipe to meal plan:', error);
        res.status(500).json({
            message: 'Failed to add recipe to meal plan',
            error: error.message
        });
    }
});

// Fetch meal plan with aggregate count
router.get('/meal-plan-list', async (req, res) => {
    const userId = req.query.userId;

    const query = `
        SELECT r.recipe_id, r.recipe_name, COUNT(mp.recipe_id) AS count
        FROM meal_plan mp
        JOIN recipes r ON mp.recipe_id = r.recipe_id
        WHERE mp.user_id = ?
        GROUP BY r.recipe_id, r.recipe_name`;

    try {
        const connection = await pool.getConnection();
        const [results] = await connection.execute(query, [userId]);
        connection.release();

        res.json(results);
    } catch (error) {
        console.error('Error fetching meal plan:', error);
        return res.status(500).json({ error: 'Failed to fetch meal plan' });
    }
});

// Fetch shopping list with aggregate quantities
router.get('/shopping-list', async (req, res) => {
    const userId = req.query.userId;

    const query = `
        SELECT i.ingredient_id, i.ingredient_name, SUM(ri.quantity) AS total_quantity, il.bought
        FROM meal_plan mp
        JOIN recipe_ingredients ri ON mp.recipe_id = ri.recipe_id
        JOIN ingredients i ON ri.ingredient_id = i.ingredient_id
        JOIN ingredient_list il ON i.ingredient_id = il.ingredient_id AND il.user_id = mp.user_id
        WHERE mp.user_id = ?
        GROUP BY i.ingredient_id, i.ingredient_name, il.bought`;

    try {
        const connection = await pool.getConnection();
        const [results] = await connection.execute(query, [userId]);
        connection.release();

        res.json(results);
    } catch (error) {
        console.error('Error fetching shopping list:', error);
        return res.status(500).json({ error: 'Failed to fetch shopping list' });
    }
});

// Delete all recipes from the user's meal plan
router.delete('/meal-plan', async (req, res) => {
    const userId = req.query.userId;

    try {
        const connection = await pool.getConnection();
        await connection.execute('DELETE FROM meal_plan WHERE user_id = ?', [userId]);
        connection.release();

        res.status(200).json({ message: 'Meal plan deleted successfully' });
    } catch (error) {
        console.error('Error deleting meal plan:', error);
        res.status(500).json({ message: 'Failed to delete meal plan', error: error.message });
    }
});

// Remove a specific recipe from the user's meal plan
// Delete a single occurrence of a recipe from the meal plan
router.delete('/meal-plan/:recipeId', async (req, res) => {
    const { recipeId } = req.params;
    const { userId } = req.query; // Assuming userId is passed as a query parameter

    try {
        const connection = await pool.getConnection();

        // Delete only one occurrence of the recipe for the given user
        await connection.execute(
            'DELETE FROM meal_plan WHERE recipe_id = ? AND user_id = ? LIMIT 1', 
            [recipeId, userId]
        );

        connection.release();

        res.status(200).json({ message: 'Recipe removed successfully' });
    } catch (error) {
        console.error('Error removing recipe from meal plan:', error);
        res.status(500).json({ message: 'Failed to remove recipe from meal plan' });
    }
});


// Update the bought status of an ingredient
router.put('/ingredient-list/:ingredient_id', async (req, res) => {
    const userId = req.query.userId;
    const ingredientId = req.params.ingredient_id;

    try {
        const connection = await pool.getConnection();
        await connection.execute(
            'UPDATE ingredient_list SET bought = NOT bought WHERE user_id = ? AND ingredient_id = ?', 
            [userId, ingredientId]
        );
        connection.release();

        res.status(200).json({ message: 'Ingredient status updated successfully' });
    } catch (error) {
        console.error('Error updating ingredient status:', error);
        res.status(500).json({ message: 'Failed to update ingredient status', error: error.message });
    }
});

module.exports = router;
