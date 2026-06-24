import { VSimpleTable } from "vuetify/lib/components";
import mixins from "vuetify/lib/util/mixins";

export default mixins(VSimpleTable).extend({
  render(h) {
    return h("div", {
      staticClass: "v-data-table",
      ref: "tableRoot",
      class: this.classes,
    }, [this.$slots.top, this.genWrapper(), this.$slots.bottom]);
  },
});
