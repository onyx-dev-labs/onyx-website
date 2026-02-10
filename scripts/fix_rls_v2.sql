-- FIX STORAGE RLS POLICIES (V2)
-- Run this in Supabase SQL Editor

-- 1. Reset Policies (Drop existing ones to avoid conflicts)
DROP POLICY IF EXISTS "Public Access Avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload Avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Update Avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Delete Avatars" ON storage.objects;

DROP POLICY IF EXISTS "Authenticated Read Attachments" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload Attachments" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Update Attachments" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Delete Attachments" ON storage.objects;

-- 2. Ensure Buckets Exist and are Configured Correctly
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-attachments', 'chat-attachments', false)
ON CONFLICT (id) DO UPDATE SET public = false;

-- 3. Create Avatars Policies

-- Allow public read access to avatars (so everyone can see profile pics)
CREATE POLICY "Public Access Avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- Allow authenticated users to upload avatars
-- We use (auth.role() = 'authenticated') to be explicit
CREATE POLICY "Authenticated Upload Avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars');

-- Allow users to update their own avatars
CREATE POLICY "Authenticated Update Avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars' AND owner = auth.uid());

-- Allow users to delete their own avatars
CREATE POLICY "Authenticated Delete Avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'avatars' AND owner = auth.uid());

-- 4. Create Chat Attachments Policies

-- Allow authenticated users to read chat attachments
CREATE POLICY "Authenticated Read Attachments"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'chat-attachments');

-- Allow authenticated users to upload chat attachments
CREATE POLICY "Authenticated Upload Attachments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'chat-attachments');

-- Allow users to update their own attachments
CREATE POLICY "Authenticated Update Attachments"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'chat-attachments' AND owner = auth.uid());

-- Allow users to delete their own attachments
CREATE POLICY "Authenticated Delete Attachments"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'chat-attachments' AND owner = auth.uid());
