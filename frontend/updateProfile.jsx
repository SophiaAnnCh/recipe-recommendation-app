import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function UpdateProfile({ userDetails, setUserDetails }) {
  const [formData, setFormData] = useState({
    username: userDetails.username,
    password: userDetails.password,
    role: userDetails.role,
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const userId = localStorage.getItem('userId');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      const response = await fetch(`http://localhost:5000/api/user/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to update user details');
      }

      const data = await response.json();
      setUserDetails(data); // Update the user details in the parent component
      setIsUpdating(false);
    } catch (error) {
      console.error('Error updating user details:', error);
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm('Are you sure you want to delete your account? This action cannot be undone.');

    if (confirmed) {
      setIsDeleting(true);

      try {
        const response = await fetch(`http://localhost:5000/api/user/${userId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete user account');
        }

        // Clear user details and redirect to signup page
        localStorage.removeItem('userId');
        navigate('/Register'); // Redirect to the signup page
      } catch (error) {
        console.error('Error deleting user account:', error);
        setIsDeleting(false);
      }
    }
  };

  return (
    <form className="update-profile-form" onSubmit={handleSubmit}>
      <h3>Update Profile</h3>
      <label>
        Username:
        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
        />
      </label>
      <label>
        Password:
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
        />
      </label>
      <label>
        Role:
        <input
          type="text"
          name="role"
          value={formData.role}
          onChange={handleChange}
        />
      </label>
      <button type="submit" disabled={isUpdating}>
        {isUpdating ? 'Updating...' : 'Update'}
      </button>
      <button type="button" className="delete-account-button" onClick={handleDelete} disabled={isDeleting}>
        {isDeleting ? 'Deleting...' : 'Delete Account'}
      </button>
    </form>
  );
}

export default UpdateProfile;