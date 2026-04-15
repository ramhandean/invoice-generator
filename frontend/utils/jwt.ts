/**
 * Decodes JWT payload without verification (client-side only)
 * WARNING: This does NOT verify the signature. Only use for reading claims.
 */
export function decodeJWT(token: string): Record<string, any> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payload = JSON.parse(
      Buffer.from(parts[1], 'base64').toString('utf-8')
    );
    return payload;
  } catch (error) {
    console.error('Failed to decode JWT:', error);
    return null;
  }
}

/**
 * Get user role from JWT token
 */
export function getRoleFromToken(token: string): string | null {
  const payload = decodeJWT(token);
  return payload?.role || null;
}

/**
 * Get user ID from JWT token
 */
export function getUserIdFromToken(token: string): number | null {
  const payload = decodeJWT(token);
  return payload?.user_id || null;
}
