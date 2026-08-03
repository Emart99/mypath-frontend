export const API_BASE_URL = process.env.API_BASE_URL ?? "http://localhost:8080";
export const EXPLORE_PAGE_SIZE = 10;
export const PAGE_SIZE = 10;
export const R2_PUBLIC_BASE_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL ?? "";
// Must match the refresh token's server-side lifetime in AuthService.java (backend).
export const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 30;
