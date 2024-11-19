import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate
import './Dashboard.css';
import RecipeList from './recipeList.jsx'; 
import RecipeDetail from './RecipeDetail.jsx'; 
import { CiCirclePlus } from "react-icons/ci";

function Dashboard() {
    const [recipes, setRecipes] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState('');
    const [selectedRecipe, setSelectedRecipe] = useState(null); 
    const [loading, setLoading] = useState(false); // Loading state

    // Retrieve user ID and role from localStorage
    const userId = localStorage.getItem('userId');
    const userRole = localStorage.getItem('userRole');
    const navigate = useNavigate(); // Initialize useNavigate

    useEffect(() => {
        const fetchTopRecipes = async () => {
            setLoading(true); // Start loading
            try {
                const response = await fetch('http://localhost:5000/api/top-recipes');
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const data = await response.json();
                setRecipes(data);
            } catch (error) {
                console.error('Error fetching top recipes:', error);
                setError('Failed to fetch top recipes');
            } finally {
                setLoading(false); // End loading
            }
        };

        fetchTopRecipes();
    }, []);

    const handleSearch = async (e) => {
        e.preventDefault();
        setLoading(true); // Start loading
        setError(''); // Reset error

        try {
            const response = await fetch(`http://localhost:5000/api/search-recipes?q=${searchTerm}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            setRecipes(data);
        } catch (error) {
            console.error('Error searching recipes:', error);
            setError('Failed to search recipes');
        } finally {
            setLoading(false); // End loading
        }
    };

    const handleRecipeClick = (recipe) => {
        setSelectedRecipe(recipe); 
    };

    const handleCloseDetail = () => {
        setSelectedRecipe(null); 
    };

    const handleLogout = () => {
        // Clear user data from localStorage
        localStorage.removeItem('userId');
        localStorage.removeItem('userRole');
        localStorage.removeItem('username');
        console.log('User  logged out');
        
        // Redirect to login page
        navigate('/'); // Redirect to the login page
    };

    return (
        <div className="dashboard">
            <div className="search-container">
                <form className="search-box" onSubmit={handleSearch}>
                    <input 
                        type="text" 
                        placeholder="Search..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button type="submit">Search</button>
                </form>
            </div>

            {loading && <p className="loading">Loading...</p>}
            {error && <p className="error">{error}</p>}
            <RecipeList recipes={recipes} onRecipeClick={handleRecipeClick} /> 

            {selectedRecipe && (
                <RecipeDetail 
                    recipe={selectedRecipe} 
                    onClose={handleCloseDetail} 
                    userId={userId} // Pass userId as a prop to RecipeDetail
                />
            )}

            <div className="container">
                <nav>
                    <ul>
                        <li><Link to="/Profiles">Profile</Link></li>
                        {userRole !== 'author' && (
                            <li><Link to="/Shopping">Shopping Cart</Link></li>
                        )}
                        <li><button onClick={handleLogout} className="logout-btn">Log Out</button></li> {/* Logout button */}
                    </ul>
                </nav>
            </div>
            {userRole !== 'reader' && (
                <Link to="/add-recipe">
                    <CiCirclePlus className="add" />
                </Link>
            )}
        </div>
    );
}

export default Dashboard;