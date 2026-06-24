<template>
  <div class="revenue-report__numbered-list" :class="wrapperClass">
    <h4 v-if="title" class="text-h4">
      {{ title }}
    </h4>
    <ol class="set set_ingroup">
      <li
        v-for="(item, index) in items"
        :key="index"
        class="revenue-report__numbered-list-item"
      >
        <span>
          <template v-for="(part, i) in item.parts" :key="i">
            <span>
              <template v-if="!part.link">
                {{ part.text }}
              </template>
              <a
                v-else
                :href="part.link.href"
                :target="part.link.target || '_blank'"
                @click="handleClick(item)"
              >{{ part.text }}</a>
            </span>
          </template>
        </span>
      </li>
    </ol>
  </div>
</template>

<script>

export default {
  name: "BnovoReportRevenueNumberedList",
  props: {
    title: {
      type: String,
      default: "",
    },
    items: {
      type: Array,
      required: true,
      validator: (items) => items.every(
        (item) => Array.isArray(item.parts)
            && item.parts.length > 0
            && item.parts.every(
              (part) => typeof part.text === "string"
                && (part.link === undefined
                  || (typeof part.link === "object" && typeof part.link.href === "string")),
            ),
      ),
    },
    wrapperClass: {
      type: String,
      default: "",
    },
  },
  methods: {
    handleClick(item) {
      this.$emit("link-click", item.id);
    },
  },
};
</script>

<style scoped lang="scss">
.revenue-report__numbered-list {
  ol {
    list-style: none;
    counter-reset: item;
    padding: 0;
  }

  ol > li {
    counter-increment: item;
    display: block;
    margin-bottom: 12px;

    &::before {
      content: counter(item);
      display: inline-block;
      width: 20px;
      height: 20px;
      line-height: 20px;
      text-align: center;
      border-radius: 16px;
      font-weight: 600;
      font-size: 12px;
      background-color: #e8e9ef;
      margin-right: 4px;
      vertical-align: top;
    }

    span {
      vertical-align: bottom;
    }
  }
}
</style>
