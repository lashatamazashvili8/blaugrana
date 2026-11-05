export const z = {
  string(msg) {
    return new ZodString(msg);
  },
  object(shape) {
    return new ZodObject(shape);
  },
  enum(values, msg) {
    return new ZodEnum(values, msg);
  }
};

class ZodType {
  refine(fn, msg = 'Invalid value') {
    this.customRefine = { fn, msg };
    return this;
  }
}

class ZodString extends ZodType {
  constructor(customRequiredMsg) {
    super();
    this.requiredMsg = customRequiredMsg || 'This field is required';
    this.rules = [];
  }

  min(length, msg) {
    this.rules.push({
      test: (val) => typeof val === 'string' && val.trim().length >= length,
      msg: msg || `Must be at least ${length} characters`
    });
    return this;
  }

  max(length, msg) {
    this.rules.push({
      test: (val) => typeof val === 'string' && val.trim().length <= length,
      msg: msg || `Must be at most ${length} characters`
    });
    return this;
  }

  email(msg) {
    this.rules.push({
      test: (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(val || '').trim()),
      msg: msg || 'Please enter a valid email address'
    });
    return this;
  }

  regex(pattern, msg) {
    this.rules.push({
      test: (val) => pattern.test(String(val || '')),
      msg: msg || 'Invalid format'
    });
    return this;
  }

  safeParse(val) {
    const value = val === undefined || val === null ? '' : String(val);
    if (!value.trim() && this.rules.length > 0) {
      return { success: false, error: { message: this.requiredMsg } };
    }
    for (const rule of this.rules) {
      if (!rule.test(value)) {
        return { success: false, error: { message: rule.msg } };
      }
    }
    if (this.customRefine && !this.customRefine.fn(value)) {
      return { success: false, error: { message: this.customRefine.msg } };
    }
    return { success: true, data: value };
  }
}

class ZodEnum extends ZodType {
  constructor(allowedValues, msg) {
    super();
    this.allowed = allowedValues;
    this.msg = msg || `Must be one of: ${allowedValues.join(', ')}`;
  }

  safeParse(val) {
    if (!this.allowed.includes(val)) {
      return { success: false, error: { message: this.msg } };
    }
    return { success: true, data: val };
  }
}

class ZodObject extends ZodType {
  constructor(shape) {
    super();
    this.shape = shape;
  }

  refine(fn, msg = 'Validation failed') {
    this.customRefine = { fn, msg };
    return this;
  }

  safeParse(data) {
    const input = data || {};
    const errors = {};
    let hasError = false;

    for (const key of Object.keys(this.shape)) {
      const schema = this.shape[key];
      const result = schema.safeParse(input[key]);
      if (!result.success) {
        errors[key] = result.error.message;
        hasError = true;
      }
    }

    if (this.customRefine && !this.customRefine.fn(input)) {
      errors._general = this.customRefine.msg;
      hasError = true;
    }

    if (hasError) {
      return {
        success: false,
        error: {
          errors,
          format: () => errors
        }
      };
    }

    return { success: true, data: input };
  }
}
