import Razorpay from 'razorpay';
import { config } from './env';
import logger from './logger';

let razorpayInstance: Razorpay | null = null;

export const initializeRazorpay = (): Razorpay => {
  try {
    if (!razorpayInstance) {
      if (!config.RAZORPAY_KEY_ID || !config.RAZORPAY_KEY_SECRET) {
        logger.warn('⚠️  Razorpay credentials not configured. Payment features will be disabled.');
        throw new Error('Razorpay credentials not configured');
      }

      razorpayInstance = new Razorpay({
        key_id: config.RAZORPAY_KEY_ID,
        key_secret: config.RAZORPAY_KEY_SECRET,
      });

      logger.info('✅ Razorpay initialized successfully');
    }

    return razorpayInstance;
  } catch (error) {
    logger.error('❌ Failed to initialize Razorpay:', error);
    throw error;
  }
};

export const getRazorpayInstance = (): Razorpay => {
  if (!razorpayInstance) {
    return initializeRazorpay();
  }
  return razorpayInstance;
};

export default {
  initializeRazorpay,
  getRazorpayInstance,
};
