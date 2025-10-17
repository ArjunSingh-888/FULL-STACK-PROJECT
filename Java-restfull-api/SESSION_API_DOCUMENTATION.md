# 🔐 Session Management API Documentation

## Overview
This API provides complete session management with token-based authentication. Tokens are generated on signup/login and should be stored in localStorage for persistent sessions.

---

## 📋 API Endpoints

### 1. **Signup** - Create New User & Session
**POST** `/api/users/signup`

Creates a new user account and automatically generates a session token.

#### Request Body
```json
{
  "username": "johndoe",
  "password": "securePassword123",
  "fullName": "John Doe",
  "userImage": null
}
```

#### Success Response (201 Created)
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "username": "johndoe",
  "fullName": "John Doe",
  "userImage": null,
  "createdAt": "2025-10-17T10:30:00.000Z",
  "token": "aF2kL9pQ3mN7xR5wT8jK1bV4cH6yU0oP2eS9dG7fZ3qW5nX8mL1kJ4rT6vY9hB2",
  "sessionId": "7c9e6679-7425-40de-944b-e07fc1f90ae7"
}
```

#### Frontend Integration (React)
```javascript
const handleSignup = async (username, password, fullName) => {
  try {
    const response = await fetch('http://localhost:8080/api/users/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, fullName, userImage: null })
    });

    if (response.ok) {
      const data = await response.json();
      
      // Store token in localStorage
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userId', data.userId);
      localStorage.setItem('username', data.username);
      localStorage.setItem('sessionId', data.sessionId);
      
      console.log('Signup successful!');
      // Redirect to dashboard
    } else {
      const error = await response.json();
      alert(error.error);
    }
  } catch (error) {
    console.error('Signup error:', error);
  }
};
```

---

### 2. **Login** - Authenticate & Create Session
**POST** `/api/users/login`

Authenticates user and creates a new active session.

#### Request Body
```json
{
  "username": "johndoe",
  "password": "securePassword123"
}
```

#### Success Response (200 OK)
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "username": "johndoe",
  "fullName": "John Doe",
  "userImage": null,
  "token": "aF2kL9pQ3mN7xR5wT8jK1bV4cH6yU0oP2eS9dG7fZ3qW5nX8mL1kJ4rT6vY9hB2",
  "sessionId": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "loginTime": "2025-10-17T10:30:00.000Z"
}
```

#### Error Response (401 Unauthorized)
```json
{
  "error": "Invalid username or password"
}
```

#### Frontend Integration (React)
```javascript
const handleLogin = async (username, password) => {
  try {
    const response = await fetch('http://localhost:8080/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    if (response.ok) {
      const data = await response.json();
      
      // Store token in localStorage
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('userId', data.userId);
      localStorage.setItem('username', data.username);
      localStorage.setItem('sessionId', data.sessionId);
      
      console.log('Login successful!');
      // Redirect to dashboard
    } else {
      const error = await response.json();
      alert(error.error);
    }
  } catch (error) {
    console.error('Login error:', error);
  }
};
```

---

### 3. **Logout** - End Session
**POST** `/api/users/logout`

Deactivates the current session and marks logout time.

#### Request Body
```json
{
  "token": "aF2kL9pQ3mN7xR5wT8jK1bV4cH6yU0oP2eS9dG7fZ3qW5nX8mL1kJ4rT6vY9hB2"
}
```

#### Success Response (200 OK)
```json
{
  "message": "Logout successful"
}
```

#### Frontend Integration (React)
```javascript
const handleLogout = async () => {
  try {
    const token = localStorage.getItem('authToken');
    
    const response = await fetch('http://localhost:8080/api/users/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    });

    if (response.ok) {
      // Clear localStorage
      localStorage.removeItem('authToken');
      localStorage.removeItem('userId');
      localStorage.removeItem('username');
      localStorage.removeItem('sessionId');
      
      console.log('Logout successful!');
      // Redirect to login page
    }
  } catch (error) {
    console.error('Logout error:', error);
  }
};
```

---

### 4. **Validate Token** - Check Session Status
**POST** `/api/users/validate-token`

Validates if a token is still active and returns user information.

#### Request Body
```json
{
  "token": "aF2kL9pQ3mN7xR5wT8jK1bV4cH6yU0oP2eS9dG7fZ3qW5nX8mL1kJ4rT6vY9hB2"
}
```

#### Success Response (200 OK)
```json
{
  "valid": true,
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "username": "johndoe",
  "fullName": "John Doe",
  "userImage": null,
  "sessionId": "7c9e6679-7425-40de-944b-e07fc1f90ae7"
}
```

#### Invalid Token Response (401 Unauthorized)
```json
{
  "valid": false
}
```

