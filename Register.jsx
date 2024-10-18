import React from 'react';
import {Link} from 'react-router-dom';
import './Register.css'; 
function SignUp() {
  return (
    <div className="body_register">
      {/* Sign Up Screen */}
      <div className="heading">
        <h2>Cooking Stories</h2>
      </div>
      <div className="card signup-card">
        <h4>Sign Up To Make Amazing Recipes</h4>
        <form>
          <input type="text" placeholder="Username" />
          <input type="email" placeholder="Email" />
          <input type="password" placeholder="Password" />
          <Link to = "/Dashboard">
          <button className="btn" type="submit">SIGN UP</button>
          </Link>
        </form>
      </div>
    </div>
  );
}

export default SignUp;
