# 👥 Friends Feature - Complete Documentation

## ✨ Features Overview

The Friends page provides a complete social connection system with:

### 1. **My Friends Tab**
- View all accepted friends
- Message friends directly
- Remove friends
- Real-time friend count display

### 2. **Requests Tab**
- **Received Requests**: Friend requests you've received
  - Accept or Decline buttons
  - Shows sender info and request date
- **Sent Requests**: Friend requests you've sent
  - Shows pending status
  - Displays when request was sent

### 3. **Find Friends Tab**
- Browse ALL users in the system
- Real-time search by name or username
- See friendship status for each user:
  - ✓ Friends (already connected)
  - ⏳ Request Sent (waiting for response)
  - Accept Request (they sent you a request)
  - + Add Friend (no connection yet)

## 🗄️ Database Structure

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
```

### Requests Table
```sql
CREATE TABLE requests (
    request_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_approved BOOLEAN DEFAULT NULL, -- NULL = pending, TRUE = approved, FALSE = rejected
    responded_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT unique_request UNIQUE (sender_id, receiver_id),
    CONSTRAINT different_users_request CHECK (sender_id != receiver_id)
);
```

## 🔐 Authentication Flow

The Friends page uses **localStorage** for authentication (same as Messages page):

```javascript
// Getting user info from localStorage
const token = localStorage.getItem('authToken');
const userId = localStorage.getItem('userId');
const username = localStorage.getItem('username');
const fullName = localStorage.getItem('fullName');
const userImage = localStorage.getItem('userImage');
```

## 🔄 Data Flow

### 1. On Page Load:
```javascript
useEffect(() => {
  // 1. Check authentication from localStorage
  // 2. Load friends list
  // 3. Load friend requests (received & sent)
  // 4. Load ALL users from database
  // 5. Check friendship status for each user
}, []);
```

### 2. Loading All Users:
```javascript
const loadAllUsers = async (currentUserId) => {
  // Fetch all users from Supabase
  const { data } = await supabase
    .from('users')
    .select('user_id, username, full_name, user_image')
    .neq('user_id', currentUserId) // Exclude current user
    .order('created_at', { ascending: false });
    
  // Check friendship status for each user
  for (const user of data) {
    const status = await checkFriendshipStatus(currentUserId, user.user_id);
    // status can be: 'none', 'sent', 'received', 'friends', 'rejected'
  }
};
```

### 3. Friendship Status States:
- **none**: No connection, show "Add Friend" button
- **sent**: Current user sent request, show "Request Sent" (disabled)
- **received**: Other user sent request, show "Accept Request" button
- **friends**: Already friends, show "✓ Friends" (disabled)
- **rejected**: Request was declined (handled internally)

## 📡 API Functions (from utils/supabase.js)

### Friend Request Functions:

```javascript
// Send friend request
sendFriendRequest(senderId, receiverId)
// Returns: { success: true, request: {...} }

// Get all friend requests (sent & received)
getFriendRequests(userId)
// Returns: { success: true, requests: [...] }

// Accept/Reject friend request
respondToFriendRequest(requestId, isApproved)
// isApproved: true = accept, false = reject
// Returns: { success: true, request: {...} }

// Get all friends (accepted requests)
getFriends(userId)
// Returns: { success: true, friends: [...] }

// Remove friend
removeFriend(userId1, userId2)
// Returns: { success: true }

// Check friendship status between two users
checkFriendshipStatus(userId1, userId2)
// Returns: { success: true, status: 'none'|'sent'|'received'|'friends' }
```

## 🎨 UI Components

### Friend Card
```jsx
<div className="friend-card">
  <div className="friend-avatar">
    {/* User image or placeholder */}
  </div>
  <div className="friend-info">
    <h3>{full_name}</h3>
    <p>@{username}</p>
  </div>
  <div className="friend-actions">
    <button className="btn-message">💬 Message</button>
    <button className="btn-remove">🗑️ Remove</button>
  </div>
</div>
```

### Request Card
```jsx
<div className="request-card">
  <div className="request-avatar">{/* Avatar */}</div>
  <div className="request-info">
    <h3>{full_name}</h3>
    <p>@{username}</p>
    <span className="request-time">{date}</span>
  </div>
  <div className="request-actions">
    <button className="btn-accept">✓ Accept</button>
    <button className="btn-reject">✗ Decline</button>
  </div>
