/**
 * Auth Helpers for FindBack
 * Handles Phone validation, Canonical E.164 formatting, Password Strength rules,
 * and Supabase Auth identifier derivations.
 */

export interface PasswordValidationResult {
  isValid: boolean;
  score: number; // 0 to 4
  errors: string[];
  label: 'Too Weak' | 'Weak' | 'Fair' | 'Strong';
  color: string;
}

/**
 * Standardizes raw phone input to canonical E.164 and display formats.
 * Defaults to India (+91) if 10 digits are supplied without a country code.
 */
export function formatPhoneNumber(rawInput: string, defaultCountryCode: string = '+91'): {
  isValid: boolean;
  e164: string;
  formattedDisplay: string;
  digitsOnly: string;
  errorMessage?: string;
} {
  const cleaned = rawInput.trim();
  if (!cleaned) {
    return {
      isValid: false,
      e164: '',
      formattedDisplay: '',
      digitsOnly: '',
      errorMessage: 'Phone number is required.'
    };
  }

  // Remove spaces, hyphens, parentheses
  const stripped = cleaned.replace(/[\s\-\(\)]/g, '');

  let canonicalDigits = '';
  let e164 = '';

  if (stripped.startsWith('+')) {
    // Has explicit country code
    const digits = stripped.substring(1).replace(/\D/g, '');
    if (digits.length < 10 || digits.length > 15) {
      return {
        isValid: false,
        e164: '',
        formattedDisplay: cleaned,
        digitsOnly: digits,
        errorMessage: 'Please enter a valid international phone number (10–15 digits).'
      };
    }
    canonicalDigits = digits;
    e164 = `+${digits}`;
  } else {
    // Digits only - check if it's 10-digit Indian number or includes 91 prefix
    let digits = stripped.replace(/\D/g, '');
    if (digits.length === 11 && digits.startsWith('0')) {
      digits = digits.substring(1);
    }

    if (digits.length === 10) {
      canonicalDigits = `91${digits}`;
      e164 = `+91${digits}`;
    } else if (digits.length === 12 && digits.startsWith('91')) {
      canonicalDigits = digits;
      e164 = `+${digits}`;
    } else if (digits.length >= 10 && digits.length <= 15) {
      canonicalDigits = digits;
      e164 = `+${digits}`;
    } else {
      return {
        isValid: false,
        e164: '',
        formattedDisplay: cleaned,
        digitsOnly: digits,
        errorMessage: 'Please enter a valid 10-digit mobile number.'
      };
    }
  }

  // Indian format display formatter: +91 98400 12345
  let formattedDisplay = e164;
  if (canonicalDigits.startsWith('91') && canonicalDigits.length === 12) {
    const national = canonicalDigits.substring(2);
    formattedDisplay = `+91 ${national.substring(0, 5)} ${national.substring(5)}`;
  }

  return {
    isValid: true,
    e164,
    formattedDisplay,
    digitsOnly: canonicalDigits
  };
}

/**
 * Derives a deterministic email identifier for Supabase Auth's email/password provider.
 * Allows instant password authentication using phone number as the sole user-facing credential
 * without requiring external third-party paid SMS gateway setup.
 */
export function deriveAuthEmailFromPhone(phoneInput: string): string {
  const formatted = formatPhoneNumber(phoneInput);
  const digits = formatted.isValid && formatted.digitsOnly 
    ? formatted.digitsOnly 
    : phoneInput.replace(/\D/g, '');
  return `${digits}@phone.findback.network`;
}

/**
 * Validates password strength according to security best practices.
 */
export function validatePasswordStrength(password: string): PasswordValidationResult {
  const errors: string[] = [];
  let score = 0;

  if (!password || password.length === 0) {
    return {
      isValid: false,
      score: 0,
      errors: ['Password is required.'],
      label: 'Too Weak',
      color: 'bg-outline-variant'
    };
  }

  if (password.length < 6) {
    errors.push('Must be at least 6 characters long.');
  } else {
    score += 1;
  }

  if (password.length >= 8) {
    score += 1;
  }

  if (/[0-9]/.test(password)) {
    score += 1;
  } else {
    errors.push('Must contain at least one number.');
  }

  if (/[a-zA-Z]/.test(password)) {
    score += 1;
  } else {
    errors.push('Must contain at least one letter.');
  }

  let label: PasswordValidationResult['label'] = 'Too Weak';
  let color = 'bg-error';

  if (score === 1) {
    label = 'Weak';
    color = 'bg-error';
  } else if (score === 2 || score === 3) {
    label = 'Fair';
    color = 'bg-secondary';
  } else if (score >= 4) {
    label = 'Strong';
    color = 'bg-tertiary';
  }

  return {
    isValid: errors.length === 0,
    score,
    errors,
    label,
    color
  };
}

/**
 * Validates full name
 */
export function validateFullName(name: string): { isValid: boolean; errorMessage?: string } {
  const trimmed = name.trim();
  if (!trimmed) {
    return { isValid: false, errorMessage: 'Full name is required.' };
  }
  if (trimmed.length < 2) {
    return { isValid: false, errorMessage: 'Name must be at least 2 characters.' };
  }
  return { isValid: true };
}
