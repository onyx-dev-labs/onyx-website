import { describe, it, expect, vi, beforeEach } from 'vitest';
import { login } from './auth';

const mocks = vi.hoisted(() => {
  const signInWithPassword = vi.fn();
  const auth = { signInWithPassword };
  const createClient = vi.fn(() => ({ auth }));
  return {
    signInWithPassword,
    auth,
    createClient,
  };
});

vi.mock('@/lib/supabase/server', () => ({
  createClient: mocks.createClient,
}));

// Mock Next.js
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));
vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));

describe('Auth Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return error if email or password is missing', async () => {
    const formData = new FormData();
    // email missing
    formData.append('password', 'password');

    const result = await login(null, formData);
    expect(result).toEqual({ error: "Email and password are required" });
  });

  it('should return error if sign in fails', async () => {
    mocks.signInWithPassword.mockResolvedValue({ error: { message: 'Invalid login' } });

    const formData = new FormData();
    formData.append('email', 'test@example.com');
    formData.append('password', 'password');

    const result = await login(null, formData);
    expect(result).toEqual({ error: 'Invalid login' });
  });

  it('should redirect on successful login', async () => {
    mocks.signInWithPassword.mockResolvedValue({ error: null });
    const { redirect } = await import('next/navigation');

    const formData = new FormData();
    formData.append('email', 'test@example.com');
    formData.append('password', 'password');

    await login(null, formData);

    expect(mocks.signInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password',
    });
    expect(redirect).toHaveBeenCalledWith('/admin');
  });
});
