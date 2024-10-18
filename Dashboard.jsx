import React from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.css'; // Import your CSS file
import bgg from './images/bgg.png'; // Adjust the path based on your file structure

function Dashboard() {
  return (
    <div className="dashboard">
      <img src={bgg} className="logo" alt="Logo" />

      <div className="search-container">
        <form className="search-box">
          <input type="text" placeholder="Search..." />
          <button type="submit">Search</button>
        </form>
      </div>

      <div className="container">
        <nav>
          <ul>
            <li><Link to="/profiles">Profile</Link></li>
            <li><Link to="/Shopping">Shopping Cart</Link></li>
            <li><Link to="/Pantries">Pantry</Link></li>
          </ul>
        </nav>
      </div>
    </div>
  );
}

export default Dashboard;