#### Frontend Integration (React)
```javascript
const validateSession = async () => {
  try {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      // No token found, redirect to login
      window.location.href = '/login';
      return false;
    }

    const response = await fetch('http://localhost:8080/api/users/validate-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    });

    const data = await response.json();

    if (data.valid) {
      console.log('Session is valid');
      return true;
    } else {
      // Invalid session, redirect to login
      localStorage.clear();
      window.location.href = '/login';
      return false;
    }
  } catch (error) {
    console.error('Validation error:', error);
    return false;
  }
};

// Call this on app load or protected routes
validateSession();
```

---

### 5. **Get User Sessions** - List Active Sessions
**GET** `/api/users/sessions/{userId}`

Retrieves all active sessions for a specific user.

#### Success Response (200 OK)
```json
[
  {
    "sessionId": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "token": "aF2kL9pQ3mN7xR5wT8jK1bV4cH6yU0oP2eS9dG7fZ3qW5nX8mL1kJ4rT6vY9hB2",
    "loginTime": "2025-10-17T10:30:00.000Z",
    "logoutTime": null,
    "deviceInfo": "IP: 192.168.1.1 | User-Agent: Mozilla/5.0...",
    "isActive": true
  }
]
```

---

## 🔄 Complete React Authentication Flow

### App.js with Protected Routes
```jsx
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Validate token on app load
    const validateToken = async () => {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('http://localhost:8080/api/users/validate-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        });

        const data = await response.json();
        setIsAuthenticated(data.valid);
      } catch (error) {
        console.error('Token validation failed:', error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    validateToken();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />
        <Route path="/signup" element={!isAuthenticated ? <SignUp /> : <Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
      </Routes>
    </Router>
  );
}

export default App;
```

### Login Component
```jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:8080/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        
        // Store session data
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('userId', data.userId);
        localStorage.setItem('username', data.username);
        localStorage.setItem('sessionId', data.sessionId);
        
        // Redirect to dashboard
        navigate('/dashboard');
      } else {
        const errorData = await response.json();
        setError(errorData.error);
      }
    } catch (error) {
      setError('Network error. Please try again.');
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      {error && <div className="error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={formData.username}
          onChange={(e) => setFormData({...formData, username: e.target.value})}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(e) => setFormData({...formData, password: e.target.value})}
          required
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
```

### Dashboard Component with Logout
```jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const username = localStorage.getItem('username');

  const handleLogout = async () => {
    const token = localStorage.getItem('authToken');

    try {
      await fetch('http://localhost:8080/api/users/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear localStorage and redirect
      localStorage.clear();
      navigate('/login');
    }
  };

  return (
    <div className="dashboard">
      <h1>Welcome, {username}!</h1>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default Dashboard;
```

---

## 🗄️ Database Tables

### Users Table
```sql
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    user_image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_users_username ON users(username);
```

### Sessions Table
```sql
CREATE TABLE sessions (
    session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    login_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    logout_time TIMESTAMP WITH TIME ZONE,
    device_info TEXT,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_sessions_token ON sessions(token);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
```

---

## 🔒 Security Notes

⚠️ **IMPORTANT SECURITY CONSIDERATIONS:**

1. **Password Hashing**: Current implementation stores plain-text passwords. **You MUST implement password hashing** (BCrypt, Argon2) before production.

2. **Token Security**: 
   - Tokens are 48-byte random secure tokens
   - Store tokens in localStorage (or httpOnly cookies for better security)
   - Never expose tokens in URLs or logs

3. **HTTPS**: Always use HTTPS in production to prevent token interception

4. **Token Expiration**: Consider implementing token expiration logic

5. **CSRF Protection**: Add CSRF tokens for additional security

6. **Rate Limiting**: Implement rate limiting on login/signup endpoints

---

## 🧪 Testing with cURL

### Signup
```bash
curl -X POST http://localhost:8080/api/users/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"test123","fullName":"Test User","userImage":null}'
```

### Login
```bash
curl -X POST http://localhost:8080/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"test123"}'
```

### Validate Token
```bash
curl -X POST http://localhost:8080/api/users/validate-token \
  -H "Content-Type: application/json" \
  -d '{"token":"YOUR_TOKEN_HERE"}'
```

### Logout
```bash
curl -X POST http://localhost:8080/api/users/logout \
  -H "Content-Type: application/json" \
  -d '{"token":"YOUR_TOKEN_HERE"}'
```

---

## 📊 Token Flow Diagram

```
┌──────────┐
│  Client  │
└────┬─────┘
     │
     │ 1. POST /signup or /login
     │    (username, password)
     ▼
┌──────────┐
│  Server  │
└────┬─────┘
     │
     │ 2. Validate credentials
     │ 3. Generate secure token
     │ 4. Create session in DB
     │ 5. Return token + user data
     ▼
┌──────────┐
│  Client  │────────► Store token in localStorage
└────┬─────┘
     │
     │ 6. Include token in subsequent requests
     │
     ▼
┌──────────┐
│  Server  │────────► Validate token for each protected route
└──────────┘
```

---

**Server:** `http://localhost:8080`  
**Documentation Updated:** October 17, 2025
