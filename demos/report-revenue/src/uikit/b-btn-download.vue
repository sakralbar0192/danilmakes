<template>
  <b-btn
    v-bind="$attrs"
    outlined
    squared
    color="tertiary"
    class="b-btn--download"
    :small="small"
    :large="large"
    :loading="loading"
    v-on="$listeners"
  >
    <img :src="imagePath" alt="file-icon">
  </b-btn>
</template>
<script>
import { localImage } from "@/utils/imgfn";

export default {
  name: "BBtnDownload",
  inheritAttrs: false,
  props: {
    type: {
      type: String,
      default: "excel",
      validator: (val) => ["excel", "pdf", "word", "powerpoint"].includes(val),
    },
    small: {
      type: Boolean,
      default: false,
    },
    large: {
      type: Boolean,
      default: false,
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    imagePath() {
      return localImage(`file-types/${this.type}.svg`);
    },
  },
};

</script>
<style lang="scss" scoped>
.b-btn--download {
  $img-sizes: (
    'small': 17,
    'default': 24,
    'large': 27,
  );

  @each $name, $size in $img-sizes {
    &.v-size--#{$name} {
      img {
        width: #{$size}px;
        height: #{$size}px;
      }

      &:focus, &:active {
        border-color: $primary !important;
      }
    }
  }
}

</style>
