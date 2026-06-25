<script>
export default {
  name: "TariffPricesDynamicVirtualizerItem",
  inject: [
    "$resizeObserver",
    "getKeyField",
    "getSize",
    "hasUnknownSize",
    "markMeasuredSize",
    "markUnknownSize",
    "updateItemSize",
  ],
  props: {
    item: {
      type: Object,
      required: true,
    },
    tag: {
      type: String,
      default: "div",
    },
    active: {
      type: Boolean,
      required: true,
    },
  },
  data() {
    return { sizeObserved: false, pendingSizeUpdate: null };
  },
  computed: {
    id() {
      const key = this.getKeyField();
      if (!(key in this.item)) {
        throw new Error(`KeyField ${key} not found`);
      }

      return this.item[key];
    },
    size() {
      return this.getSize(this.id) || 0;
    },
  },
  watch: {
    id(newValue) {
      this.updateIdAttribute(newValue);

      if (this.sizeObserved) {
        const newSize = this.getSize(newValue);

        if (newSize != null) {
          this.applySize(newSize);
        }
      }

      this.updateSize();
    },
    active(value) {
      if (!this.size) {
        if (value) {
          if (!this.hasUnknownSize(this.id)) {
            this.markUnknownSize(this.id);
          }
        } else if (this.hasUnknownSize(this.id)) {
          this.markMeasuredSize(this.id);
        }
      }

      if (this.$resizeObserver) {
        if (value) {
          this.observeSize();
          this.updateSize();
        } else {
          this.unobserveSize();
        }
      }
    },
  },
  mounted() {
    if (this.active) {
      this.updateSize();
      this.observeSize();
    }
  },
  beforeUnmount() {
    this.unobserveSize();
  },
  methods: {
    observeSize() {
      if (!this.$resizeObserver) {
        return;
      }

      if (this.sizeObserved) {
        return;
      }

      this.$resizeObserver.observe(this.$el);
      this.updateIdAttribute(this.id);
      this.$el.$_onResize = this.onResize;
      this.sizeObserved = true;
    },
    unobserveSize() {
      if (!this.$resizeObserver) {
        return;
      }
      if (!this.sizeObserved) {
        return;
      }

      this.$resizeObserver.unobserve(this.$el);
      this.$el.$_onResize = undefined;
      this.sizeObserved = false;
    },
    updateSize() {
      if (!this.active) {
        return;
      }

      if (this.pendingSizeUpdate === this.id) {
        return;
      }

      this.pendingSizeUpdate = this.id;
      this.computeSize(this.id);
    },
    computeSize(id) {
      this.$nextTick(() => {
        if (this.id === id) {
          this.applySize(this.$el.offsetHeight);
        }
        this.pendingSizeUpdate = null;
      });
    },
    applySize(size) {
      if (size && this.size !== size) {
        this.updateItemSize({ id: this.id, size });
      }
    },
    onResize(id, width, height) {
      if (this.id !== id) {
        return;
      }

      this.applySize(height);
    },
    updateIdAttribute(value) {
      this.$el.$_id = value;
    },
  },
  render(h) {
    return h(this.tag, this.$slots.default);
  },
};
</script>
