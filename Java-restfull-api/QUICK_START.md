# 🚀 Quick Start Guide - Session Management

## API Endpoints Summary

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/users/signup` | Create account + session | ❌ No |
| POST | `/api/users/login` | Login + create session | ❌ No |
| POST | `/api/users/logout` | End session | ✅ Yes (token) |
| POST | `/api/users/validate-token` | Check if token valid | ❌ No |
| GET | `/api/users/sessions/{userId}` | Get active sessions | ❌ No |

---

## 📝 Quick Examples

### 1. Signup (Returns Token)
```bash
curl -X POST http://localhost:8080/api/users/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john",
    "password": "pass123",
    "fullName": "John Doe",
    "userImage": null
  }'
```

**Response:**
```json
{
  "userId": "550e8400-...",
  "username": "john",
  "fullName": "John Doe",
  "userImage": null,
  "createdAt": "2025-10-17T10:30:00.000Z",
  "token": "aF2kL9pQ3mN7xR5wT8jK...",
  "sessionId": "7c9e6679-..."
}
```

**Action:** Save `token` to localStorage!

---

### 2. Login (Returns Token)
```bash
curl -X POST http://localhost:8080/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john",
    "password": "pass123"
  }'
```

**Response:**
```json
{
  "userId": "550e8400-...",
  "username": "john",
  "fullName": "John Doe",
  "userImage": null,
  "token": "aF2kL9pQ3mN7xR5wT8jK...",
  "sessionId": "7c9e6679-...",
  "loginTime": "2025-10-17T10:30:00.000Z"
}
```

**Action:** Save `token` to localStorage!

---

### 3. Validate Token
```bash
curl -X POST http://localhost:8080/api/users/validate-token \
  -H "Content-Type: application/json" \
  -d '{"token": "YOUR_TOKEN_HERE"}'
```

**Response (Valid):**
```json
{
  "valid": true,
  "userId": "550e8400-...",
  "username": "john",
  "fullName": "John Doe",
  "userImage": null,
  "sessionId": "7c9e6679-..."
}
```

**Response (Invalid):**
```json
{
  "valid": false
}
```

---

### 4. Logout
```bash
curl -X POST http://localhost:8080/api/users/logout \
  -H "Content-Type: application/json" \
  -d '{"token": "YOUR_TOKEN_HERE"}'
```

**Response:**
```json
{
  "message": "Logout successful"
}
```

**Action:** Clear localStorage!

---

## 💻 React Code Snippets

### Store Token (Signup/Login)
```javascript
// After successful signup or login
localStorage.setItem('authToken', data.token);
localStorage.setItem('userId', data.userId);
localStorage.setItem('username', data.username);
localStorage.setItem('sessionId', data.sessionId);
```

### Get Token
```javascript
const token = localStorage.getItem('authToken');
```

### Check if User Logged In
```javascript
const isLoggedIn = () => {
  return localStorage.getItem('authToken') !== null;
};
```

### Logout
```javascript
const logout = async () => {
  const token = localStorage.getItem('authToken');
  
  await fetch('http://localhost:8080/api/users/logout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token })
  });
  
  localStorage.clear();
  window.location.href = '/login';
};
```

### Protected Route Check
```javascript
useEffect(() => {
  const checkAuth = async () => {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      window.location.href = '/login';
      return;
    }
    
    const response = await fetch('http://localhost:8080/api/users/validate-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    });
    
    const data = await response.json();
    
    if (!data.valid) {
      localStorage.clear();
      window.location.href = '/login';
    }
  };
  
  checkAuth();
}, []);
```

---

## 🎯 Key Points

1. **Signup** → Returns token → Store in localStorage
2. **Login** → Returns token → Store in localStorage
3. **Every page load** → Validate token → If invalid, redirect to login
4. **Logout** → Call API → Clear localStorage → Redirect to login
5. **Token** → Use for all authenticated requests

---

## 🔒 Security Checklist

- [ ] Hash passwords (BCrypt/Argon2)
- [ ] Use HTTPS in production
- [ ] Add token expiration
- [ ] Implement refresh tokens
- [ ] Add rate limiting
- [ ] Validate all inputs
- [ ] Use environment variables for sensitive data

---

## 🗄️ Database Setup (Supabase)

Run these SQL commands in your Supabase SQL editor:

```sql
-- Users table
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    user_image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_users_username ON users(username);

-- Sessions table
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

**Base URL:** `http://localhost:8080`  
**Full Documentation:** See `SESSION_API_DOCUMENTATION.md`
