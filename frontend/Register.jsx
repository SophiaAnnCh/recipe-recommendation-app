import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Register.css';

function Register() {
  const [isLogin, setIsLogin] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'reader',
  });
  const navigate = useNavigate();

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setFormData({
      username: '',
      email: '',
      password: '',
      role: 'reader',
    });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    console.log('Registering with data:', formData);
    try {
      const response = await axios.post('http://localhost:5000/api/register', formData);
      console.log('Registration successful:', response.data);
      
      if (response.data.userId) {
        localStorage.setItem('userId', response.data.userId);
        localStorage.setItem('userRole', response.data.role);
        localStorage.setItem('username', response.data.username);
        console.log('Stored userId:', response.data.userId);
      }
      
      navigate('/dashboard');
    } catch (error) {
      if (error.response) {
        console.error('Registration error response:', error.response.data);
        alert(error.response.data.message || 'Registration failed!');
      } else {
        console.error('There was an error registering!', error);
        alert('An unexpected error occurred. Please try again.');
      }
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    console.log('Logging in with data:', { email: formData.email, password: formData.password });
    try {
      const response = await axios.post('http://localhost:5000/api/login', {
        email: formData.email,
        password: formData.password,
      });

      console.log('Login response:', response.data); // Add this for debugging

      // Store user information
      if (response.data.userId) {
        localStorage.setItem('userId', response.data.userId);
        localStorage.setItem('userRole', response.data.user.role);
        localStorage.setItem('username', response.data.user.username);
        console.log('Stored userId:', response.data.userId);
        navigate('/dashboard');
      } else {
        console.error('No userId in response:', response.data);
        alert('Login successful but user ID not received. Please try again.');
      }
    } catch (error) {
      if (error.response) {
        console.error('Login error response:', error.response.data);
        alert(error.response.data.message || 'Login failed!');
      } else {
        console.error('There was an error logging in!', error);
        alert('An unexpected error occurred. Please try again.');
      }
    }
  };

  return (
    <div className="body_register">
      <div className="heading">
        <h2>Cooking Stories</h2>
      </div>
      <div className="card signup-card">
        {isLogin ? (
          <>
            <h4>Sign In</h4>
            <form onSubmit={handleLogin}>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button className="btn" type="submit">SIGN IN</button>
            </form>
            <p>
              Don't have an account? <span onClick={toggleForm} className="toggle-link">Sign Up</span>
            </p>
          </>
        ) : (
          <>
            <h4>Sign Up To Make Amazing Recipes</h4>
            <form onSubmit={handleRegister}>
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
              >
                <option value="reader">Reader</option>
                <option value="author">Author</option>
              </select>
              <button className="btn" type="submit">SIGN UP</button>
            </form>
            <p>
              Already have an account? <span onClick={toggleForm} className="toggle-link">Sign In</span>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default Register;