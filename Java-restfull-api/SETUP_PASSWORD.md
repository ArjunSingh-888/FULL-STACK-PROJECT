# 🔐 IMPORTANT: Supabase Database Password vs API Key

## ⚠️ Understanding the Difference

**Supabase has TWO different credentials:**

### 1. 🔑 API Key (anon/public key) 
   - Used for: REST API, JavaScript clients, authentication
   - Your API Key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - ❌ **NOT used for direct database connection**

### 2. 🔐 Database Password
   - Used for: Direct PostgreSQL connections (like Spring Boot/Java)
   - ✅ **THIS is what you need!**

---

## ✅ How to Get Your Database Password (3 Steps):

### Step 1: Go to Supabase Database Settings

1. **Open this link:**
   https://supabase.com/dashboard/project/mxxjgqhlokmyljdgpwkx/settings/database

2. **Scroll down to find "Database Password" section**

### Step 2: Get the Password

**Option A - If you saved it during project creation:**
   - Use that original password

**Option B - Reset the password (Recommended):**
   - Click the "Reset Database Password" button
   - Copy the new password immediately
   - **⚠️ IMPORTANT:** You can only see it once!

### Step 3: Find Connection String

On the same page, look for **"Connection string"** section:
- Click on "URI" tab
- You'll see something like: `postgresql://postgres:[YOUR-PASSWORD]@db.mxxjgqhlokmyljdgpwkx.supabase.co:5432/postgres`
- Copy the password part from there

### Step 2: Update application.properties

Open this file:
```
Java-restfull-api/src/main/resources/application.properties
```

Replace this line:
```properties
spring.datasource.password=YOUR_SUPABASE_PASSWORD
```

With your actual password:
```properties
spring.datasource.password=your_actual_password_here
```

### Step 3: Run the Application Again

```bash
.\mvnw.cmd spring-boot:run
```

## 📋 Quick Copy-Paste Template

Once you have your password, update `application.properties`:

```properties
server.port=8080

# Supabase Database Configuration
spring.datasource.url=jdbc:postgresql://db.mxxjgqhlokmyljdgpwkx.supabase.co:5432/postgres
spring.datasource.username=postgres
spring.datasource.password=PASTE_YOUR_PASSWORD_HERE

# JPA Configuration
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.properties.hibernate.format_sql=true

# Connection Pool Settings
spring.datasource.hikari.maximum-pool-size=10
spring.datasource.hikari.minimum-idle=5
spring.datasource.hikari.connection-timeout=30000
```

## 🔍 Supabase Connection Details

- **Project URL:** https://mxxjgqhlokmyljdgpwkx.supabase.co
- **Database Host:** db.mxxjgqhlokmyljdgpwkx.supabase.co
- **Port:** 5432
- **Database:** postgres
- **Username:** postgres
- **Password:** ⚠️ YOU NEED TO GET THIS FROM SUPABASE DASHBOARD

## 📝 Alternative: Connection Pooler (If Direct Connection Fails)

If the direct connection doesn't work, try using Supabase's connection pooler:

```properties
spring.datasource.url=jdbc:postgresql://aws-0-ap-south-1.pooler.supabase.com:6543/postgres
```

You can find the exact pooler URL in your Supabase Dashboard under:
**Settings → Database → Connection Pooling**

## ✅ After Fixing

Once you update the password, you should see:
```
🚀 Spring Boot Application Started!
📡 Server running on: http://localhost:8080
📊 API Endpoint: http://localhost:8080/api/users
🗄️  Connected to Supabase Database
```

## 🆘 Still Having Issues?

Make sure:
1. ✅ Password is correct (no extra spaces)
2. ✅ Your IP is allowed in Supabase (Settings → Database → Connection Pooling)
3. ✅ Database is not paused (free tier auto-pauses after inactivity)
