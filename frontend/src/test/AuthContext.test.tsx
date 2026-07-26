import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../app/context/AuthContext';

function jsonResponse(body: unknown, ok = true, status = 200) {
  return { ok, status, json: async () => body } as Response;
}

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('AuthContext', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('starts with no user', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.user).toBeNull();
  });

  it('logs in successfully, persisting session and token', async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      jsonResponse({ token: 'tok-123', user: { id: '1', name: 'Jane Doe', email: 'jane@example.com' } })
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    let response;
    await act(async () => {
      response = await result.current.login('jane@example.com', 'password1');
    });

    expect(response).toEqual({ ok: true });
    expect(result.current.user).toEqual({ id: '1', name: 'Jane Doe', email: 'jane@example.com' });
    expect(localStorage.getItem('vendr-token')).toBe('tok-123');
    expect(JSON.parse(localStorage.getItem('vendr-session') || 'null')).toEqual({
      id: '1', name: 'Jane Doe', email: 'jane@example.com',
    });
  });

  it('returns ok:false with the server error message on failed login (never throws)', async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      jsonResponse({ error: 'Invalid credentials' }, false, 401)
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    let response;
    await act(async () => {
      response = await result.current.login('jane@example.com', 'wrongpass');
    });

    expect(response).toEqual({ ok: false, error: 'Invalid credentials' });
    expect(result.current.user).toBeNull();
    expect(localStorage.getItem('vendr-token')).toBeNull();
  });

  it('registers successfully, persisting session and token', async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      jsonResponse({ token: 'tok-456', user: { id: '2', name: 'New User', email: 'new@example.com' } })
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    let response;
    await act(async () => {
      response = await result.current.register('New User', 'new@example.com', 'password1');
    });

    expect(response).toEqual({ ok: true });
    expect(result.current.user?.email).toBe('new@example.com');
    expect(localStorage.getItem('vendr-token')).toBe('tok-456');
  });

  it('returns ok:false on a failed registration', async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      jsonResponse({ error: 'Email already exists' }, false, 409)
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    let response;
    await act(async () => {
      response = await result.current.register('Dup User', 'dup@example.com', 'password1');
    });

    expect(response).toEqual({ ok: false, error: 'Email already exists' });
    expect(result.current.user).toBeNull();
  });

  it('surfaces a network error message so the UI can show an offline banner', async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new TypeError('Failed to fetch'));

    const { result } = renderHook(() => useAuth(), { wrapper });

    let response;
    await act(async () => {
      response = await result.current.login('jane@example.com', 'password1');
    });

    expect(response.ok).toBe(false);
    expect(response.error).toMatch(/fetch/i);
  });

  it('logout clears both the session and the token', async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      jsonResponse({ token: 'tok-123', user: { id: '1', name: 'Jane Doe', email: 'jane@example.com' } })
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login('jane@example.com', 'password1');
    });
    expect(result.current.user).not.toBeNull();

    act(() => {
      result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(localStorage.getItem('vendr-token')).toBeNull();
    expect(localStorage.getItem('vendr-session')).toBeNull();
  });

  it('loads a previously persisted session on mount', async () => {
    localStorage.setItem('vendr-session', JSON.stringify({ id: '9', name: 'Persisted', email: 'p@example.com' }));
    localStorage.setItem('vendr-token', 'persisted-token');

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.user).toEqual({ id: '9', name: 'Persisted', email: 'p@example.com' });
    });
  });
});
