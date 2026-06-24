import Sortable from "sortablejs";
import { VDataTable } from "vuetify/lib/components";
import { getSlot } from "vuetify/lib/util/helpers";
import mixins from "vuetify/lib/util/mixins";
import VSimpleTable from "./VSimpleTable";

let sortableInstances = [];
let groupedItemsKeeper = new Map();
let dragable = false;
let groupMode = false;

export default mixins(VDataTable).extend({
  props: {
    draggable: {
      type: Boolean,
      default: false,
    },
    leaveGroupCollapsed: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    genDefaultScopedSlot(props) {
      const simpleProps = {
        height: this.height,
        fixedHeader: this.fixedHeader,
      };

      return this.$createElement(VSimpleTable, {
        props: simpleProps,
        ref: "simpleTable",
      }, [this.proxySlot("top", getSlot(this, "top", props, true)), this.genCaption(props), this.genColgroup(props), this.genHeaders(props), this.genBody(props), this.proxySlot("bottom", this.genFooters(props))]);
    },

    genBody(props) {
      const data = {
        ...props,
        expand: this.expand,
        headers: this.computedHeaders,
        isExpanded: this.isExpanded,
        isMobile: this.isMobileDevice,
        isSelected: this.isSelected,
        select: this.select,
      };

      if (this.$scopedSlots.body) {
        return this.$scopedSlots.body(data);
      }
      return props.groupedItems
        ? [getSlot(this, "body.prepend", data, true), this.genItems(props.items, props), getSlot(this, "body.append", data, true)]
        : this.$createElement("tbody", { ref: "tbody" }, [getSlot(this, "body.prepend", data, true), this.genItems(props.items, props), getSlot(this, "body.append", data, true)]);
    },

    genGroupedRows(groupedItems, props) {
      return groupedItems.map(group => {
        if (!this.openCache.hasOwnProperty(group.name) && !this.leaveGroupCollapsed) this.$set(this.openCache, group.name, true);

        const getRow = () => {
          if (this.$scopedSlots.group) {
            return this.$scopedSlots.group({
              group: group.name,
              options: props.options,
              isMobile: this.isMobileDevice,
              items: group.items,
              headers: this.computedHeaders,
            });
          }

          const items = group.items.length === 1 && group.items[0].onlyGroupHeader
            ? []
            : group.items;
          return this.genDefaultGroupedRow(group.name, items, props);
        };

        if (group.name) {
          groupedItemsKeeper.set(group.name, group.items);
        }

        return this.$createElement("tbody", {
          ref: `tbodies${group.name}`,
          attrs: { "group-name": group.name },
        }, getRow());
      });
    },

    createSingleInstance(tbody, isTableRoot = false) {
      const groupName = tbody.getAttribute("group-name") || "";
      const options = {
        animation: 150,
        filter: isTableRoot ? ".v-data-table-header" : ".v-row-group__header",
        handle: !isTableRoot ? "" : ".v-row-group__header",
        direction: "vertical",
        preventOnFilter: false,
        onStart: () => {
          tbody.setAttribute("drag-inside", true);
        },
        onEnd: () => {
          tbody.removeAttribute("drag-inside");
        },
        onUpdate: (event) => {
          if (groupMode) {
            if (isTableRoot) {
              const items = [...groupedItemsKeeper.entries()];
              const movedItem = items.splice(event.oldIndex - 2, 1)[0];
              items.splice(event.newIndex - 2, 0, movedItem);
              groupedItemsKeeper = items.reduce((map, [key, value]) => {
                map.set(key, value);
                return map;
              }, new Map());
              this.$emit("update-items", [...groupedItemsKeeper.values()].flat());
            } else {
              const items = groupedItemsKeeper.get(groupName) || [];
              const movedItem = items.splice(event.oldIndex - 1, 1)[0];
              items.splice(event.newIndex - 1, 0, movedItem);

              this.$emit("update-items", [...groupedItemsKeeper.values()].flat());
            }
          } else {
            const items = [...this.items];
            const movedItem = items.splice(event.oldIndex, 1)[0];
            items.splice(event.newIndex, 0, movedItem);
            this.$emit("update-items", items);
          }
        },
        onMove(event) {
          if (event && event.related && event.related.classList && event.related.classList.contains("v-row-group__header")) {
            return false;
          }
        },
      };
      return Sortable.create(tbody, options);
    },

    createSortableInstances() {
      let tbodies = [];
      if (groupMode) {
        tbodies = Object.entries(this.$refs || {}).reduce((arr, [key, value]) => {
          if (key.includes("tbodies")) {
            arr.push(value);
          }
          return arr;
        }, []);
      } else {
        tbodies = this.$refs && this.$refs.tbody ? [this.$refs.tbody] : [];
      }
      sortableInstances = tbodies.map(tbody => this.createSingleInstance(tbody));
      if (groupMode
        && this.$refs
        && this.$refs.simpleTable
        && this.$refs.simpleTable.$refs
        && this.$refs.simpleTable.$refs.tableRoot) {
        sortableInstances.push(
          this.createSingleInstance(
            this.$refs.simpleTable.$refs.tableRoot.querySelector("table"),
            true,
          ),
        );
      }
    },

    destroySortableInstances() {
      sortableInstances.forEach(instance => instance.destroy());
      sortableInstances = [];
    },

    renewSortableInstances() {
      this.destroySortableInstances();
      this.createSortableInstances();
    },
  },
  async updated() {
    if (this.itemsPerPage >= this.items.length) {
      const newGroupMode = Boolean(Array.isArray(this.groupBy) ? this.groupBy.length : this.groupBy);
      if (
        Boolean(this.draggable) !== dragable
        || (dragable && newGroupMode !== groupMode)
      ) {
        dragable = Boolean(this.draggable);
        groupMode = newGroupMode;
        if (dragable) {
          this.renewSortableInstances();
        } else {
          this.destroySortableInstances();
        }
      }
    }
  },
  async mounted() {
    if (this.itemsPerPage >= this.items.length) {
      dragable = Boolean(this.draggable);
      groupMode = Boolean(Array.isArray(this.groupBy) ? this.groupBy.length : this.groupBy);
      if (dragable) {
        this.createSortableInstances();
      }
    }
  },
});
