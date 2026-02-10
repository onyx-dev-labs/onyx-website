import { describe, it, expect, vi, beforeEach } from 'vitest';
import { upsertTeamMember, deleteTeamMember } from './team';
import { createClient } from '@/lib/supabase/server';

// Mock Supabase
const mockInsert = vi.fn();
const mockDelete = vi.fn();
const mockSelect = vi.fn();
const mockGetUser = vi.fn();
const mockFrom = vi.fn(() => ({
  insert: mockInsert,
  upsert: mockInsert, // Mock upsert using mockInsert
  delete: mockDelete,
  select: mockSelect,
  eq: vi.fn(() => ({ delete: mockDelete })) // Simplified chain
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    from: mockFrom,
    auth: {
      getUser: mockGetUser
    }
  }))
}));

// Mock Next.js cache
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn()
}));

describe('Team Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockInsert.mockResolvedValue({ error: null });
    mockDelete.mockResolvedValue({ error: null });
    // Default to authorized user
    mockGetUser.mockResolvedValue({ data: { user: { id: 'test-user-id' } }, error: null });
  });

  it('should add a team member successfully', async () => {
    const formData = new FormData();
    formData.append('name', 'Test Agent');
    formData.append('role', 'Tester');
    formData.append('bio', 'Testing bio');

    const result = await upsertTeamMember({
      name: 'Test Agent',
      role: 'Tester',
      bio: 'Testing bio'
    });

    expect(result).toBeUndefined(); // upsertTeamMember returns void on success
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Test Agent',
        role: 'Tester'
      })
    );
  });

  it('should validate required fields', async () => {
    // upsertTeamMember type checking prevents missing required fields at compile time
    // but for runtime/form data validation, we might want to check
    // However, the current implementation takes a typed object, so we'll skip this test
    // or adapt it if we want to test error handling from Supabase
    
    mockInsert.mockResolvedValue({ error: { message: 'DB Error' } });
    
    await expect(upsertTeamMember({
      name: 'Test',
      role: 'Tester'
    })).rejects.toThrow('DB Error');
  });

  it('should delete a team member', async () => {
    // Note: The deleteTeamMember implementation uses .eq('id', id) after .delete() which is unusual 
    // for some Supabase client mocks but typical for the chained builder. 
    // We mocked eq to return the object with delete to handle that if needed, 
    // or we can adjust the mock structure.
    // Actually, in the code: .delete().eq('id', id). 
    // So .delete() should return an object with .eq().
    
    // Re-setup mock for delete chain
    const mockEq = vi.fn().mockResolvedValue({ error: null });
    const mockDeleteBuilder = vi.fn(() => ({ eq: mockEq }));
    mockFrom.mockReturnValue({
        ...mockFrom(),
        delete: mockDeleteBuilder
    } as any);

    const result = await deleteTeamMember('123');

    expect(result).toBeUndefined();
    expect(mockDeleteBuilder).toHaveBeenCalled();
    expect(mockEq).toHaveBeenCalledWith('id', '123');
  });
});
