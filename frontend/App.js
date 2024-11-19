import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Dashboard from './Dashboard';
import AddRecipe from './AddRecipes';
import Register from './Register';
import Profiles from './Profiles';
import Shopping from './Shopping';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Register />} />
        <Route path="/Dashboard" element={<Dashboard />} />
        <Route path="/add-recipe" element={<AddRecipe />} />
        <Route path="/Profiles" element={<Profiles />} />
        <Route path="/Shopping" element={<Shopping />} />
      </Routes>
    </Router>
  );
}

export default App;
