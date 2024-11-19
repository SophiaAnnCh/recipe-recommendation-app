import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import './AddRecipe.css';

function UpdateRecipe() {
    const { recipeId } = useParams(); // Retrieve the recipe ID from the URL
    const [existingRecipe, setExistingRecipe] = useState(null);
    const [newRecipe, setNewRecipe] = useState({
        recipe_name: '',
        instructions: '',
        time_taken: '',
        category_name: '', 
        image_path: '',
        nutritional_value: ''
    });
    const [ingredients, setIngredients] = useState([{ name: '', quantity: '' }]); // State for ingredients
    const [error, setError] = useState('');

    useEffect(() => {
        // Fetch the existing recipe data
        fetch(`http://localhost:5000/api/recipes/${recipeId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                setExistingRecipe(data);
                setNewRecipe({
                    recipe_name: data.recipe_name,
                    instructions: data.instructions,
                    time_taken: data.time_taken,
                    category_name: data.category_name,
                    image_path: data.image_path,
                    nutritional_value: JSON.stringify(data.nutritional_value)
                });
                setIngredients(data.ingredients || [{ name: '', quantity: '' }]);
            })
            .catch(error => {
                console.error('Error fetching recipe:', error);
                setError('Failed to fetch recipe');
            });
    }, [recipeId]);

    const handleAddIngredient = () => {
        setIngredients([...ingredients, { name: '', quantity: '' }]); // Add a new ingredient field
    };

    const handleRemoveIngredient = (index) => {
        const newIngredients = ingredients.filter((_, i) => i !== index);
        setIngredients(newIngredients); // Remove ingredient field at index
    };

    const handleIngredientChange = (index, field, value) => {
        const newIngredients = ingredients.map((ingredient, i) => 
            i === index ? { ...ingredient, [field]: value } : ingredient
        );
        setIngredients(newIngredients); // Update ingredient field
    };

    const handleUpdateRecipe = (e) => {
        e.preventDefault();

        const userId = localStorage.getItem('userId'); // Retrieve the userId from local storage

        const recipeToSubmit = {
            ...newRecipe,
            nutritional_value: JSON.stringify(JSON.parse(newRecipe.nutritional_value)),
            ingredients,
            authorId: userId // Include the authorId in the request body
        };

        fetch(`http://localhost:5000/api/recipes/${recipeId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(recipeToSubmit)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // Handle success
            console.log('Recipe updated:', data);
            // Optionally, redirect to the updated recipe page or reset form fields
        })
        .catch(error => {
            console.error('Error updating recipe:', error);
            setError('Failed to update recipe');
        });
    };

    if (!existingRecipe) {
        return <div>Loading...</div>;
    }

    return (
        <div className="add-recipe-container">
            <div className="home-bar">
                <h1>Update Recipe</h1>
                <Link to="/Dashboard">
                    <h1>HOME</h1>
                </Link>
            </div>
            
            <form className="add-recipe-form" onSubmit={handleUpdateRecipe}>
                {error && <p className="error">{error}</p>}
                <label>
                    Recipe Name:
                    <input 
                        type="text" 
                        value={newRecipe.recipe_name}
                        onChange={(e) => setNewRecipe({ ...newRecipe, recipe_name: e.target.value })}
                        required
                    />
                </label>
                <label>
                    Instructions:
                    <textarea 
                        value={newRecipe.instructions}
                        onChange={(e) => setNewRecipe({ ...newRecipe, instructions: e.target.value })}
                        required
                    />
                </label>
                <label>
                    Time Taken:
                    <input 
                        type="text" 
                        value={newRecipe.time_taken}
                        onChange={(e) => setNewRecipe({ ...newRecipe, time_taken: e.target.value })}
                        required
                    />
                </label>
                <label>
                    Category Name:
                    <input 
                        type="text" 
                        value={newRecipe.category_name}
                        onChange={(e) => setNewRecipe({ ...newRecipe, category_name: e.target.value })}
                        required
                    />
                </label>
                <label>
                    Image Path:
                    <input 
                        type="text" 
                        value={newRecipe.image_path}
                        onChange={(e) => setNewRecipe({ ...newRecipe, image_path: e.target.value })}
                        required
                    />
                </label>
                <label>
                    Nutritional Value (JSON format):
                    <textarea 
                        value={newRecipe.nutritional_value}
                        onChange={(e) => setNewRecipe({ ...newRecipe, nutritional_value: e.target.value })}
                        required
                    />
                </label>

                <h3>Ingredients</h3>
                {ingredients.map((ingredient, index) => (
                    <div key={index} className="ingredient-container">
                        <label>
                            Ingredient Name:
                            <input 
                                type="text" 
                                value={ingredient.name}
                                onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                                required
                            />
                        </label>
                        <label>
                            Quantity:
                            <input 
                                type="text" 
                                value={ingredient.quantity}
                                onChange={(e) => handleIngredientChange(index, 'quantity', e.target.value)}
                                required
                            />
                        </label>
                        <button type="button" className="remove-ingredient" onClick={() => handleRemoveIngredient(index)}>Remove</button>
                    </div>
                ))}
                <button type="button" className="add-ingredient" onClick={handleAddIngredient}>Add Ingredient</button>
                <button type="submit" className="submit-recipe">Update Recipe</button>
            </form>
        </div>
    );
}

export default UpdateRecipe;
