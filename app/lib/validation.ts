// Comprehensive data validation utilities

export interface ValidationRule {
  validate: (value: any, allValues?: any) => boolean;
  message: string;
}

export interface ValidationSchema {
  [field: string]: ValidationRule[];
}

export interface ValidationErrors {
  [field: string]: string;
}

// Built-in validators
export const validators = {
  required: (message = 'This field is required'): ValidationRule => ({
    validate: (value) => {
      if (typeof value === 'string') return value.trim().length > 0;
      if (Array.isArray(value)) return value.length > 0;
      return value !== null && value !== undefined && value !== '';
    },
    message,
  }),

  email: (message = 'Invalid email address'): ValidationRule => ({
    validate: (value) => {
      if (!value) return true; // Optional by default
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value);
    },
    message,
  }),

  minLength: (min: number, message?: string): ValidationRule => ({
    validate: (value) => {
      if (!value) return true;
      return value.length >= min;
    },
    message: message || `Must be at least ${min} characters`,
  }),

  maxLength: (max: number, message?: string): ValidationRule => ({
    validate: (value) => {
      if (!value) return true;
      return value.length <= max;
    },
    message: message || `Must be at most ${max} characters`,
  }),

  min: (min: number, message?: string): ValidationRule => ({
    validate: (value) => {
      if (value === null || value === undefined || value === '') return true;
      return Number(value) >= min;
    },
    message: message || `Must be at least ${min}`,
  }),

  max: (max: number, message?: string): ValidationRule => ({
    validate: (value) => {
      if (value === null || value === undefined || value === '') return true;
      return Number(value) <= max;
    },
    message: message || `Must be at most ${max}`,
  }),

  pattern: (regex: RegExp, message = 'Invalid format'): ValidationRule => ({
    validate: (value) => {
      if (!value) return true;
      return regex.test(value);
    },
    message,
  }),

  phone: (message = 'Invalid phone number'): ValidationRule => ({
    validate: (value) => {
      if (!value) return true;
      // Matches: +1-555-555-5555, (555) 555-5555, 555-555-5555, 5555555555
      const phoneRegex = /^[\+]?[(]?[0-9]{1,3}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,4}[-\s\.]?[0-9]{1,9}$/;
      return phoneRegex.test(value.replace(/\s/g, ''));
    },
    message,
  }),

  url: (message = 'Invalid URL'): ValidationRule => ({
    validate: (value) => {
      if (!value) return true;
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    },
    message,
  }),

  numeric: (message = 'Must be a number'): ValidationRule => ({
    validate: (value) => {
      if (!value) return true;
      return !isNaN(Number(value));
    },
    message,
  }),

  integer: (message = 'Must be an integer'): ValidationRule => ({
    validate: (value) => {
      if (!value) return true;
      return Number.isInteger(Number(value));
    },
    message,
  }),

  positiveNumber: (message = 'Must be a positive number'): ValidationRule => ({
    validate: (value) => {
      if (!value) return true;
      return !isNaN(Number(value)) && Number(value) > 0;
    },
    message,
  }),

  date: (message = 'Invalid date'): ValidationRule => ({
    validate: (value) => {
      if (!value) return true;
      const date = new Date(value);
      return !isNaN(date.getTime());
    },
    message,
  }),

  futureDate: (message = 'Date must be in the future'): ValidationRule => ({
    validate: (value) => {
      if (!value) return true;
      const date = new Date(value);
      return date > new Date();
    },
    message,
  }),

  pastDate: (message = 'Date must be in the past'): ValidationRule => ({
    validate: (value) => {
      if (!value) return true;
      const date = new Date(value);
      return date < new Date();
    },
    message,
  }),

  oneOf: (options: any[], message?: string): ValidationRule => ({
    validate: (value) => {
      if (!value) return true;
      return options.includes(value);
    },
    message: message || `Must be one of: ${options.join(', ')}`,
  }),

  custom: (validateFn: (value: any, allValues?: any) => boolean, message: string): ValidationRule => ({
    validate: validateFn,
    message,
  }),
};

// Validate single field
export function validateField(value: any, rules: ValidationRule[], allValues?: any): string | null {
  for (const rule of rules) {
    if (!rule.validate(value, allValues)) {
      return rule.message;
    }
  }
  return null;
}

// Validate entire form
export function validateForm(values: any, schema: ValidationSchema): ValidationErrors {
  const errors: ValidationErrors = {};

  for (const [field, rules] of Object.entries(schema)) {
    const error = validateField(values[field], rules, values);
    if (error) {
      errors[field] = error;
    }
  }

  return errors;
}

// Check if form has errors
export function hasErrors(errors: ValidationErrors): boolean {
  return Object.keys(errors).length > 0;
}

// Sanitization utilities
export const sanitize = {
  string: (value: any): string => {
    return String(value || '').trim();
  },

  email: (value: any): string => {
    return String(value || '').trim().toLowerCase();
  },

  number: (value: any): number | null => {
    const num = Number(value);
    return isNaN(num) ? null : num;
  },

  boolean: (value: any): boolean => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') return value.toLowerCase() === 'true';
    return Boolean(value);
  },

  date: (value: any): Date | null => {
    if (!value) return null;
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date;
  },

  phone: (value: any): string => {
    // Remove all non-numeric characters except +
    return String(value || '').replace(/[^\d+]/g, '');
  },

  url: (value: any): string => {
    let url = String(value || '').trim();
    if (url && !url.match(/^https?:\/\//)) {
      url = 'https://' + url;
    }
    return url;
  },
};

// Common validation schemas for CRM entities
export const schemas = {
  account: {
    name: [validators.required(), validators.maxLength(200)],
    type: [validators.oneOf(['Customer', 'Prospect', 'Partner', 'Vendor', 'Other'])],
    email: [validators.email()],
    phone: [validators.phone()],
    website: [validators.url()],
  },

  contact: {
    firstName: [validators.required(), validators.maxLength(100)],
    lastName: [validators.required(), validators.maxLength(100)],
    email: [validators.required(), validators.email()],
    phone: [validators.phone()],
  },

  opportunity: {
    name: [validators.required(), validators.maxLength(200)],
    amount: [validators.required(), validators.positiveNumber()],
    closeDate: [validators.required(), validators.date()],
    stage: [
      validators.required(),
      validators.oneOf([
        'QUALIFICATION',
        'PROPOSAL',
        'NEGOTIATION',
        'CLOSED_WON',
        'CLOSED_LOST',
      ]),
    ],
    accountId: [validators.required('Account is required')],
  },

  aircraft: {
    tailNumber: [validators.required(), validators.maxLength(20)],
    manufacturer: [validators.required(), validators.maxLength(100)],
    model: [validators.required(), validators.maxLength(100)],
    year: [validators.integer(), validators.min(1900), validators.max(new Date().getFullYear() + 1)],
    serialNumber: [validators.maxLength(100)],
  },

  task: {
    title: [validators.required(), validators.maxLength(200)],
    dueDate: [validators.date()],
    priority: [validators.oneOf(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])],
    status: [validators.oneOf(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'])],
  },

  user: {
    name: [validators.required(), validators.maxLength(100)],
    email: [validators.required(), validators.email()],
    phone: [validators.phone()],
    role: [validators.required(), validators.oneOf(['admin', 'manager', 'user'])],
  },
};
