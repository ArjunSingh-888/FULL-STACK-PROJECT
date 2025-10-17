-- FriendZone Database Setup for Supabase
-- Copy and paste this entire file into your Supabase SQL Editor

-- 1. Users table (should already exist from backend)
-- If not, create it:
CREATE TABLE IF NOT EXISTS users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    user_image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Sessions table (should already exist from backend)
CREATE TABLE IF NOT EXISTS sessions (
    session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    login_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    logout_time TIMESTAMP WITH TIME ZONE,
    device_info VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE
);

-- 3. User Chats table
CREATE TABLE user_chats (
    user_chat_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id_1 UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    user_id_2 UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id_1, user_id_2),
    CHECK (user_id_1 < user_id_2) -- Ensure consistent ordering
);

-- 4. Messages table
CREATE TABLE messages (
    message_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_chat_id UUID NOT NULL REFERENCES user_chats(user_chat_id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    text TEXT,
    images TEXT, -- JSON string containing array of base64 encoded files with metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_read BOOLEAN DEFAULT FALSE
);

-- Indexes for faster message retrieval
CREATE INDEX idx_messages_chat ON messages(user_chat_id, created_at DESC);
CREATE INDEX idx_messages_sender ON messages(sender_id);

-- Indexes for user_chats
CREATE INDEX idx_user_chats_user1 ON user_chats(user_id_1);
CREATE INDEX idx_user_chats_user2 ON user_chats(user_id_2);
CREATE INDEX idx_user_chats_last_message ON user_chats(last_message_at DESC);

-- Enable Row Level Security (RLS) - Optional but recommended
ALTER TABLE user_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Allow users to see only their own chats and messages
-- Policy for user_chats: Users can see chats they're part of
CREATE POLICY "Users can view their own chats"
ON user_chats FOR SELECT
USING (auth.uid() = user_id_1 OR auth.uid() = user_id_2);

CREATE POLICY "Users can create chats"
ON user_chats FOR INSERT
WITH CHECK (auth.uid() = user_id_1 OR auth.uid() = user_id_2);

-- Policy for messages: Users can see messages in their chats
CREATE POLICY "Users can view messages in their chats"
ON messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_chats 
    WHERE user_chats.user_chat_id = messages.user_chat_id 
    AND (user_chats.user_id_1 = auth.uid() OR user_chats.user_id_2 = auth.uid())
  )
);

CREATE POLICY "Users can send messages in their chats"
ON messages FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_chats 
    WHERE user_chats.user_chat_id = messages.user_chat_id 
    AND (user_chats.user_id_1 = auth.uid() OR user_chats.user_id_2 = auth.uid())
  )
);

CREATE POLICY "Users can update their own messages"
ON messages FOR UPDATE
USING (sender_id = auth.uid());

-- Note: If you're using the backend API without Supabase auth, 
-- you may want to disable RLS or adjust these policies accordingly.
-- To disable RLS temporarily during development:
-- ALTER TABLE user_chats DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
