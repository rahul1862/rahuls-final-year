import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { api, getToken, setToken, clearToken } from '../app/utils/api';

function jsonResponse(body: unknown, ok = true, status = 200) {
  return {
    ok,
    status,
    json: async () => body,
  } as Response;
}

describe('api utils', () => {
  describe('getToken / setToken / clearToken', () => {
    it('returns null when no token is stored', () => {
      expect(getToken()).toBeNull();
    });

    it('persists a token to localStorage', () => {
      setToken('abc123');
      expect(getToken()).toBe('abc123');
      expect(localStorage.getItem('vendr-token')).toBe('abc123');
    });

    it('clears the token', () => {
      setToken('abc123');
      clearToken();
      expect(getToken()).toBeNull();
      expect(localStorage.getItem('vendr-token')).toBeNull();
    });
  });

  describe('request (via api.get/post/put/patch)', () => {
    beforeEach(() => {
      vi.stubGlobal('fetch', vi.fn());
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it('resolves with parsed JSON on a successful GET', async () => {
      (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        jsonResponse({ items: [1, 2, 3] })
      );

      const data = await api.get<{ items: number[] }>('/api/cart');
      expect(data).toEqual({ items: [1, 2, 3] });
      expect(fetch).toHaveBeenCalledWith(
        '/api/cart',
        expect.objectContaining({ method: 'GET' })
      );
    });

    it('sends a JSON body and Content-Type header on POST', async () => {
      (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        jsonResponse({ token: 't', user: { id: '1', name: 'A', email: 'a@b.com' } })
      );

      await api.post('/api/auth/login', { email: 'a@b.com', password: 'secret' });

      expect(fetch).toHaveBeenCalledWith('/api/auth/login', expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ email: 'a@b.com', password: 'secret' }),
      }));
    });

    it('adds an Authorization header when a token is present', async () => {
      setToken('my-token');
      (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(jsonResponse({ ok: true }));

      await api.get('/api/orders');

      expect(fetch).toHaveBeenCalledWith('/api/orders', expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer my-token' }),
      }));
    });

    it('omits the Authorization header when no token is present', async () => {
      (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(jsonResponse({ ok: true }));

      await api.get('/api/orders');

      const [, options] = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0];
      expect(options.headers).not.toHaveProperty('Authorization');
    });

    it('throws with the server-provided error message on a non-ok response', async () => {
      (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
        jsonResponse({ error: 'Invalid credentials' }, false, 401)
      );

      await expect(api.post('/api/auth/login', { email: 'x', password: 'y' }))
        .rejects.toThrow('Invalid credentials');
    });

    it('falls back to a status-based message when the error response has no JSON body', async () => {
      (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => { throw new Error('not JSON'); },
      } as unknown as Response);

      await expect(api.get('/api/orders')).rejects.toThrow('Request failed (500)');
    });

    it('propagates a network-level fetch rejection', async () => {
      (fetch as unknown as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new TypeError('Failed to fetch'));

      await expect(api.get('/api/orders')).rejects.toThrow(/fetch/i);
    });
  });
});
