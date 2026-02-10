-- RLS is enabled by default on storage.objects, and usually requires owner privileges to change.
-- We skip ALTER TABLE to avoid 42501 errors if running as non-owner.

-- Use DO blocks to create policies only if they don't exist (idempotent)

-- 1. Avatars Bucket Policies

-- Allow public read access to avatars
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Public Access Avatars'
    ) THEN
        CREATE POLICY "Public Access Avatars"
        ON storage.objects FOR SELECT
        TO public
        USING (bucket_id = 'avatars');
    END IF;
END $$;

-- Allow authenticated users to upload avatars
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Authenticated Upload Avatars'
    ) THEN
        CREATE POLICY "Authenticated Upload Avatars"
        ON storage.objects FOR INSERT
        TO authenticated
        WITH CHECK (bucket_id = 'avatars');
    END IF;
END $$;

-- Allow authenticated users to update their own avatars
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Authenticated Update Avatars'
    ) THEN
        CREATE POLICY "Authenticated Update Avatars"
        ON storage.objects FOR UPDATE
        TO authenticated
        USING (bucket_id = 'avatars' AND owner = auth.uid());
    END IF;
END $$;

-- Allow authenticated users to delete their own avatars
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Authenticated Delete Avatars'
    ) THEN
        CREATE POLICY "Authenticated Delete Avatars"
        ON storage.objects FOR DELETE
        TO authenticated
        USING (bucket_id = 'avatars' AND owner = auth.uid());
    END IF;
END $$;


-- 2. Chat Attachments Bucket Policies

-- Allow authenticated users to read chat attachments
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Authenticated Read Attachments'
    ) THEN
        CREATE POLICY "Authenticated Read Attachments"
        ON storage.objects FOR SELECT
        TO authenticated
        USING (bucket_id = 'chat-attachments');
    END IF;
END $$;

-- Allow authenticated users to upload chat attachments
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Authenticated Upload Attachments'
    ) THEN
        CREATE POLICY "Authenticated Upload Attachments"
        ON storage.objects FOR INSERT
        TO authenticated
        WITH CHECK (bucket_id = 'chat-attachments');
    END IF;
END $$;

-- Allow authenticated users to update/delete their own attachments
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Authenticated Update Attachments'
    ) THEN
        CREATE POLICY "Authenticated Update Attachments"
        ON storage.objects FOR UPDATE
        TO authenticated
        USING (bucket_id = 'chat-attachments' AND owner = auth.uid());
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Authenticated Delete Attachments'
    ) THEN
        CREATE POLICY "Authenticated Delete Attachments"
        ON storage.objects FOR DELETE
        TO authenticated
        USING (bucket_id = 'chat-attachments' AND owner = auth.uid());
    END IF;
END $$;
