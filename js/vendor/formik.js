export function createFormik({
  initialValues = {},
  validationSchema = null,
  validate = null,
  onSubmit = () => {}
}) {
  const state = {
    values: { ...initialValues },
    errors: {},
    touched: {},
    isSubmitting: false,
    isValid: true
  };

  const listeners = new Set();
  function notify() {
    listeners.forEach((fn) => fn(state));
  }

  function validateValues(vals) {
    let errs = {};
    if (validationSchema) {
      const res = validationSchema.safeParse(vals);
      if (!res.success) {
        errs = { ...res.error.errors };
      }
    }
    if (validate) {
      const customErrs = validate(vals) || {};
      errs = { ...errs, ...customErrs };
    }
    state.errors = errs;
    state.isValid = Object.keys(errs).length === 0;
    return errs;
  }

  function setFieldValue(field, value, shouldValidate = true) {
    state.values[field] = value;
    if (shouldValidate) validateValues(state.values);
    notify();
  }

  function setFieldTouched(field, isTouched = true, shouldValidate = true) {
    state.touched[field] = isTouched;
    if (shouldValidate) validateValues(state.values);
    notify();
  }

  function handleChange(e) {
    const target = e.target;
    const name = target.name || target.id;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    setFieldValue(name, value);
  }

  function handleBlur(e) {
    const target = e.target;
    const name = target.name || target.id;
    setFieldTouched(name, true);
  }

  async function handleSubmit(e) {
    if (e && e.preventDefault) e.preventDefault();
    Object.keys(state.values).forEach((k) => {
      state.touched[k] = true;
    });
    const errs = validateValues(state.values);
    notify();

    if (Object.keys(errs).length > 0) {
      return false;
    }

    state.isSubmitting = true;
    notify();
    try {
      await onSubmit(state.values, {
        setSubmitting: (sub) => {
          state.isSubmitting = sub;
          notify();
        },
        resetForm: () => {
          state.values = { ...initialValues };
          state.errors = {};
          state.touched = {};
          state.isSubmitting = false;
          notify();
        }
      });
      return true;
    } finally {
      state.isSubmitting = false;
      notify();
    }
  }

  function subscribe(fn) {
    listeners.add(fn);
    fn(state);
    return () => listeners.delete(fn);
  }

  validateValues(state.values);

  return {
    get values() { return state.values; },
    get errors() { return state.errors; },
    get touched() { return state.touched; },
    get isSubmitting() { return state.isSubmitting; },
    get isValid() { return state.isValid; },
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    setFieldTouched,
    validateForm: () => validateValues(state.values),
    subscribe
  };
}
