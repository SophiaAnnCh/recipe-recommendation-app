import React, { useState, useEffect } from 'react';
import UpdateProfile from './updateProfile'; // Import the UpdateProfile component
import UpdateRecipe from './UpdateRecipe'; // Import the UpdateRecipe component
import { Link } from 'react-router-dom';
import './Profile.css';
import RecipeDetail from './RecipeDetail'; // Import the RecipeDetail component

function Profiles() {
  const [userDetails, setUserDetails] = useState(null);
  const [userRecipes, setUserRecipes] = useState([]);
  const [userReviews, setUserReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(true);
  const [editingRecipeId, setEditingRecipeId] = useState(null);
  const [selectedRecipe, setSelectedRecipe] = useState(null); // New state for selected recipe details

  const userId = localStorage.getItem('userId');
  const userRole = localStorage.getItem('userRole');

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/user/${userId}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setUserDetails(data);
      } catch (error) {
        console.error('Error fetching user details:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserDetails();
    }
  }, [userId]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const endpoint = userRole === 'author' ? 'recipes' : 'reviews';
        const response = await fetch(`http://localhost:5000/api/${endpoint}/${userId}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        if (userRole === 'author') {
          setUserRecipes(data);
        } else {
          setUserReviews(data);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setDataLoading(false);
      }
    };

    if (userId) {
      fetchUserData();
    }
  }, [userId, userRole]);

  const handleUpdateRecipe = async (updatedRecipe) => {
    setUserRecipes((prevRecipes) =>
      prevRecipes.map((recipe) => (recipe.recipe_id === updatedRecipe.recipe_id ? updatedRecipe : recipe))
    );
    setEditingRecipeId(null);
  };

  const handleDeleteRecipe = async (recipeId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/recipe/${recipeId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete recipe');
      }
      setUserRecipes(userRecipes.filter(recipe => recipe.recipe_id !== recipeId));
    } catch (error) {
      console.error('Error deleting recipe:', error);
    }
  };

  // Define handleRecipeClick function
  const handleRecipeClick = (recipe) => {
    setSelectedRecipe(recipe); // Set the clicked recipe to be displayed in detail
  };

  // Define handleDeleteComment function
  const handleDeleteComment = async (reviewId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/review/${reviewId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete review');
      }
      setUserReviews(userReviews.filter((review) => review.review_id !== reviewId)); // Update the reviews list after deletion
    } catch (error) {
      console.error('Error deleting review:', error);
    }
  };

  if (loading || dataLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="profile">
      <div className="home-bar">
        <h1>Profile</h1>
        <Link to="/Dashboard">
          <h1>HOME</h1>
        </Link>
      </div>
      {userDetails && (
        <div className="user-details">
          <h2>{userDetails.username}</h2>
          <p>Email: {userDetails.email}</p>
          <p>Password: {userDetails.password}</p>
          <p>Role: {userDetails.role}</p>
          <UpdateProfile userDetails={userDetails} setUserDetails={setUserDetails} />
        </div>
      )}

      {userRole === 'author' && userRecipes.length > 0 && (
        <div className="user-recipes">
          <h3>User Recipes:</h3>
          <ul>
            {userRecipes.map(recipe => (
              <li key={recipe.recipe_id}>
                <p><strong>{recipe.recipe_name}</strong></p>
                <p>{recipe.description}</p>
                <button onClick={() => handleRecipeClick(recipe)}>View Details</button>
                <button onClick={() => setEditingRecipeId(recipe.recipe_id)}>Edit</button>
                <button onClick={() => handleDeleteRecipe(recipe.recipe_id)}>Delete</button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {userRole === 'reader' && userReviews.length > 0 && (
        <div className="user-reviews">
          <h3>User Reviews:</h3>
          <ul>
            {userReviews.map(review => (
              <li key={review.review_id}>
                <p><strong>{review.recipe_name}</strong></p>
                <p>{review.comment}</p>
                <p>Rating: {review.rating}</p>
                <p>Date: {new Date(review.timestamp).toLocaleString()}</p>
                <button onClick={() => handleDeleteComment(review.review_id)}>Delete</button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Render RecipeDetail if a recipe is selected */}
      {selectedRecipe && (
        <RecipeDetail
          recipe={selectedRecipe}
          onClose={() => setSelectedRecipe(null)} // Close the detail view
          userId={userId}
        />
      )}
    </div>
  );
}

export default Profiles;
