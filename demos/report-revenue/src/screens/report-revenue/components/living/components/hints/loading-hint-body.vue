<template>
  <base-hint-template max-width="320">
    <p class="mb-2">
      <b>
        {{ $t("Загрузка") }}
      </b>
    </p>
    <p>
      {{ $t("Вычисляется как отношение количества проданных номеров к количеству доступных для продажи номеров. ") }}
    </p>
    <p>
      {{
        $t(`При расчете количества доступных для продажи номеров из общего количества номеров вычитаются номера,
           закрытые на продажу с причиной «Ремонт» или «Недоступен», если при этом на них нет бронирований.
           Номера, закрытые с причиной «Квота», учитываются как проданные`)
      }}
    </p>
  </base-hint-template>
</template>

<script>
import BaseHintTemplate from "../../../hints/base-hint-template.vue";

export default { name: "BnovoReportRevenueLoadingHint", components: { BaseHintTemplate } };
</script>
