import { describe, it, expect } from 'vitest';

describe('Checkout - Form Validation', () => {
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhoneNumber = (phone) => {
    const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  const validatePostalCode = (postalCode) => {
    return postalCode.length >= 4 && postalCode.length <= 10;
  };

  const validateCheckoutForm = (formData) => {
    const errors = {};

    if (!formData.firstName || formData.firstName.trim() === '') {
      errors.firstName = 'First name is required';
    }

    if (!formData.lastName || formData.lastName.trim() === '') {
      errors.lastName = 'Last name is required';
    }

    if (!validateEmail(formData.email)) {
      errors.email = 'Valid email is required';
    }

    if (!validatePhoneNumber(formData.phone)) {
      errors.phone = 'Valid phone number is required';
    }

    if (!formData.address || formData.address.trim() === '') {
      errors.address = 'Address is required';
    }

    if (!validatePostalCode(formData.postalCode)) {
      errors.postalCode = 'Valid postal code is required';
    }

    if (!formData.city || formData.city.trim() === '') {
      errors.city = 'City is required';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  };

  it('should validate valid email format', () => {
    expect(validateEmail('user@example.com')).toBe(true);
    expect(validateEmail('test.user@domain.co.uk')).toBe(true);
  });

  it('should reject invalid email format', () => {
    expect(validateEmail('invalid.email')).toBe(false);
    expect(validateEmail('user@')).toBe(false);
    expect(validateEmail('@example.com')).toBe(false);
  });

  it('should validate phone numbers', () => {
    expect(validatePhoneNumber('+1 (555) 123-4567')).toBe(true);
    expect(validatePhoneNumber('5551234567')).toBe(true);
    expect(validatePhoneNumber('555-123-4567')).toBe(true);
  });

  it('should reject invalid phone numbers', () => {
    expect(validatePhoneNumber('123')).toBe(false);
    expect(validatePhoneNumber('abc')).toBe(false);
  });

  it('should validate postal codes', () => {
    expect(validatePostalCode('12345')).toBe(true);
    expect(validatePostalCode('A1A 1A1')).toBe(true);
  });

  it('should reject short postal codes', () => {
    expect(validatePostalCode('12')).toBe(false);
  });

  it('should validate complete checkout form', () => {
    const validForm = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '+1 555-1234567',
      address: '123 Main St',
      postalCode: '12345',
      city: 'New York'
    };

    const result = validateCheckoutForm(validForm);
    expect(result.isValid).toBe(true);
    expect(Object.keys(result.errors)).toHaveLength(0);
  });

  it('should show errors for incomplete form', () => {
    const incompleteForm = {
      firstName: 'John',
      lastName: '',
      email: 'invalid-email',
      phone: '123',
      address: '',
      postalCode: '12',
      city: ''
    };

    const result = validateCheckoutForm(incompleteForm);
    expect(result.isValid).toBe(false);
    expect(result.errors.lastName).toBeDefined();
    expect(result.errors.email).toBeDefined();
    expect(result.errors.phone).toBeDefined();
  });

  it('should validate required fields', () => {
    const emptyForm = {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      postalCode: '',
      city: ''
    };

    const result = validateCheckoutForm(emptyForm);
    expect(result.isValid).toBe(false);
    expect(Object.keys(result.errors).length).toBeGreaterThan(0);
  });

  it('should show specific error messages', () => {
    const invalidForm = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'invalid',
      phone: '123',
      address: '123 Main St',
      postalCode: '12',
      city: 'New York'
    };

    const result = validateCheckoutForm(invalidForm);
    expect(result.errors.email).toBe('Valid email is required');
    expect(result.errors.phone).toBe('Valid phone number is required');
  });
});
