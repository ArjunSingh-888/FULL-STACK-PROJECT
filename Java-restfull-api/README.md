# Spring Boot REST API with Supabase

## 🚀 Quick Setup Guide

### Prerequisites
- Java 17 or higher
- Maven
- VS Code with Java Extension Pack

### Step 1: Update Database Password
Open `src/main/resources/application.properties` and replace `YOUR_SUPABASE_PASSWORD` with your actual Supabase password.

**To get your Supabase password:**
1. Go to https://supabase.com/dashboard/project/mxxjgqhlokmyljdgpwkx/settings/database
2. Find your database password (or reset it)
3. Update the `application.properties` file

### Step 2: Run the Application

```bash
# Navigate to the project directory
cd Java-restfull-api

# Run the application (Windows)
.\mvnw.cmd spring-boot:run

# Or on Mac/Linux
./mvnw spring-boot:run
```

### Step 3: Test the API

The server will start on `http://localhost:8080`

## 📡 API Endpoints

### Health Check
```bash
GET http://localhost:8080/api/users/health
```

### User Sign Up
```bash
POST http://localhost:8080/api/users/signup
Content-Type: application/json

{
  "username": "john_doe",
  "fullName": "John Doe",
  "password": "password123",
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
}
```

### User Login
```bash
POST http://localhost:8080/api/users/login
Content-Type: application/json

{
  "username": "john_doe",
  "password": "password123"
}
```

### Get All Users
```bash
GET http://localhost:8080/api/users
```

### Get User by ID
```bash
GET http://localhost:8080/api/users/1
```

### Get User by Username
```bash
GET http://localhost:8080/api/users/username/john_doe
```

### Update User
```bash
PUT http://localhost:8080/api/users/1
Content-Type: application/json

{
  "username": "john_doe",
  "fullName": "John Updated",
  "password": "newpassword",
  "image": "base64_string"
}
```

### Delete User
```bash
DELETE http://localhost:8080/api/users/1
```

## 🔗 Connect with React Frontend

### Sign Up Example
```javascript
const handleSignUp = async (formData) => {
  const response = await fetch('http://localhost:8080/api/users/signup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username: formData.username,
      fullName: formData.fullName,
      password: formData.password,
      image: formData.image // base64 string
    })
  });
  
  const data = await response.json();
  console.log('User created:', data);
};
```

### Login Example
```javascript
const handleLogin = async (credentials) => {
  const response = await fetch('http://localhost:8080/api/users/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username: credentials.username,
      password: credentials.password
    })
  });
  
  if (response.ok) {
    const user = await response.json();
    console.log('Login successful:', user);
  } else {
    console.log('Login failed');
  }
};
```

## 📁 Project Structure
```
Java-restfull-api/
├── pom.xml
├── README.md
└── src/
    └── main/
        ├── java/
        │   └── com/
        │       └── myapp/
        │           └── App.java
        └── resources/
            └── application.properties
```

## 🗄️ Database Schema

The application will automatically create a `users` table in your Supabase database with the following structure:

```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    image TEXT
);
```

## 🔧 Configuration Details

**Supabase URL:** https://mxxjgqhlokmyljdgpwkx.supabase.co
**Database Host:** db.mxxjgqhlokmyljdgpwkx.supabase.co
**Port:** 5432
**Database:** postgres

## 🛠️ Troubleshooting

### If you get connection errors:
1. Check your Supabase password is correct
2. Verify your IP is allowed in Supabase (Settings → Database → Connection Pooling)
3. Make sure PostgreSQL port 5432 is not blocked by firewall

### If Maven build fails:
```bash
# Clean and rebuild (Windows)
.\mvnw.cmd clean install

# Or on Mac/Linux
./mvnw clean install
```

## 📝 Notes

- Passwords are stored in plain text (for development only)
- In production, use password hashing (BCrypt)
- Base64 images are stored in the database
- CORS is configured for localhost:3000 and localhost:5173
