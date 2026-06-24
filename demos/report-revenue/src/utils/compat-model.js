/** Vue 2 `value` / `input` ↔ Vue 3 `modelValue` / `update:modelValue`. */
export function getCompatModel(vm) {
  if (vm.modelValue !== undefined) {
    return vm.modelValue;
  }
  return vm.value;
}

export function setCompatModel(vm, value) {
  vm.$emit("update:modelValue", value);
  vm.$emit("input", value);
}

export default { getCompatModel, setCompatModel };
