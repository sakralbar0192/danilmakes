<template>
  <base-hint-template
    max-width="320"
  >
    <p class="mb-2">
      <b>
        {{ $t("RevPAR (Revenue per available room per day) —") }}
      </b>
      {{ $t("доход на доступный номер в день") }}
    </p>
    <p>
      {{
        $t(`Высчитывается делением выручки от продажи номеров на общее количество доступных номеров.
        За выручку принимается объем денежных средств, вне зависимости получены они или нет, за оказанные услуги.
        В выручку от продажи номерного фонда не входит стоимость доп. услуг, включенных в тариф, например, питания.`)
      }}
    </p>
    <p>
      {{
        $t("При построении отчета на будущее, для расчета берется стоимость забронированных услуг проживания, а не выручка, так как услуги еще не оказаны")
      }}
    </p>
  </base-hint-template>
</template>

<script>
import BaseHintTemplate from "../../../hints/base-hint-template.vue";

export default { name: "ReportRevenueRevPARHint", components: { BaseHintTemplate } };
</script>
