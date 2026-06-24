<template>
  <b-tooltip-arrowed left :max-width="'185px'">
    <template #activator="{ on, attrs }">
      <div>
        <b-btn-download
          type="excel"
          v-bind="attrs"
          :loading="isLoading"
          :disabled="isLoading"
          v-on="on"
          @click="handleClick"
        />
      </div>
    </template>
    <span>{{ $t("Нажмите на иконку, чтобы скачать excel файл с данными согласно заданным фильтрам") }}</span>
  </b-tooltip-arrowed>
</template>

<script>
export default {
  name: "BnovoReportExcelDownload",
  components: {},
  data() {
    return { isLoading: false };
  },
  methods: {
    handleClick() {
      this.isLoading = true;
      this.$emit("excelDownload", () => {
        this.isLoading = false;
      });
    },
  },
};
</script>
