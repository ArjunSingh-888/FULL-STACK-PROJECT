import React from 'react';
import './Navbar.css';

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <a href="/">FriendZone</a>
        </div>
        <ul className="navbar-menu">
          <li className="navbar-item">
            <a href="/" className="navbar-link">Home</a>
          </li>
          <li className="navbar-item">
            <a href="/login" className="navbar-link">Login</a>
          </li>
          <li className="navbar-item">
            <a href="/signup" className="navbar-link navbar-link-signup">Sign Up</a>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
