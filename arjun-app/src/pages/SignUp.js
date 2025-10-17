import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SignUp.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function SignUp() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    password: '',
    confirmPassword: '',
    image: ''
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(''); // Clear error when user types
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous messages
    setError('');
    setSuccess('');
    
    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match!');
      return;
    }

    // Validate image is selected
    if (!formData.image) {
      setError('Please select a profile image');
      return;
    }

    setLoading(true);

    try {
      // Prepare data for API
      const signupData = {
        username: formData.username,
        password: formData.password,
        fullName: formData.fullName,
        userImage: formData.image // Base64 encoded image
      };

      // Make API call
      const response = await fetch('http://localhost:8080/api/users/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(signupData)
      });

      const data = await response.json();

      if (response.ok) {
        // Store token and user data in localStorage
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('userId', data.userId);
        localStorage.setItem('username', data.username);
        localStorage.setItem('fullName', data.fullName);
        localStorage.setItem('sessionId', data.sessionId);
        if (data.userImage) {
          localStorage.setItem('userImage', data.userImage);
        }

        // Success
        setSuccess('Account created successfully! Redirecting...');
        console.log('Signup successful:', data);
        
        // Redirect to dashboard after 1.5 seconds
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } else {
        // Handle error response
        setError(data.message || 'Signup failed. Please try again.');
      }
    } catch (err) {
      console.error('Signup error:', err);
      setError('Network error. Please check if the server is running and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <Navbar />
      <div className="signup-main">
        <div className="signup-box">
          <h1 className="signup-title">Create Account</h1>
          <p className="signup-subtitle">Join us today! Please fill in the details</p>
          
          {error && (
            <div className="alert alert-error" style={{
              padding: '10px',
              marginBottom: '15px',
              backgroundColor: '#fee',
              color: '#c33',
              borderRadius: '5px',
              border: '1px solid #fcc'
            }}>
              {error}
            </div>
          )}
          
          {success && (
            <div className="alert alert-success" style={{
              padding: '10px',
              marginBottom: '15px',
              backgroundColor: '#efe',
              color: '#3c3',
              borderRadius: '5px',
              border: '1px solid #cfc'
            }}>
              {success}
            </div>
          )}
          
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

            <button type="submit" className="signup-button" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
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
