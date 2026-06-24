<template>
  <info-block>
    <template #title>
      {{ $t("Закрыть / открыть продажи во всей категории ") }}
    </template>
    <template #content>
      1. {{ $t("По клику на статусы Открыто / Закрыто") }}
    </template>
    <template #footerBlock>
      <div class="d-flex justify-space-between w-full gap-space">
        <sale-availability-status-badge opened class="w-full"/>
        <sale-availability-status-badge class="w-full"/>
      </div>
    </template>
  </info-block>
</template>

<script>
import InfoBlock from "./info-block.vue";
import SaleAvailabilityStatusBadge from "../widgets/sale-availability-status-badge.vue";

export default {
  name: "BnovoTariffPricesAndRestrictionsInstructionsSaleCategoryInfoBlock",
  components: { InfoBlock, SaleAvailabilityStatusBadge },
};
</script>
