    'use server';
import { getAccessToken, refreshAccessToken } from './auth';

export async function authenticatedFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  let token = await getAccessToken();

  let response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 401) {
    const refreshed = await refreshAccessToken();
    
    if (refreshed) {
      token = await getAccessToken();
      response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${token}`,
        },
      });
    }
  }

  return response;
}