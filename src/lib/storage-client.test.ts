import { describe, it, expect, vi, beforeEach } from 'vitest';
import { uploadFile } from './storage-client';

// Mock dependencies
const mockUpload = vi.fn();
const mockGetPublicUrl = vi.fn();
const mockGetUser = vi.fn();

const mockSupabase = {
  auth: {
    getUser: mockGetUser
  },
  storage: {
    from: vi.fn(() => ({
      upload: mockUpload,
      getPublicUrl: mockGetPublicUrl
    }))
  }
};

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabase
}));

describe('uploadFile', () => {
  // Polyfill File if not available in test env (JSDOM usually has it)
  const mockFile = new File(['content'], 'test.png', { type: 'image/png' });

  beforeEach(() => {
    vi.clearAllMocks();
    // Default success setup
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null });
    mockUpload.mockResolvedValue({ data: { path: 'path/to/file' }, error: null });
    mockGetPublicUrl.mockReturnValue({ data: { publicUrl: 'https://example.com/file.png' } });
  });

  it('should upload file successfully when authenticated', async () => {
    const url = await uploadFile('avatars', mockFile);
    
    expect(mockGetUser).toHaveBeenCalled();
    expect(mockSupabase.storage.from).toHaveBeenCalledWith('avatars');
    expect(mockUpload).toHaveBeenCalled();
    expect(url).toBe('https://example.com/file.png');
  });

  it('should throw error if user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: new Error('Auth error') });

    await expect(uploadFile('avatars', mockFile)).rejects.toThrow('Authentication required');
    expect(mockUpload).not.toHaveBeenCalled();
  });

  it('should throw specific error for RLS policy violation', async () => {
    mockUpload.mockResolvedValue({ 
      data: null, 
      error: { message: 'new row violates row-level security policy' } 
    });

    await expect(uploadFile('avatars', mockFile)).rejects.toThrow('Permission denied');
  });

  it('should throw generic error for other upload failures', async () => {
    mockUpload.mockResolvedValue({ 
      data: null, 
      error: { message: 'Storage quota exceeded' } 
    });

    await expect(uploadFile('avatars', mockFile)).rejects.toThrow('Upload failed: Storage quota exceeded');
  });
});
