import React, { useState } from 'react';
import './Login.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function Login() {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login Data:', formData);
    // Add your login logic here
  };

  return (
    <div className="login-container">
      <Navbar />
      <div className="login-main">
        <div className="login-box">
          <h1 className="login-title">Welcome Back</h1>
          <p className="login-subtitle">Please login to your account</p>
          
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username" className="form-label">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                className="form-input"
                placeholder="Enter your username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                className="form-input"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-options">
              <label className="remember-me">
                <input type="checkbox" />
                <span>Remember me</span>
              </label>
              <a href="/forgot-password" className="forgot-password">Forgot Password?</a>
            </div>

            <button type="submit" className="login-button">Login</button>
          </form>

          <div className="login-footer">
            <p>Don't have an account? <a href="/signup" className="signup-link">Sign Up</a></p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Login;
