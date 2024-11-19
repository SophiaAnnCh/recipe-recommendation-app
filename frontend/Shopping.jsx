import React, { useState, useEffect } from 'react';
import './shopping.css';
import { useNavigate } from 'react-router-dom';  // Import useNavigate from react-router-dom

function Shopping() {
    const [mealPlan, setMealPlan] = useState([]);
    const [shoppingList, setShoppingList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Retrieve user ID from localStorage
    const userId = localStorage.getItem('userId');
    const navigate = useNavigate();  // Initialize the navigate function

    // Fetch meal plan and shopping list
    useEffect(() => {
        console.log('User ID:', userId);

        const fetchMealPlan = async () => {
            setLoading(true);
            setError('');

            try {
                const response = await fetch(`http://localhost:5000/api/meal-plan-list?userId=${userId}`);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const data = await response.json();
                setMealPlan(data);
            } catch (error) {
                console.error('Error fetching meal plan:', error);
                setError('Failed to fetch meal plan');
            } finally {
                setLoading(false);
            }
        };

        const fetchShoppingList = async () => {
            setLoading(true);
            setError('');

            try {
                const response = await fetch(`http://localhost:5000/api/shopping-list?userId=${userId}`);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const data = await response.json();
                setShoppingList(data);
            } catch (error) {
                console.error('Error fetching shopping list:', error);
                setError('Failed to fetch shopping list');
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            fetchMealPlan();
            fetchShoppingList();
        } else {
            setError('User ID not found in local storage.');
            setLoading(false);
        }
    }, [userId]);

    // Function to handle fetching the shopping list after a recipe is removed
    const fetchShoppingList = async () => {
        setLoading(true);
        setError('');

        try {
            const response = await fetch(`http://localhost:5000/api/shopping-list?userId=${userId}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            setShoppingList(data);
        } catch (error) {
            console.error('Error fetching shopping list:', error);
            setError('Failed to fetch shopping list');
        } finally {
            setLoading(false);
        }
    };

    // Function to handle removing a recipe from the meal plan
    const handleRemoveRecipe = async (recipeId) => {
        try {
            // Call the backend API to remove one instance of the recipe from the meal plan
            await fetch(`http://localhost:5000/api/meal-plan/${recipeId}?userId=${userId}`, {
                method: 'DELETE'
            });
    
            // Remove only one occurrence of the recipe from the meal plan in the state
            setMealPlan((prevMealPlan) => {
                const indexToRemove = prevMealPlan.findIndex(recipe => recipe.recipe_id === recipeId);
                if (indexToRemove !== -1) {
                    const newMealPlan = [...prevMealPlan];
                    newMealPlan.splice(indexToRemove, 1); // Remove only the first occurrence
                    return newMealPlan;
                }
                return prevMealPlan;
            });
    
            // Fetch the updated shopping list after the recipe removal
            fetchShoppingList();
        } catch (error) {
            console.error('Error removing recipe from meal plan:', error);
            setError('Failed to remove recipe from meal plan');
        }
    };
    

    // Function to handle toggling the "bought" status of an ingredient
    const handleToggleBought = async (ingredientId) => {
        try {
            await fetch(`http://localhost:5000/api/ingredient-list/${ingredientId}?userId=${userId}`, {
                method: 'PUT'
            });

            setShoppingList(shoppingList.map(ingredient => 
                ingredient.ingredient_id === ingredientId 
                    ? { ...ingredient, bought: !ingredient.bought } 
                    : ingredient
            ));
        } catch (error) {
            console.error('Error updating ingredient status:', error);
            setError('Failed to update ingredient status');
        }
    };

    // Handle creating a new meal plan
    const handleNewMealPlan = async () => {
        try {
            await fetch(`http://localhost:5000/api/meal-plan?userId=${userId}`, {
                method: 'DELETE'
            });
            setMealPlan([]);
            setShoppingList([]);
        } catch (error) {
            console.error('Error creating new meal plan:', error);
            setError('Failed to create new meal plan');
        }
    };

    // Handle navigation to dashboard
    const handleGoToDashboard = () => {
        navigate('/dashboard');  // Redirect to the dashboard route
    };

    return (
        <div className='shopping-container'>
            {loading && <p>Loading...</p>}
            {error && <p className='error'>{error}</p>}
            <button onClick={handleNewMealPlan}>New Meal Plan</button>
            <button onClick={handleGoToDashboard}>Go to Dashboard</button>  {/* New button for redirect */}
            {mealPlan.length === 0 && !loading && <p>No recipes in your meal plan.</p>}
            {mealPlan.length > 0 && (
                <ul>
                    {mealPlan.map((recipe) => (
                        <li key={recipe.recipe_id}>
                            {recipe.recipe_name} (x{recipe.count})
                            <button onClick={() => handleRemoveRecipe(recipe.recipe_id)}>Remove</button>
                        </li>
                    ))}
                </ul>
            )}
            {shoppingList.length > 0 && (
                <div>
                    <h2>Shopping List</h2>
                    <ul>
                        {shoppingList.map((ingredient) => (
                            <li key={ingredient.ingredient_id}>
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={ingredient.bought}
                                        onChange={() => handleToggleBought(ingredient.ingredient_id)}
                                    />
                                    {ingredient.ingredient_name} - {ingredient.total_quantity}
                                </label>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

export default Shopping;
