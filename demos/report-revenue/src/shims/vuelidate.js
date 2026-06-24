function createFieldProxy(getValue, setValue, extra = {}) {
  const field = {
    $dirty: false,
    $invalid: false,
    $error: false,
    required: true,
    completePeriod: true,
    checkGreaterThenOneYearPeriod: true,
    minLengthValue: true,
    $touch() {
      field.$dirty = true;
    },
    $reset() {
      field.$dirty = false;
    },
    ...extra,
  };

  Object.defineProperty(field, "$model", {
    get: getValue,
    set: setValue,
  });

  return field;
}

function createEachProxy(items, eachRules = {}) {
  const $iter = {};
  const list = Array.isArray(items) ? items : [];

  list.forEach((item, index) => {
    const entry = {
      uid: item?.uid ?? index,
      $model: item,
    };

    Object.entries(eachRules).forEach(([fieldKey, fieldRules]) => {
      if (fieldKey.startsWith("$")) return;
      entry[fieldKey] = createFieldProxy(
        () => item?.[fieldKey],
        (v) => {
          if (item && typeof item === "object") {
            item[fieldKey] = v;
          }
        },
        fieldRules,
      );
    });

    $iter[index] = entry;
  });

  return {
    $iter,
    $touch() {},
    $reset() {},
    $dirty: false,
    $invalid: false,
  };
}

const EMPTY_FIELD = createFieldProxy(() => undefined, () => {}, { required: true });

function isValidator(value) {
  return typeof value === "function";
}

function isValidationGroup(rule) {
  if (!rule || typeof rule !== "object" || Array.isArray(rule) || rule.$each) return false;
  return Object.entries(rule).some(([key, value]) => {
    if (key.startsWith("$")) return false;
    return isValidator(value) || isValidationGroup(value);
  });
}

function ruleFlags(rule) {
  const flags = {};
  if (!rule || typeof rule !== "object") return flags;
  Object.entries(rule).forEach(([key, value]) => {
    if (key.startsWith("$")) return;
    if (isValidator(value)) flags[key] = true;
  });
  return flags;
}

function buildValidationGroup(rule, getValue) {
  const children = {};
  const node = {
    $dirty: false,
    $invalid: false,
    $error: false,
    $touch() {
      node.$dirty = true;
      Object.values(children).forEach((child) => child.$touch?.());
    },
    $reset() {
      node.$dirty = false;
      Object.values(children).forEach((child) => child.$reset?.());
    },
  };

  Object.entries(rule).forEach(([key, childRule]) => {
    if (key.startsWith("$")) return;
    if (isValidationGroup(childRule)) {
      children[key] = buildValidationGroup(childRule, () => getValue()?.[key]);
    } else {
      children[key] = createFieldProxy(
        () => getValue()?.[key],
        () => {},
        ruleFlags(childRule),
      );
    }
  });

  return new Proxy(node, {
    get(target, prop) {
      if (prop in target) return target[prop];
      if (typeof prop === "string" && children[prop]) return children[prop];
      if (typeof prop === "string" && !prop.startsWith("$")) return EMPTY_FIELD;
      return undefined;
    },
  });
}

function resolveFieldData(vm, key) {
  if (key === "datesPeriods" || key === "datePeriods") {
    return vm.datesPeriods ?? vm.value;
  }
  if (key === "internalValue") {
    if (typeof vm.internalValue !== "undefined") {
      return vm.internalValue;
    }
    return vm.value;
  }
  if (key === "innerValue") {
    return vm.innerValue ?? vm.value;
  }
  if (key === "innerTariffs") {
    return vm.innerTariffs ?? vm.value;
  }
  if (key === "internalPrice") {
    return vm.internalPrice ?? vm.value;
  }
  if (vm[key] !== undefined) {
    return vm[key];
  }
  return vm.value;
}

function build$v(vm) {
  const validations = vm.$options.validations || {};
  const fieldCache = Object.create(null);

  const $v = {
    $dirty: false,
    $invalid: false,
    $error: false,
    $anyError: false,
    $touch() {
      Object.keys(validations).forEach((key) => {
        if (!key.startsWith("$") && $v[key]?.$touch) {
          $v[key].$touch();
        }
      });
      $v.$dirty = true;
    },
    $reset() {
      Object.keys(validations).forEach((key) => {
        if (!key.startsWith("$") && $v[key]?.$reset) {
          $v[key].$reset();
        }
      });
      $v.$dirty = false;
      $v.$invalid = false;
      $v.$error = false;
      $v.$anyError = false;
    },
  };

  Object.entries(validations).forEach(([key, rule]) => {
    if (key.startsWith("$")) return;

    if (rule?.$each) {
      fieldCache[key] = {
        get $each() {
          return createEachProxy(resolveFieldData(vm, key), rule.$each);
        },
        $touch() { $v.$touch(); },
        $reset() { $v.$reset(); },
        get $dirty() { return $v.$dirty; },
        $invalid: false,
      };
      return;
    }

    if (isValidationGroup(rule)) {
      fieldCache[key] = buildValidationGroup(rule, () => resolveFieldData(vm, key));
      return;
    }

    fieldCache[key] = createFieldProxy(
      () => resolveFieldData(vm, key),
      (v) => {
        if (vm[key] !== undefined && typeof vm[key] !== "function") {
          vm[key] = v;
        } else if (key === "internalValue" && vm.internalValue !== undefined) {
          vm.internalValue = v;
        } else if (key === "innerValue" && vm.innerValue !== undefined) {
          vm.innerValue = v;
        } else if (key === "innerTariffs" && vm.innerTariffs !== undefined) {
          vm.innerTariffs = v;
        } else if (key === "internalPrice" && vm.internalPrice !== undefined) {
          vm.internalPrice = v;
        } else if (key === "datesPeriods" && vm.datesPeriods !== undefined) {
          vm.datesPeriods = v;
        }
      },
    );
  });

  return new Proxy($v, {
    get(target, prop) {
      if (prop in target) {
        return target[prop];
      }
      if (typeof prop === "string" && fieldCache[prop]) {
        return fieldCache[prop];
      }
      if (typeof prop === "string" && !prop.startsWith("$")) {
        return EMPTY_FIELD;
      }
      return undefined;
    },
  });
}

export const validationMixin = {
  beforeCreate() {
    this.$v = build$v(this);
  },
  created() {
    if (this.$options.validations) {
      this.$v = build$v(this);
    }
  },
};

export default { validationMixin };
