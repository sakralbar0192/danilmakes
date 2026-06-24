<template>
  <v-dialog
    :model-value="isOpen"
    :max-width="width"
    :width="width === '100%' ? '100%' : undefined"
    :fullscreen="width === '100%'"
    scrollable
    :z-index="zIndex"
    @update:model-value="setOpen"
  >
    <slot />
  </v-dialog>
</template>

<script>
import { getCompatModel, setCompatModel } from "@/utils/compat-model";

export default {
  name: "BDialog",
  props: {
    value: { type: Boolean, default: undefined },
    modelValue: { type: Boolean, default: undefined },
    width: { type: [String, Number], default: 560 },
    simple: Boolean,
    size: { type: String, default: "medium" },
    zIndex: { type: Number, default: 2400 },
  },
  emits: ["update:modelValue", "input"],
  computed: {
    isOpen() {
      const v = getCompatModel(this);
      return Boolean(v);
    },
  },
  methods: {
    setOpen(v) {
      setCompatModel(this, v);
    },
  },
};
</script>
