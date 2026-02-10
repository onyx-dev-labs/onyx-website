-- COMPREHENSIVE RLS FIX FOR CHAT & PROFILES
-- Run this in the Supabase SQL Editor

-- ==============================================================================
-- 1. PROFILES
-- ==============================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read profiles (needed for chat, searching users, avatars)
DROP POLICY IF EXISTS "Public Read Profiles" ON profiles;
CREATE POLICY "Public Read Profiles"
ON profiles FOR SELECT
TO public
USING (true);

-- Allow users to update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- Allow users to insert their own profile (usually handled by trigger, but safe to add)
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- ==============================================================================
-- 2. CONVERSATIONS
-- ==============================================================================
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Allow participants to view conversations
DROP POLICY IF EXISTS "Participants can view conversations" ON conversations;
CREATE POLICY "Participants can view conversations"
ON conversations FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM conversation_participants
    WHERE conversation_participants.conversation_id = conversations.id
    AND conversation_participants.user_id = auth.uid()
  )
);

-- Allow authenticated users to create conversations
DROP POLICY IF EXISTS "Authenticated can create conversations" ON conversations;
CREATE POLICY "Authenticated can create conversations"
ON conversations FOR INSERT
TO authenticated
WITH CHECK (true); -- Server side validation is primary, but this allows client creation if needed

-- ==============================================================================
-- 3. CONVERSATION PARTICIPANTS
-- ==============================================================================
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own participations and participations of chats they are in
DROP POLICY IF EXISTS "View own and related participations" ON conversation_participants;
CREATE POLICY "View own and related participations"
ON conversation_participants FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() OR
  conversation_id IN (
    SELECT conversation_id FROM conversation_participants WHERE user_id = auth.uid()
  )
);

-- Allow authenticated users to join/add to conversations
DROP POLICY IF EXISTS "Authenticated can insert participants" ON conversation_participants;
CREATE POLICY "Authenticated can insert participants"
ON conversation_participants FOR INSERT
TO authenticated
WITH CHECK (true);

-- ==============================================================================
-- 4. MESSAGES
-- ==============================================================================
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Allow participants to read messages
DROP POLICY IF EXISTS "Participants can read messages" ON messages;
CREATE POLICY "Participants can read messages"
ON messages FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM conversation_participants
    WHERE conversation_participants.conversation_id = messages.conversation_id
    AND conversation_participants.user_id = auth.uid()
  )
);

-- Allow participants to send messages
DROP POLICY IF EXISTS "Participants can insert messages" ON messages;
CREATE POLICY "Participants can insert messages"
ON messages FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (
    SELECT 1 FROM conversation_participants
    WHERE conversation_participants.conversation_id = messages.conversation_id
    AND conversation_participants.user_id = auth.uid()
  )
);

-- ==============================================================================
-- 5. STORAGE (RE-APPLY FROM PREVIOUS FIX)
-- ==============================================================================

-- Create buckets if they don't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-attachments', 'chat-attachments', false)
ON CONFLICT (id) DO UPDATE SET public = false;

-- AVATARS POLICIES
DROP POLICY IF EXISTS "Public Access Avatars" ON storage.objects;
CREATE POLICY "Public Access Avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Authenticated Upload Avatars" ON storage.objects;
CREATE POLICY "Authenticated Upload Avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Authenticated Update Avatars" ON storage.objects;
CREATE POLICY "Authenticated Update Avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars' AND owner = auth.uid());

DROP POLICY IF EXISTS "Authenticated Delete Avatars" ON storage.objects;
CREATE POLICY "Authenticated Delete Avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'avatars' AND owner = auth.uid());

-- CHAT ATTACHMENTS POLICIES
DROP POLICY IF EXISTS "Authenticated Read Attachments" ON storage.objects;
CREATE POLICY "Authenticated Read Attachments"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'chat-attachments'); -- Simplified: any auth user can read for now, or tighten if needed

DROP POLICY IF EXISTS "Authenticated Upload Attachments" ON storage.objects;
CREATE POLICY "Authenticated Upload Attachments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'chat-attachments');

-- ==============================================================================
-- 6. REALTIME REPLICATION
-- ==============================================================================
-- Ensure the tables are in the publication for Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
-- (Optional)
ALTER PUBLICATION supabase_realtime ADD TABLE conversation_participants;
