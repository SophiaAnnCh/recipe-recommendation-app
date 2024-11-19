const pool = require('../config/db');

const Recipe = {
  getTopRecipes: async () => {
    try {
      const [rows] = await pool.query(`
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
        GROUP BY 
            r.recipe_id, r.recipe_name, r.instructions, r.time_taken, r.rating, r.category_id, r.image_path, r.nutritional_value
        ORDER BY 
            r.rating DESC;
        `)        
      return rows;
    } catch (error) {
      throw error;
    }
  },

  // Search recipes by name
  searchRecipes: async (searchTerm) => {
    try {
      const [rows] = await pool.query('SELECT * FROM recipes WHERE recipe_name LIKE ? ORDER BY rating DESC', [`%${searchTerm}%`]);
      return rows;
    } catch (error) {
      throw error;
    }
  }
};



module.exports = Recipe;
