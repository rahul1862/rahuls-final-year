import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router';
import { Register } from '../app/pages/Register';
import { AuthProvider } from '../app/context/AuthContext';

function jsonResponse(body: unknown, ok = true, status = 200) {
  return { ok, status, json: async () => body } as Response;
}

function renderRegister() {
  return render(
    <MemoryRouter initialEntries={['/register']}>
      <AuthProvider>
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<div>Home Page</div>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
}

async function fillValidFormExcept(user: ReturnType<typeof userEvent.setup>, skip?: string) {
  if (skip !== 'name') await user.type(screen.getByLabelText('Full name'), 'Jane Doe');
  if (skip !== 'email') await user.type(screen.getByLabelText('Email'), 'jane@example.com');
  if (skip !== 'password') await user.type(screen.getByLabelText('Password'), 'password1');
  if (skip !== 'confirm') await user.type(screen.getByLabelText('Confirm password'), 'password1');
}

describe('Register page', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('shows all field errors when submitting an empty form', async () => {
    const user = userEvent.setup();
    renderRegister();

    await user.click(screen.getByRole('button', { name: /create account/i }));

    expect(await screen.findByText('Name is required.')).toBeInTheDocument();
    expect(screen.getByText('Email is required.')).toBeInTheDocument();
    expect(screen.getByText('Password is required.')).toBeInTheDocument();
    expect(screen.getByText('Confirm your password.')).toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
  });

  it('rejects an invalid email format', async () => {
    const user = userEvent.setup();
    renderRegister();

    await fillValidFormExcept(user, 'email');
    await user.type(screen.getByLabelText('Email'), 'not-an-email');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    expect(await screen.findByText('Enter a valid email address.')).toBeInTheDocument();
  });

  it('rejects a password shorter than 8 characters', async () => {
    const user = userEvent.setup();
    renderRegister();

    await fillValidFormExcept(user, 'password');
    await user.type(screen.getByLabelText('Password'), 'ab1');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    expect(await screen.findByText('Use at least 8 characters.')).toBeInTheDocument();
  });

  it('rejects a password with no digit or no letter', async () => {
    const user = userEvent.setup();
    renderRegister();

    await fillValidFormExcept(user, 'password');
    await user.type(screen.getByLabelText('Password'), 'onlyletters');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    expect(await screen.findByText('Include at least one letter and one number.')).toBeInTheDocument();
  });

  it('rejects a mismatched confirmation password', async () => {
    const user = userEvent.setup();
    renderRegister();

    await fillValidFormExcept(user, 'confirm');
    await user.type(screen.getByLabelText('Confirm password'), 'differentpass1');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    expect(await screen.findByText('Passwords do not match.')).toBeInTheDocument();
  });

  it('shows the server error message on a failed registration (e.g. duplicate email)', async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      jsonResponse({ error: 'Email already exists' }, false, 409)
    );
    const user = userEvent.setup();
    renderRegister();

    await fillValidFormExcept(user);
    await user.click(screen.getByRole('button', { name: /create account/i }));

    expect(await screen.findByText('Email already exists')).toBeInTheDocument();
  });

  it('registers successfully and navigates to / on success', async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      jsonResponse({ token: 'tok', user: { id: '1', name: 'Jane Doe', email: 'jane@example.com' } })
    );
    const user = userEvent.setup();
    renderRegister();

    await fillValidFormExcept(user);
    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/auth/register', expect.objectContaining({
        body: JSON.stringify({ name: 'Jane Doe', email: 'jane@example.com', password: 'password1' }),
      }));
    });
    expect(await screen.findByText('Home Page')).toBeInTheDocument();
  });
});
