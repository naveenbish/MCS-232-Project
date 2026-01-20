/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number (Indian format)
 */
export const isValidPhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone);
};

/**
 * Validate UUID format
 */
export const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

/**
 * Sanitize string input
 */
export const sanitizeString = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

/**
 * Validate rating (1-5)
 */
export const isValidRating = (rating: number): boolean => {
  return rating >= 1 && rating <= 5 && Number.isInteger(rating);
};

/**
 * Validate price (positive number with max 2 decimal places)
 */
export const isValidPrice = (price: number): boolean => {
  return price > 0 && /^\d+(\.\d{1,2})?$/.test(price.toString());
};

/**
 * Validate quantity (positive integer)
 */
export const isValidQuantity = (quantity: number): boolean => {
  return quantity > 0 && Number.isInteger(quantity);
};

/**
 * Validate order status
 */
export const isValidOrderStatus = (status: string): boolean => {
  const validStatuses = [
    'PENDING',
    'CONFIRMED',
    'PREPARING',
    'PREPARED',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'COMPLETED',
    'CANCELLED',
  ];
  return validStatuses.includes(status);
};

/**
 * Validate payment status
 */
export const isValidPaymentStatus = (status: string): boolean => {
  const validStatuses = ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED'];
  return validStatuses.includes(status);
};

/**
 * Check if string is not empty
 */
export const isNotEmpty = (value: string): boolean => {
  return value !== null && value !== undefined && value.trim().length > 0;
};

/**
 * Validate date range
 */
export const isValidDateRange = (startDate: Date, endDate: Date): boolean => {
  return startDate <= endDate;
};

export default {
  isValidEmail,
  isValidPhoneNumber,
  isValidUUID,
  sanitizeString,
  isValidRating,
  isValidPrice,
  isValidQuantity,
  isValidOrderStatus,
  isValidPaymentStatus,
  isNotEmpty,
  isValidDateRange,
};
