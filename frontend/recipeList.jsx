import React from 'react';
import './RecipeList.css';

const RecipeList = ({ recipes, onRecipeClick }) => {
    return (
        <div className="recipe-list">
            {recipes.length > 0 ? (
                recipes.map((recipe) => (
                    <div key={recipe.recipe_id} className="recipe-item" onClick={() => onRecipeClick(recipe)}>
                        <h3>{recipe.recipe_name}</h3>
                        <p>Rating: {recipe.rating}</p>
                        <button className="view-recipe-button">View Recipe</button>
                    </div>
                ))
            ) : (
                <p>No recipes found.</p>
            )}
        </div>
    );
};

export default RecipeList;