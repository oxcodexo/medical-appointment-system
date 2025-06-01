/**
 * Simple logger utility for consistent logging across the application
 * In a production environment, this would be replaced with a more robust solution like Winston or Pino
 */
const logger = {
  /**
   * Log an info message
   * @param {string} message - The message to log
   * @param {Object} [data] - Optional data to include
   */
  info(message, data) {
    if (process.env.NODE_ENV !== 'test') {
      console.log(`[INFO] ${message}`, data ? data : '');
    }
  },
  
  /**
   * Log a warning message
   * @param {string} message - The message to log
   * @param {Object} [data] - Optional data to include
   */
  warn(message, data) {
    if (process.env.NODE_ENV !== 'test') {
      console.warn(`[WARN] ${message}`, data ? data : '');
    }
  },
  
  /**
   * Log an error message
   * @param {string} message - The message to log
   * @param {Error|Object} [error] - Optional error object or data to include
   */
  error(message, error) {
    if (process.env.NODE_ENV !== 'test') {
      console.error(`[ERROR] ${message}`, error ? error : '');
    }
  },
  
  /**
   * Log a debug message (only in development)
   * @param {string} message - The message to log
   * @param {Object} [data] - Optional data to include
   */
  debug(message, data) {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] ${message}`, data ? data : '');
    }
  }
};

module.exports = logger;
