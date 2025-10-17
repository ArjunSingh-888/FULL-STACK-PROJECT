# 🔐 How to Use Auth Utils in Your React Components

## Import the utility
```javascript
import { isAuthenticated, getCurrentUser, logout, validateToken } from '../utils/auth';
```

---

## Example 1: Protected Route Component

```javascript
// components/ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '../utils/auth';

const ProtectedRoute = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

export default ProtectedRoute;
```

**Usage in App.js:**
```javascript
import ProtectedRoute from './components/ProtectedRoute';

<Route path="/dashboard" element={
  <ProtectedRoute>
    <Dashboard />
  </ProtectedRoute>
} />
```

---

## Example 2: Navbar with User Info & Logout

```javascript
// components/Navbar.js
import React from 'react';
import { isAuthenticated, getCurrentUser, logout } from '../utils/auth';
import './Navbar.css';

function Navbar() {
  const isLoggedIn = isAuthenticated();
  const user = isLoggedIn ? getCurrentUser() : null;

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      await logout();
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <h1>MyApp</h1>
      </div>
      
      <div className="navbar-menu">
        {isLoggedIn ? (
          <>
            <div className="user-info">
              {user.userImage && (
                <img 
                  src={user.userImage} 
                  alt="Profile" 
                  className="user-avatar"
                />
              )}
              <span className="user-name">Welcome, {user.username}!</span>
            </div>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </>
        ) : (
          <>
            <a href="/login" className="nav-link">Login</a>
            <a href="/signup" className="nav-link">Sign Up</a>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
```

---

## Example 3: Dashboard with Token Validation

```javascript
// pages/Dashboard.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, validateToken } from '../utils/auth';
import './Dashboard.css';

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const validation = await validateToken();
      
      if (validation.valid) {
        setUser(getCurrentUser());
      } else {
        navigate('/login');
      }
      
      setLoading(false);
    };

    checkAuth();
  }, [navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <div className="user-profile">
        {user?.userImage && (
          <img src={user.userImage} alt="Profile" className="profile-pic" />
        )}
        <h2>{user?.fullName}</h2>
        <p>@{user?.username}</p>
        <p>User ID: {user?.userId}</p>
      </div>
    </div>
  );
}

export default Dashboard;
```

---

## Example 4: Simplified Login Component

```javascript
// pages/Login.js (Simplified with auth utils)
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../utils/auth';
import './Login.css';

function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(username, password);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      {error && <div className="error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}

export default Login;
```

---

## Example 5: Simplified Signup Component

```javascript
// pages/SignUp.js (Simplified with auth utils)
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signup } from '../utils/auth';
import './SignUp.css';

function SignUp() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    fullName: '',
    userImage: null
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, userImage: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await signup(
      formData.username,
      formData.password,
      formData.fullName,
      formData.userImage
    );

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <div className="signup-container">
      <h2>Sign Up</h2>
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
        <input
          type="text"
          placeholder="Full Name"
          value={formData.fullName}
          onChange={(e) => setFormData({...formData, fullName: e.target.value})}
          required
        />
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Creating Account...' : 'Sign Up'}
        </button>
      </form>
    </div>
  );
}

export default SignUp;
```

---

## Example 6: App-Level Token Validation

```javascript
// App.js
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { validateToken, isAuthenticated } from './utils/auth';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';

function App() {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      if (isAuthenticated()) {
        const result = await validateToken();
        setAuthenticated(result.valid);
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route 
          path="/login" 
          element={authenticated ? <Navigate to="/dashboard" /> : <Login />} 
        />
        <Route 
          path="/signup" 
          element={authenticated ? <Navigate to="/dashboard" /> : <SignUp />} 
        />
        <Route 
          path="/dashboard" 
          element={authenticated ? <Dashboard /> : <Navigate to="/login" />} 
        />
      </Routes>
    </Router>
  );
}

export default App;
```

---

## Quick Reference

### Check if logged in
```javascript
import { isAuthenticated } from '../utils/auth';

if (isAuthenticated()) {
  // User is logged in
}
```

### Get current user data
```javascript
import { getCurrentUser } from '../utils/auth';

const user = getCurrentUser();
console.log(user.username, user.fullName);
```

### Logout
```javascript
import { logout } from '../utils/auth';

await logout(); // Automatically redirects to login
```

### Validate token
```javascript
import { validateToken } from '../utils/auth';

const result = await validateToken();
if (result.valid) {
  // Token is valid
}
```

---

**Pro Tip:** Always validate the token when loading protected pages to ensure the session is still active!
