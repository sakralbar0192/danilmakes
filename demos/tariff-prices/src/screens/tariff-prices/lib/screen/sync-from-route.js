/**
 * Синхронизирует Vuex и данные календаря с текущим маршрутом (тариф, dfrom, mode).
 * Ожидает на `vm` методы `normalizeQueryDateFrom`, `getNormalizedMode`, `dispatchInfoTabForMode`, `getData` и поля из mapState.
 *
 * @param {import("vue").default} vm — экземпляр корневого SFC экрана
 */
// eslint-disable-next-line import/prefer-default-export
export async function syncTariffPricesFromRoute(vm, { resetChanges = true } = {}) {
  const tariffId = vm.$route?.params?.id;
  const nextTariff = vm.rplansByIds?.[tariffId] || null;
  if (!nextTariff?.id) {
    return;
  }

  const nextDateFrom = vm.normalizeQueryDateFrom(vm.$route?.query?.dfrom);
  const nextMode = vm.getNormalizedMode(vm.$route, nextTariff);

  if (vm.$route?.query?.dfrom !== nextDateFrom || vm.$route?.query?.mode !== nextMode) {
    await vm.$router.replace({
      params: vm.$route.params,
      query: {
        ...vm.$route.query,
        dfrom: nextDateFrom,
        mode: nextMode,
      },
    });
    return;
  }

  const storeNs = "tariffPricesAndRestrictions";

  if (String(vm.currentTariff?.id || "") !== String(nextTariff?.id || "")) {
    await vm.$store.dispatch(`${storeNs}/setCurrentTariff`, nextTariff);
  }
  if (vm.dateFrom !== nextDateFrom) {
    await vm.$store.dispatch(`${storeNs}/setDateFrom`, nextDateFrom);
  }
  if (vm.mode !== nextMode) {
    await vm.$store.dispatch(`${storeNs}/setCurrentMode`, nextMode);
  }

  vm.dispatchInfoTabForMode(nextMode);

  if (resetChanges) {
    vm.$store.dispatch(`${storeNs}/resetMainChanges`);
  }

  try {
    await vm.getData({ parts: ["base"], releaseLoading: true });
    vm.$store.dispatch(`${storeNs}/loadTableContentParts`).catch(() => {});
  } finally {
    vm.$nextTick(() => {
      vm.$refs?.pageTable?.refreshVirtualizedTableLayout?.({ force: true });
      vm.$refs?.tariffPricesScreenLayout?.scrollFitController?.scheduleRecompute?.();
    });
  }
}
