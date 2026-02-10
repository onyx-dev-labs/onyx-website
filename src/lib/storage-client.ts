
import { createClient } from '@/lib/supabase/client';

export async function uploadFile(
  bucket: 'avatars' | 'chat-attachments',
  file: File,
  path?: string
): Promise<string> {
  const supabase = createClient();
  
  // Verify authentication before upload
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    console.error('Upload failed: User not authenticated', authError);
    throw new Error('Authentication required for file uploads');
  }

  // Generate a unique path if not provided
  const filePath = path || `${Date.now()}-${Math.random().toString(36).substring(7)}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
  
  console.log(`Starting upload to ${bucket}: ${filePath} for user ${user.id}`);

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (uploadError) {
    console.error(`Supabase storage upload error in bucket '${bucket}':`, uploadError);
    
    // Check for RLS policy violation specifically
    if (uploadError.message.includes('row-level security policy') || uploadError.statusCode === '42501') {
       console.error(`RLS Violation details - User: ${user.id}, Bucket: ${bucket}, Path: ${filePath}`);
       throw new Error(`Permission denied: You do not have permission to upload to '${bucket}'. Please ensure you are logged in and the storage policies are applied.`);
    }
    
    throw new Error(`Upload failed: ${uploadError.message}`);
  }

  console.log(`Upload successful: ${filePath}`);

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return publicUrl;
}
