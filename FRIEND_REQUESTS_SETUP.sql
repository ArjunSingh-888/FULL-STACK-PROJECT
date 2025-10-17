-- Friend Requests Table Setup for Supabase
-- Copy and paste this into your Supabase SQL Editor

-- Create requests table
CREATE TABLE requests (
    request_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_approved BOOLEAN DEFAULT NULL, -- NULL = pending, TRUE = approved, FALSE = rejected
    responded_at TIMESTAMP WITH TIME ZONE,
    -- Prevent duplicate requests
    CONSTRAINT unique_request UNIQUE (sender_id, receiver_id),
    -- Prevent self-requests
    CONSTRAINT different_users_request CHECK (sender_id != receiver_id)
);

-- Indexes for faster lookups
CREATE INDEX idx_requests_receiver ON requests(receiver_id, is_approved);
CREATE INDEX idx_requests_sender ON requests(sender_id);
CREATE INDEX idx_requests_status ON requests(is_approved);

-- Enable Row Level Security (RLS) - Optional but recommended
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Users can only see requests they're involved in
CREATE POLICY "Users can view their own requests"
ON requests FOR SELECT
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send friend requests"
ON requests FOR INSERT
WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can respond to requests sent to them"
ON requests FOR UPDATE
USING (auth.uid() = receiver_id);

CREATE POLICY "Users can delete their own sent requests"
ON requests FOR DELETE
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Note: If you're using the backend API without Supabase auth, 
-- you may want to disable RLS during development:
-- ALTER TABLE requests DISABLE ROW LEVEL SECURITY;

-- Create a function to get friend count
CREATE OR REPLACE FUNCTION get_friend_count(user_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM requests
    WHERE (sender_id = user_uuid OR receiver_id = user_uuid)
    AND is_approved = TRUE
  );
END;
$$ LANGUAGE plpgsql;

-- Create a function to check if two users are friends
CREATE OR REPLACE FUNCTION are_friends(user1_uuid UUID, user2_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM requests
    WHERE ((sender_id = user1_uuid AND receiver_id = user2_uuid)
       OR (sender_id = user2_uuid AND receiver_id = user1_uuid))
    AND is_approved = TRUE
  );
END;
$$ LANGUAGE plpgsql;

-- Sample queries to test:

-- Get all friends of a user
-- SELECT 
--   CASE 
--     WHEN sender_id = 'YOUR_USER_ID' THEN receiver_id
--     ELSE sender_id
--   END as friend_id
-- FROM requests
-- WHERE (sender_id = 'YOUR_USER_ID' OR receiver_id = 'YOUR_USER_ID')
-- AND is_approved = TRUE;

-- Get pending friend requests for a user
-- SELECT * FROM requests
-- WHERE receiver_id = 'YOUR_USER_ID'
-- AND is_approved IS NULL
-- ORDER BY created_at DESC;

-- Get sent friend requests by a user
-- SELECT * FROM requests
-- WHERE sender_id = 'YOUR_USER_ID'
-- AND is_approved IS NULL
-- ORDER BY created_at DESC;
