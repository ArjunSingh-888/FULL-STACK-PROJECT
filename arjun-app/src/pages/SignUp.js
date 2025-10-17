import React, { useState } from 'react';
import './SignUp.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function SignUp() {
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    password: '',
    confirmPassword: '',
    image: ''
  });

  const [imagePreview, setImagePreview] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Convert image to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setFormData({
          ...formData,
          image: base64String
        });
        setImagePreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    console.log('Sign Up Data:', {
      username: formData.username,
      fullName: formData.fullName,
      password: formData.password,
      image: formData.image // This is in base64 format
    });
    // Add your sign up logic here
  };

  return (
    <div className="signup-container">
      <Navbar />
      <div className="signup-main">
        <div className="signup-box">
          <h1 className="signup-title">Create Account</h1>
          <p className="signup-subtitle">Join us today! Please fill in the details</p>
          
          <form className="signup-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username" className="form-label">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                className="form-input"
                placeholder="Choose a username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="fullName" className="form-label">Full Name</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                className="form-input"
                placeholder="Enter your full name"
                value={formData.fullName}
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
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                className="form-input"
                placeholder="Re-enter your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="image" className="form-label">Profile Image</label>
              <input
                type="file"
                id="image"
                name="image"
                className="form-input-file"
                accept="image/*"
                onChange={handleImageChange}
              />
              <div className="file-input-wrapper">
                <label htmlFor="image" className="file-input-label">
                  {imagePreview ? 'Change Image' : 'Choose Image'}
                </label>
                <span className="file-input-text">
                  {formData.image ? 'Image selected' : 'No file chosen'}
                </span>
              </div>
              
              {imagePreview && (
                <div className="image-preview">
                  <img src={imagePreview} alt="Preview" className="preview-img" />
                  <p className="preview-text">Image Preview</p>
                </div>
              )}
            </div>

            <div className="form-group-checkbox">
              <label className="terms-label">
                <input type="checkbox" required />
                <span>I agree to the <a href="/terms" className="terms-link">Terms & Conditions</a></span>
              </label>
            </div>

            <button type="submit" className="signup-button">Create Account</button>
          </form>

          <div className="signup-footer">
            <p>Already have an account? <a href="/login" className="login-link">Login</a></p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default SignUp;