</div>
```

### Search Result Card
```jsx
<div className="search-result-card">
  <div className="result-avatar">{/* Avatar */}</div>
  <div className="result-info">
    <h3>{full_name}</h3>
    <p>@{username}</p>
  </div>
  <div className="result-action">
    {/* Dynamic button based on friendship status */}
    {getActionButton(user)}
  </div>
</div>
```

## 🔍 Search Functionality

### Local Search (Fast & Efficient):
```javascript
const handleSearch = (query) => {
  if (!query.trim()) {
    setSearchResults(allUsers); // Show all users
    return;
  }
  
  // Filter users locally (no API call needed)
  const filtered = allUsers.filter(u => 
    u.username.toLowerCase().includes(query.toLowerCase()) ||
    u.full_name.toLowerCase().includes(query.toLowerCase())
  );
  
  setSearchResults(filtered);
};
```

## 🚀 Setup Instructions

### 1. Run SQL Scripts in Supabase:

**Option 1: Run the complete setup**
```bash
# Open Supabase SQL Editor and run:
FULL-STACK-PROJECT/FRIEND_REQUESTS_SETUP.sql
```

**Option 2: Run individual commands**
```sql
-- Copy from FRIEND_REQUESTS_SETUP.sql
```

### 2. Verify Database:

Check that these tables exist:
- ✅ users
- ✅ requests

### 3. Test the Feature:

1. **Create multiple test users** (via Signup)
2. **Login with User A**
3. **Go to Friends → Find Friends**
4. **You should see all other users**
5. **Send friend request to User B**
6. **Logout and login as User B**
7. **Go to Friends → Requests tab**
8. **Accept the request**
9. **Check Friends tab to see User A**

## 🎯 User Journey

### Scenario 1: Sending Friend Request
1. User A goes to Friends → Find Friends
2. Searches or scrolls to find User B
3. Clicks "+ Add Friend" button
4. Alert: "Friend request sent! ✅"
5. Button changes to "⏳ Request Sent"

### Scenario 2: Receiving Friend Request
1. User B goes to Friends → Requests tab
2. Sees request from User A
3. Clicks "✓ Accept" button
4. Alert: "Friend request accepted! 🎉"
5. User A appears in Friends tab

### Scenario 3: Viewing Friends
1. Go to Friends → My Friends
2. See all accepted friends
3. Click "💬 Message" to chat
4. Click "🗑️ Remove" to unfriend

## 💡 Key Differences from Messages Page

| Feature | Messages | Friends |
|---------|----------|---------|
| **Data Source** | user_chats table | users + requests tables |
| **Initial Load** | Loads user's chats | Loads ALL users |
| **Search** | Searches users table | Filters loaded users locally |
| **Status Check** | Checks if chat exists | Checks friendship status |
| **Authentication** | localStorage ✅ | localStorage ✅ |

## 🐛 Common Issues & Solutions

### Issue 1: "No users found"
**Cause**: No other users in database
**Solution**: Create more users via Signup page

### Issue 2: Friend request fails
**Cause**: Duplicate request or database constraint
**Solution**: Check console for error, verify no existing request

### Issue 3: Status not updating
**Cause**: Page not refreshing after action
**Solution**: loadAllUsers() is called after accept/reject/remove

### Issue 4: Can't see friendship status
**Cause**: checkFriendshipStatus() failing
**Solution**: Verify requests table exists and has correct foreign keys

## 📊 Performance Optimization

### Current Implementation:
- ✅ Loads all users once on page load
- ✅ Local search (no API calls)
- ✅ Status check done in parallel
- ✅ Efficient SQL queries with indexes

### Future Improvements:
- Pagination for large user bases (1000+ users)
- Virtual scrolling for search results
- Caching friendship statuses
- WebSocket for real-time request updates

## 🔐 Security Considerations

### Database Level:
- Row Level Security (RLS) enabled
- Foreign key constraints
- Unique constraints on requests
- Check constraint prevents self-requests

### Application Level:
- Token validation required
- User can only send requests as themselves
- User can only accept requests sent to them
- Duplicate request prevention

## 📱 Responsive Design

### Desktop (> 768px):
- 3-column grid for friends
- Full sidebar visible
- Side-by-side request sections

### Mobile (< 768px):
- Single column layout
- Collapsed sidebar
- Stacked request sections

---

**🎉 Your Friends feature is now fully functional!**

Users can:
- ✅ Browse all registered users
- ✅ Send friend requests
- ✅ Accept/Decline requests
- ✅ View all friends
- ✅ Message friends
- ✅ Remove friends
