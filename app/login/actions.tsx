// app/login/actions.ts
'use server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function authenticate(formData: FormData) {
  const username = formData.get('username');
  const password = formData.get('password');

  const response = await fetch('http://localhost:8080/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    console.error('Login failed:', response.status);
    return { error: 'Invalid credentials' };
  }

  const data = await response.json();
  
  
  if (!data.accessToken || !data.refreshToken) {
    return { error: 'Authentication failed - no tokens received' };
  }
  
  const cookieStore = await cookies();
  
  cookieStore.set('accessToken', data.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 15,
    path: '/',
  });

  cookieStore.set('refreshToken', data.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });


  redirect('/');
}