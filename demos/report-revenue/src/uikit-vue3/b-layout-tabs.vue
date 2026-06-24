<template>
  <v-tabs v-model="tab" density="compact">
    <v-tab v-for="t in tabs" :key="t.value || t.id" :value="t.value || t.id">
      {{ t.text || t.title }}
    </v-tab>
  </v-tabs>
  <slot :tab="tab" />
</template>

<script>
export default {
  name: "BLayoutTabs",
  props: {
    tabs: { type: Array, default: () => [] },
    modelValue: {},
    value: {},
  },
  emits: ["update:modelValue", "change"],
  data() {
    return {
      tab: this.modelValue ?? this.value ?? this.tabs[0]?.value,
    };
  },
  watch: {
    tab(v) {
      this.$emit("update:modelValue", v);
      this.$emit("change", v);
    },
  },
};
</script>
