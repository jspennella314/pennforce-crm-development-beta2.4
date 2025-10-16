'use client';

import { useState, useCallback } from 'react';
import {
  ValidationSchema,
  ValidationErrors,
  validateForm,
  validateField,
  hasErrors,
} from '@/app/lib/validation';

export interface UseFormValidationOptions {
  schema: ValidationSchema;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

export interface UseFormValidationReturn<T> {
  values: T;
  errors: ValidationErrors;
  touched: Record<string, boolean>;
  isValid: boolean;
  isSubmitting: boolean;
  handleChange: (field: string, value: any) => void;
  handleBlur: (field: string) => void;
  handleSubmit: (onSubmit: (values: T) => Promise<void> | void) => (e?: React.FormEvent) => Promise<void>;
  setFieldValue: (field: string, value: any) => void;
  setFieldError: (field: string, error: string) => void;
  setValues: (values: T) => void;
  setErrors: (errors: ValidationErrors) => void;
  resetForm: (newValues?: T) => void;
  validateFormNow: () => boolean;
}

export function useFormValidation<T extends Record<string, any>>(
  initialValues: T,
  options: UseFormValidationOptions
): UseFormValidationReturn<T> {
  const { schema, validateOnChange = false, validateOnBlur = true } = options;

  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback(
    (field: string, value: any) => {
      setValues((prev) => ({ ...prev, [field]: value }));

      if (validateOnChange && schema[field]) {
        const error = validateField(value, schema[field], { ...values, [field]: value });
        setErrors((prev) => ({
          ...prev,
          [field]: error || '',
        }));
      }
    },
    [schema, values, validateOnChange]
  );

  const handleBlur = useCallback(
    (field: string) => {
      setTouched((prev) => ({ ...prev, [field]: true }));

      if (validateOnBlur && schema[field]) {
        const error = validateField(values[field], schema[field], values);
        setErrors((prev) => ({
          ...prev,
          [field]: error || '',
        }));
      }
    },
    [schema, values, validateOnBlur]
  );

  const validateFormNow = useCallback((): boolean => {
    const newErrors = validateForm(values, schema);
    setErrors(newErrors);
    return !hasErrors(newErrors);
  }, [values, schema]);

  const handleSubmit = useCallback(
    (onSubmit: (values: T) => Promise<void> | void) => {
      return async (e?: React.FormEvent) => {
        if (e) {
          e.preventDefault();
        }

        const isValid = validateFormNow();

        if (isValid) {
          try {
            setIsSubmitting(true);
            await onSubmit(values);
          } catch (error: any) {
            // Handle submission errors
            if (error.validationErrors) {
              setErrors(error.validationErrors);
            }
          } finally {
            setIsSubmitting(false);
          }
        } else {
          // Mark all fields as touched to show errors
          const touchedFields = Object.keys(schema).reduce(
            (acc, field) => ({ ...acc, [field]: true }),
            {}
          );
          setTouched(touchedFields);
        }
      };
    },
    [values, schema, validateFormNow]
  );

  const setFieldValue = useCallback((field: string, value: any) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  }, []);

  const setFieldError = useCallback((field: string, error: string) => {
    setErrors((prev) => ({ ...prev, [field]: error }));
  }, []);

  const resetForm = useCallback(
    (newValues?: T) => {
      setValues(newValues || initialValues);
      setErrors({});
      setTouched({});
      setIsSubmitting(false);
    },
    [initialValues]
  );

  const isValid = !hasErrors(errors);

  return {
    values,
    errors,
    touched,
    isValid,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    setFieldError,
    setValues,
    setErrors,
    resetForm,
    validateFormNow,
  };
}

// Helper hook for simple forms without validation
export function useFormValues<T extends Record<string, any>>(initialValues: T) {
  const [values, setValues] = useState<T>(initialValues);

  const handleChange = useCallback((field: string, value: any) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  }, []);

  const setFieldValue = useCallback((field: string, value: any) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  }, []);

  const resetForm = useCallback(() => {
    setValues(initialValues);
  }, [initialValues]);

  return {
    values,
    handleChange,
    setFieldValue,
    setValues,
    resetForm,
  };
}
