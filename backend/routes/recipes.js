const express = require('express'); // Import express
const router = express.Router();
const pool = require('../config/db'); // Import your database connection

router.post('/add-recipe', async (req, res) => {
    const { recipe_name, instructions, time_taken, rating = 0, category_name, image_path, nutritional_value, ingredients, authorId } = req.body;

    try {
        const connection = await pool.getConnection();

        // Check if the category already exists
        const [categoryResult] = await connection.query('SELECT category_id FROM categories WHERE category_name = ?', [category_name]);
        let category_id;
        if (categoryResult.length > 0) {
            category_id = categoryResult[0].category_id;
        } else {
            const [newCategoryResult] = await connection.query('INSERT INTO categories (category_name) VALUES (?)', [category_name]);
            category_id = newCategoryResult.insertId;
        }

        // Insert the new recipe
        const [result] = await connection.query(
            'INSERT INTO recipes (recipe_name, instructions, time_taken, rating, category_id, image_path, nutritional_value, author_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [recipe_name, instructions, time_taken, rating, category_id, image_path, nutritional_value, authorId]
        );

        const recipe_id = result.insertId;

        // Process ingredients
        for (const ingredient of ingredients) {
            const { name, quantity } = ingredient;

            // Check if the ingredient already exists
            const [ingredientResult] = await connection.query('SELECT ingredient_id FROM ingredients WHERE ingredient_name = ?', [name]);
            let ingredient_id;
            if (ingredientResult.length > 0) {
                ingredient_id = ingredientResult[0].ingredient_id;
            } else {
                // Insert new ingredient
                const [newIngredientResult] = await connection.query('INSERT INTO ingredients (ingredient_name) VALUES (?)', [name]);
                ingredient_id = newIngredientResult.insertId;
            }

            // Insert into recipe_ingredients
            await connection.query(
                'INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity) VALUES (?, ?, ?)',
                [recipe_id, ingredient_id, quantity]
            );
        }

        connection.release();
        res.status(201).json({ message: 'Recipe added', recipe_id });
    } catch (error) {
        console.error('Error adding recipe:', error);
        res.status(500).json({ error: 'Failed to add recipe' });
    }
});

module.exports = router; 
