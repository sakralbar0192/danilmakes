<template>
  <div class="b-widget-wrapper-response-error d-flex justify-center align-center">
    <v-icon class="icon-cross-circle mr-1 pb-1" small/>
    {{ $t("Ошибка загрузки.") }}
    <b-btn
      color="secondary"
      small
      class="ml-1"
      @click="$emit('reload')"
    >
      <v-icon class="icon-cycle" left/>
      {{ $t("Перезагрузить") }}
    </b-btn>
  </div>
</template>
<script>
export default { name: "BWidgetWrapperResponseError" };
</script>
<style scoped lang="scss">
.b-widget-wrapper-response-error .icon-cross-circle {
  min-height: 150px;

  color: $error;
  font-size: map-get($text-sizes, h4);
}
</style>
