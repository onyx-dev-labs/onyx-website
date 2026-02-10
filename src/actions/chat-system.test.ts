
import { createTeamMember, getAllProfiles } from './chat-system';
import { createClient } from '@/lib/supabase/client';
import { createAdminClient } from '@/lib/supabase/admin';

// Mock dependencies
jest.mock('@/lib/supabase/client');
jest.mock('@/lib/supabase/admin');
jest.mock('@/lib/email', () => ({
  sendInvitationEmail: jest.fn().mockResolvedValue({ success: true })
}));

describe('User Management System', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createTeamMember', () => {
    it('should create a user, profile, and send email without returning password', async () => {
      // Mock Auth User (Admin)
      const mockUser = { id: 'admin-id', email: 'admin@example.com', user_metadata: { role: 'admin' } };
      (createClient as any).mockReturnValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } })
        }
      });

      // Mock Admin Client
      const mockAdminClient = {
        auth: {
          admin: {
            createUser: jest.fn().mockResolvedValue({ 
              data: { user: { id: 'new-user-id', email: 'new@example.com' } }, 
              error: null 
            }),
            deleteUser: jest.fn()
          }
        },
        from: jest.fn().mockReturnValue({
          upsert: jest.fn().mockResolvedValue({ error: null })
        })
      };
      (createAdminClient as any).mockReturnValue(mockAdminClient);

      // Execute
      const result = await createTeamMember('new@example.com', 'New User', 'member');

      // Assert
      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('userId', 'new-user-id');
      expect(result).not.toHaveProperty('password'); // Security check
      expect(result).toHaveProperty('emailSuccess', true);
      
      // Verify calls
      expect(mockAdminClient.auth.admin.createUser).toHaveBeenCalledWith(expect.objectContaining({
        email: 'new@example.com',
        email_confirm: true
      }));
    });

    it('should throw error if non-admin tries to create user', async () => {
      const mockUser = { id: 'user-id', email: 'user@example.com', user_metadata: { role: 'member' } };
      (createClient as any).mockReturnValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: mockUser } })
        }
      });

      await expect(createTeamMember('test@test.com', 'Test', 'member'))
        .rejects.toThrow('Unauthorized: Admin privileges required');
    });
  });

  describe('getAllProfiles', () => {
    it('should return only verified users', async () => {
      // Mock Admin Client List Users
      const mockUsers = [
        { id: '1', email: 'verified@test.com', email_confirmed_at: '2024-01-01' },
        { id: '2', email: 'unverified@test.com', email_confirmed_at: null }
      ];
      
      const mockProfiles = [
        { id: '1', display_name: 'Verified User' }
      ];

      const mockAdminClient = {
        auth: {
          admin: {
            listUsers: jest.fn().mockResolvedValue({ data: { users: mockUsers }, error: null })
          }
        },
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            in: jest.fn().mockReturnValue({
              order: jest.fn().mockResolvedValue({ data: mockProfiles, error: null })
            })
          })
        })
      };
      (createAdminClient as any).mockReturnValue(mockAdminClient);
      (createClient as any).mockReturnValue({
        auth: { getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'admin' } } }) }
      });

      const result = await getAllProfiles();

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
      expect(mockAdminClient.from).toHaveBeenCalledWith('profiles');
    });
  });
});
