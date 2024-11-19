import React, { useState, useEffect } from 'react';
import './RecipeDetail.css';

const RecipeDetail = ({ recipe, onClose, userId }) => {
    const [reviews, setReviews] = useState([]);
    const [newReview, setNewReview] = useState({
        rating: 5, // Default rating is 5
        comment: '',
    });

    // Retrieve user role from localStorage
    const userRole = localStorage.getItem('userRole');

    // Fetch reviews for the recipe
    useEffect(() => {
        const fetchReviews = async () => {
            if (recipe && recipe.recipe_id) {
                try {
                    const response = await fetch(`http://localhost:5000/api/reviews?recipeId=${recipe.recipe_id}`);
                    if (!response.ok) {
                        throw new Error('Failed to fetch reviews');
                    }
                    const data = await response.json();
                    setReviews(data.slice(0, 5)); // Get only the latest 5 reviews
                } catch (error) {
                    console.error('Error fetching reviews:', error);
                }
            }
        };

        fetchReviews();
    }, [recipe]);

    // Handle adding a new recipe to the meal plan
    const addMealPlan = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/meal-plan', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    recipe_id: recipe.recipe_id, 
                    user_id: userId, 
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to add recipe to meal plan');
            }

            const data = await response.json();
            console.log('Recipe added to meal plan:', data);
        } catch (error) {
            console.error('Error adding recipe to meal plan:', error);
        }
    };

    // Handle form submission to add a new review
    const handleReviewChange = (e) => {
        const { name, value } = e.target;
        setNewReview((prevReview) => ({
            ...prevReview,
            [name]: value,
        }));
    };

    const handleSubmitReview = async (e) => {
        e.preventDefault();
    
        try {
            const response = await fetch('http://localhost:5000/api/reviews', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: userId,
                    recipe_id: recipe.recipe_id,
                    rating: newReview.rating,
                    comment: newReview.comment,
                }),
            });
    
            if (!response.ok) {
                const errorData = await response.json(); // Get the error response body
                throw new Error(`Failed to submit review: ${errorData.message || response.statusText}`);
            }
    
            const data = await response.json();
            console.log('Review submitted:', data);
            
            // Fetch the updated list of reviews
            const updatedReviews = await fetch(`http://localhost:5000/api/reviews?recipeId=${recipe.recipe_id}`);
            const reviewData = await updatedReviews.json();
            setReviews(reviewData.slice(0, 5)); // Update reviews with the latest ones
    
            // Reset the form after submission
            setNewReview({ rating: 5, comment: '' }); // Reset to default rating
        } catch (error) {
            console.error('Error submitting review:', error);
        }
    };

    // If recipe is not provided, return null
    if (!recipe) return null;

    return (
        <div className="recipe-detail-overlay" onClick={onClose}>
            <div className="recipe-detail" onClick={(e) => e.stopPropagation()}>
                <button className="close-button" onClick={onClose} aria-label="Close recipe details">
                    &times;
                </button>
                <h2>{recipe.recipe_name}</h2>
                <img src={recipe.image_path} alt={recipe.recipe_name} />
                <p><strong>Ingredients:</strong></p>
                <ul>
                    {Array.isArray(recipe.ingredients) && recipe.ingredients.length > 0 ? (
                        recipe.ingredients.map((ingredient, index) => (
                            <li key={index}>{ingredient.quantity} {ingredient.ingredient_name}</li>
                        ))
                    ) : (
                        <li>No ingredients available.</li>
                    )}
                </ul>
                <p><strong>Instructions:</strong> {recipe.instructions}</p>
                <p><strong>Time Taken:</strong> {recipe.time_taken} minutes</p>
                <p><strong>Rating:</strong> {recipe.rating}</p>
                <p><strong>Nutritional Value:</strong></p>
                <ul>
                    {Object.entries(recipe.nutritional_value).map(([key, value]) => (
                        <li key={key}><strong>{key}:</strong> {value}</li>
                    ))}
                </ul>

                {userRole !== 'author' && (
                    <button className="meal-plan" onClick={addMealPlan} aria-label="Add recipe to meal plan">
                        <h3>ADD RECIPE TO MEAL PLAN</h3>
                    </button>
                )}

                <div className="reviews">
                    <h3>Reviews:</h3>
                    {reviews.length > 0 ? (
                        <ul>
                            {reviews.map((review) => (
                                <li key={review.review_id}>
                                    <p><strong>{review.username}:</strong> {review.comment}</p>
                                    <p>Rating: {review.rating} / 5</p>
                                    <p><small>{new Date(review.timestamp).toLocaleString()}</small></p>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No reviews yet.</p>
                    )}
                </div>

                {userRole !== 'author' && (
                    <div className="review-form">
                        <h3>Write a Review:</h3>
                        <form onSubmit={handleSubmitReview}>
                            <div>
                                <label htmlFor="rating">Rating:</label>
                                <select
                                    id="rating"
                                    name="rating"
                                    value={newReview.rating}
                                    onChange={handleReviewChange}
                                >
                                    {[1, 2, 3, 4, 5].map((num) => (
                                        <option key={num} value={num}>{num}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="comment">Comment:</label>
                                <textarea
                                    id="comment"
                                    name="comment"
                                    value={newReview.comment}
                                    onChange={handleReviewChange}
                                />
                            </div>
                            <button type="submit">Submit Review</button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RecipeDetail;