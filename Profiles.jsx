import React from 'react';
import './Profile.css';

function Profiles() {
  return (
    <div className="dashboard-container">

      
      {/* Main Dashboard Content */}
      <div className="main-content">
        <header className="header">
          <h4>My Profile</h4>
          <div className="user-info">
            <span>Hello UserName</span>
            <img src="your-profile-url" alt="User" className="user-photo" />
          </div>
        </header>

        <div className="dashboard-grid">
          {/* Profile Section */}
          <div className="profile-section">
            <img src="your-profile-photo-url" alt="Profile" className="profile-photo" />
            <div className="profile-info">
              <h3>My Details</h3>
              <p>User Name</p>
              <p>User Phone Number</p>
              <p>User Mail</p>
            </div>
            <button className="save-btn">Save</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profiles;
