# 🚀 Signup API Documentation

## API Endpoint
**POST** `/api/users/signup`

**Base URL:** `http://localhost:8080`

## Request Format

### JSON Body Structure
```json
{
  "username": "johndoe",
  "password": "securePassword123",
  "fullName": "John Doe",
  "userImage": "data:image/png;base64,iVBORw0KGgoAAAANS..." 
}
```

### Field Descriptions
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `username` | String | ✅ Yes | Unique username (max 50 chars) |
| `password` | String | ✅ Yes | User password (max 255 chars) - should be hashed on client side |
| `fullName` | String | ✅ Yes | User's full name (max 100 chars) |
| `userImage` | String | ❌ No | Base64 encoded image or null |

## Example Requests

### Using cURL
```bash
curl -X POST http://localhost:8080/api/users/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "password": "securePassword123",
    "fullName": "John Doe",
    "userImage": null
  }'
```

### Using JavaScript (Fetch API)
```javascript
const signupUser = async () => {
  try {
    const response = await fetch('http://localhost:8080/api/users/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'johndoe',
        password: 'securePassword123',
        fullName: 'John Doe',
        userImage: null
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('User created successfully:', data);
    } else {
      console.error('Error:', data.error);
    }
  } catch (error) {
    console.error('Network error:', error);
  }
};

signupUser();
```

### Using Axios
```javascript
import axios from 'axios';

const signupUser = async () => {
  try {
    const response = await axios.post('http://localhost:8080/api/users/signup', {
      username: 'johndoe',
      password: 'securePassword123',
      fullName: 'John Doe',
      userImage: null
    });
    
    console.log('User created:', response.data);
  } catch (error) {
    if (error.response) {
      console.error('Error:', error.response.data.error);
    } else {
      console.error('Network error:', error.message);
    }
  }
};

signupUser();
```

### Using Postman
1. Set method to **POST**
2. URL: `http://localhost:8080/api/users/signup`
3. Go to **Body** tab
4. Select **raw** and **JSON**
5. Paste the JSON data:
```json
{
  "username": "johndoe",
  "password": "securePassword123",
  "fullName": "John Doe",
  "userImage": null
}
```
6. Click **Send**

## Response Examples

### ✅ Success Response (201 Created)
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "username": "johndoe",
  "password": "securePassword123",
  "fullName": "John Doe",
  "userImage": null,
  "createdAt": "2025-10-17T10:30:00.000Z"
}
```

### ❌ Error Responses

**Username Already Exists (409 Conflict)**
```json
{
  "error": "Username already exists"
}
```

**Missing Required Field (400 Bad Request)**
```json
{
  "error": "Username is required"
}
```

**Server Error (500 Internal Server Error)**
```json
{
  "error": "Failed to create user: <error details>"
}
```

## Database Table Structure

The data is stored in the `users` table in Supabase:

```sql
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    user_image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Security Notes

⚠️ **IMPORTANT:** 
- The current implementation stores passwords in plain text
- **You should hash passwords on the client side before sending** or implement server-side hashing
- Consider using BCrypt or similar hashing algorithms
- Add JWT token authentication for secure sessions
- Validate and sanitize all input data
- Use HTTPS in production

## Testing the API

After the server starts, you can test the health check:
```bash
curl http://localhost:8080/api/users/health
```

Expected response: `✅ API is running!`

## Other Available Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | Get all users |
| GET | `/api/users/{id}` | Get user by UUID |
| GET | `/api/users/username/{username}` | Get user by username |
| POST | `/api/users/login` | Login user |
| PUT | `/api/users/{id}` | Update user |
| DELETE | `/api/users/{id}` | Delete user |

## Integration with React Frontend

```jsx
// SignUp.js
import React, { useState } from 'react';
import axios from 'axios';

const SignUp = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    fullName: '',
    userImage: null
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await axios.post(
        'http://localhost:8080/api/users/signup',
        formData
      );
      
      console.log('Signup successful:', response.data);
      alert('User created successfully!');
      // Redirect to login or dashboard
    } catch (error) {
      console.error('Signup error:', error.response?.data?.error);
      alert(error.response?.data?.error || 'Signup failed');
    }
  };

  return (
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
      <button type="submit">Sign Up</button>
    </form>
  );
};

export default SignUp;
```

---

**Server Status:** Running on `http://localhost:8080`
**Database:** Connected to Supabase PostgreSQL
