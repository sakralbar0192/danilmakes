<script>
import { VBtnToggle } from "vuetify/lib";
import ButtonGroup from "vuetify/lib/mixins/button-group";
import Sizeable from "vuetify/lib/mixins/sizeable";

export default {
  name: "BBtnGroupSeparate",
  extends: VBtnToggle,
  mixins: { Sizeable },
  props: {
    mandatory: {
      type: Boolean,
      default: true,
    },
    group: {
      type: Boolean,
      default: true,
    },
    gap: {
      type: String,
      default: "sm",
    },
    activeClass: {
      type: String,
      default: "v-btn--active",
    },
    color: {
      type: String,
      default: "primary",
    },
    modern: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    classes() {
      return {
        ...ButtonGroup.options.computed.classes.call(this),
        "v-btn-toggle": true,
        "v-btn-toggle--borderless": this.borderless,
        "v-btn-toggle--dense": this.dense,
        "v-btn-toggle--separated": this.group,
        "v-btn-toggle--rounded": this.rounded,
        "v-btn-toggle--shaped": this.shaped,
        "v-btn-toggle--tile": this.tile,
        "v-btn-toggle--modern": this.modern,
        ...this.themeClasses,
        ...this.gapClasses,
      };
    },
    gapClasses() {
      return {
        "v-gap--x-small": this.gap === "xs",
        "v-gap--small": this.gap === "sm",
        "v-gap--default": !this.gap || this.gap === "def",
        "v-gap--large": this.gap === "lg",
        "v-gap--x-large": this.gap === "xl",
        "v-gap--between": this.gap === "between",
      };
    },
  },
  methods: {
    genData() {
      const data = this.setTextColor(this.color, { ...ButtonGroup.options.methods.genData.call(this) });
      if (this.group) return data;
      return this.setBackgroundColor(this.backgroundColor, data);
    },
  },
};
</script>

<style lang="scss">
@import '~vuetify/src/components/VBtnToggle/_variables.scss';

$btn-group-separated-gap: (
  'x-small': 4px,
  'small': 8px,
  'default': 16px,
  'large': 24px,
  'x-large': 32px,
  'between': auto,
);

.demo-v-app {
  .v-btn-toggle {
    &--separated {
      > .v-btn.v-btn {
        border-radius: $border-radius-root;
      }

      @each $name, $gap in $btn-group-separated-gap {
        &.v-gap--#{$name} {
          > .v-btn.v-btn {
            &:not(:first-child) {
              border-left-width: 1px;
              margin-left: $gap;
            }
          }
        }
      }

      &.v-gap--between {
        width: 100%;
      }
    }

    &--modern {
      > .v-btn.v-btn {
        background-color: $white !important;
        opacity: 1 !important;
        color: $main !important;
      }

      > .v-btn.v-btn.v-btn--active {
        outline: $primary solid 2px !important;
        outline-offset: -2px;
      }
    }
  }
}
</style>
