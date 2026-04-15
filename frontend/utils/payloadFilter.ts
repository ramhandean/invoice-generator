import Cookies from 'js-cookie';
import { getRoleFromToken } from './jwt';

/**
 * Filter invoice payload based on user role
 * If role is 'kerani', remove price and total fields
 */
export function filterPayloadByRole(payload: Record<string, any>): Record<string, any> {
  const token = Cookies.get('token');
  if (!token) {
    return payload;
  }

  const role = getRoleFromToken(token);

  if (role === 'kerani') {
    const filtered = { ...payload };

    // Remove total_amount from root
    delete filtered.totalAmount;
    delete filtered.total_amount;

    // Remove price and subtotal from details
    if (filtered.details && Array.isArray(filtered.details)) {
      filtered.details = filtered.details.map((detail: any) => {
        const { price, subtotal, ...rest } = detail;
        return rest;
      });
    }

    return filtered;
  }

  // Admin sends full payload
  return payload;
}
