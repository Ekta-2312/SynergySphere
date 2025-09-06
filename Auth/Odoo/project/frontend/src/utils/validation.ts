/**
 * Input validation and sanitization utilities
 * Provides comprehensive validation for all user inputs
 */

/**
 * Email validation with comprehensive regex
 * @param email - Email string to validate
 * @returns boolean indicating if email is valid
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(email) && email.length <= 254;
};

/**
 * Password strength validation
 * @param password - Password to validate
 * @returns object with validation result and feedback
 */
export const validatePassword = (password: string) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  const score = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar].filter(Boolean).length;
  
  return {
    isValid: password.length >= minLength && score >= 3,
    strength: score <= 1 ? 'weak' : score <= 2 ? 'fair' : score <= 3 ? 'good' : 'strong',
    feedback: {
      length: password.length >= minLength,
      uppercase: hasUpperCase,
      lowercase: hasLowerCase,
      numbers: hasNumbers,
      special: hasSpecialChar
    }
  };
};

/**
 * Sanitize HTML input to prevent XSS attacks
 * @param input - Raw HTML string
 * @returns Sanitized string
 */
export const sanitizeHtml = (input: string): string => {
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
};

/**
 * Validate and sanitize user name
 * @param name - User name to validate
 * @returns Validation result
 */
export const validateName = (name: string) => {
  const trimmed = name.trim();
  const nameRegex = /^[a-zA-Z\s\-']{2,50}$/;
  
  return {
    isValid: nameRegex.test(trimmed) && trimmed.length >= 2,
    sanitized: sanitizeHtml(trimmed),
    errors: [
      ...(trimmed.length < 2 ? ['Name must be at least 2 characters'] : []),
      ...(trimmed.length > 50 ? ['Name must be less than 50 characters'] : []),
      ...(!nameRegex.test(trimmed) ? ['Name contains invalid characters'] : [])
    ]
  };
};

/**
 * Validate project title
 * @param title - Project title to validate
 * @returns Validation result
 */
export const validateProjectTitle = (title: string) => {
  const trimmed = title.trim();
  
  return {
    isValid: trimmed.length >= 3 && trimmed.length <= 100,
    sanitized: sanitizeHtml(trimmed),
    errors: [
      ...(trimmed.length < 3 ? ['Title must be at least 3 characters'] : []),
      ...(trimmed.length > 100 ? ['Title must be less than 100 characters'] : [])
    ]
  };
};

/**
 * Validate task description
 * @param description - Task description to validate
 * @returns Validation result
 */
export const validateDescription = (description: string) => {
  const trimmed = description.trim();
  
  return {
    isValid: trimmed.length <= 1000,
    sanitized: sanitizeHtml(trimmed),
    errors: [
      ...(trimmed.length > 1000 ? ['Description must be less than 1000 characters'] : [])
    ]
  };
};

/**
 * Validate file upload
 * @param file - File to validate
 * @param maxSize - Maximum file size in bytes (default 5MB)
 * @param allowedTypes - Array of allowed MIME types
 * @returns Validation result
 */
export const validateFile = (
  file: File,
  maxSize: number = 5 * 1024 * 1024,
  allowedTypes: string[] = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain']
) => {
  return {
    isValid: file.size <= maxSize && allowedTypes.includes(file.type),
    errors: [
      ...(file.size > maxSize ? [`File size must be less than ${maxSize / (1024 * 1024)}MB`] : []),
      ...(!allowedTypes.includes(file.type) ? ['File type not allowed'] : [])
    ]
  };
};

/**
 * Rate limiting utility for API calls
 */
export class RateLimiter {
  private calls: Map<string, number[]> = new Map();
  
  constructor(private maxCalls: number = 5, private windowMs: number = 60000) {}
  
  /**
   * Check if action is allowed
   * @param key - Unique identifier for the action
   * @returns boolean indicating if action is allowed
   */
  isAllowed(key: string): boolean {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    if (!this.calls.has(key)) {
      this.calls.set(key, []);
    }
    
    const callTimes = this.calls.get(key)!.filter(time => time > windowStart);
    
    if (callTimes.length >= this.maxCalls) {
      return false;
    }
    
    callTimes.push(now);
    this.calls.set(key, callTimes);
    return true;
  }
}

/**
 * Secure token generation
 * @param length - Length of token to generate
 * @returns Cryptographically secure random token
 */
export const generateSecureToken = (length: number = 32): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => chars[byte % chars.length]).join('');
};

/**
 * CSRF token management
 */
export const csrfToken = {
  generate: (): string => generateSecureToken(32),
  
  store: (token: string): void => {
    sessionStorage.setItem('csrf_token', token);
  },
  
  get: (): string | null => {
    return sessionStorage.getItem('csrf_token');
  },
  
  validate: (token: string): boolean => {
    const stored = sessionStorage.getItem('csrf_token');
    return stored === token;
  }
};
