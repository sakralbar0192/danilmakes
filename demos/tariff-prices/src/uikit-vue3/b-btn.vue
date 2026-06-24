<template>
  <v-btn
    v-bind="btnProps"
    :class="btnClasses"
    :elevation="elevation"
    :ripple="ripple"
  >
    <slot />
  </v-btn>
</template>

<script>
export default {
  name: "BBtn",
  inheritAttrs: false,
  props: {
    color: { type: String, default: "primary" },
    variant: { type: String, default: undefined },
    outlined: Boolean,
    text: Boolean,
    icon: Boolean,
    small: Boolean,
    large: Boolean,
    disabled: Boolean,
    loading: Boolean,
    value: {},
    squared: Boolean,
    textInline: Boolean,
    fontWeightRegular: Boolean,
    elevation: { type: [Number, String], default: 0 },
    ripple: { type: Boolean, default: false },
  },
  computed: {
    btnProps() {
      const variant = this.variant
        || (this.outlined ? "outlined" : this.text ? "text" : "flat");
      return {
        ...this.$attrs,
        color: this.color,
        variant,
        icon: this.icon,
        size: this.small ? "small" : this.large ? "large" : "default",
        disabled: this.disabled,
        loading: this.loading,
        value: this.value,
      };
    },
    btnClasses() {
      return {
        "v-btn--squared": this.squared,
        "v-btn--text-inline": this.textInline,
        "font-weight-regular": this.fontWeightRegular,
      };
    },
  },
};
</script>
