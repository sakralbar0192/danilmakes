import { importShared } from './__federation_fn_import-D4I1MtYd.js';
import { c as createBffClient, r as resolveBffBaseUrl, _ as _export_sfc, b as bffPath, a as bffErrorMessage, d as bffErrorFromResponse } from './_plugin-vue_export-helper-CflmyXFI.js';

let defaultClient = null;
function getDefaultBffClient(envValue) {
  if (!defaultClient) {
    defaultClient = createBffClient(resolveBffBaseUrl(envValue));
  }
  return defaultClient;
}

const MEAL_SLOT_LABELS = {
  BREAKFAST: "Завтрак",
  SECOND_BREAKFAST: "Второй завтрак",
  LUNCH: "Обед",
  SNACK: "Полдник",
  DINNER: "Ужин",
  LATE_DINNER: "Поздний ужин"
};

function useBff() {
  return getDefaultBffClient("/familyMeals/bff/v1");
}

const {defineComponent:_defineComponent$5} = await importShared('vue');

const {renderSlot:_renderSlot$3,resolveDynamicComponent:_resolveDynamicComponent,normalizeClass:_normalizeClass$2,withCtx:_withCtx$1,openBlock:_openBlock$5,createBlock:_createBlock,createCommentVNode:_createCommentVNode$4,createElementBlock:_createElementBlock$5,createElementVNode:_createElementVNode$4,Fragment:_Fragment$1} = await importShared('vue');
const {computed: computed$1,useSlots} = await importShared('vue');

const {defineComponent:_defineComponent$4} = await importShared('vue');

const {renderSlot:_renderSlot$2,normalizeClass:_normalizeClass$1,openBlock:_openBlock$4,createElementBlock:_createElementBlock$4} = await importShared('vue');

const _hoisted_1$1 = ["type", "disabled"];
const _sfc_main$1 = /* @__PURE__ */ _defineComponent$4({
  __name: "UiButton",
  props: {
    variant: { default: "primary" },
    size: { default: "md" },
    disabled: { type: Boolean, default: false },
    type: { default: "button" }
  },
  setup(__props) {
    const props = __props;
    return (_ctx, _cache) => {
      return _openBlock$4(), _createElementBlock$4("button", {
        type: props.type,
        class: _normalizeClass$1(["ui-btn", [props.variant, props.size]]),
        disabled: props.disabled
      }, [
        _renderSlot$2(_ctx.$slots, "default", {}, void 0, true)
      ], 10, _hoisted_1$1);
    };
  }
});

const UiButton = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["__scopeId", "data-v-75f51063"]]);

const {useModel:_useModel,mergeModels:_mergeModels,defineComponent:_defineComponent$3} = await importShared('vue');

const {toDisplayString:_toDisplayString$3,openBlock:_openBlock$3,createElementBlock:_createElementBlock$3,createCommentVNode:_createCommentVNode$3,vModelDynamic:_vModelDynamic,mergeProps:_mergeProps,createElementVNode:_createElementVNode$3,withDirectives:_withDirectives$1} = await importShared('vue');

const {defineComponent:_defineComponent$2} = await importShared('vue');

const {toDisplayString:_toDisplayString$2,createElementVNode:_createElementVNode$2,renderSlot:_renderSlot$1,withModifiers:_withModifiers$1,openBlock:_openBlock$2,createElementBlock:_createElementBlock$2,createCommentVNode:_createCommentVNode$2} = await importShared('vue');

const {defineComponent:_defineComponent$1} = await importShared('vue');

const {renderSlot:_renderSlot,toDisplayString:_toDisplayString$1,createElementVNode:_createElementVNode$1,openBlock:_openBlock$1,createElementBlock:_createElementBlock$1,createCommentVNode:_createCommentVNode$1} = await importShared('vue');

const {defineComponent:_defineComponent} = await importShared('vue');

const {createTextVNode:_createTextVNode,unref:_unref,withCtx:_withCtx,createVNode:_createVNode,createElementVNode:_createElementVNode,vModelText:_vModelText,withDirectives:_withDirectives,toDisplayString:_toDisplayString,openBlock:_openBlock,createElementBlock:_createElementBlock,createCommentVNode:_createCommentVNode,renderList:_renderList,Fragment:_Fragment,vModelSelect:_vModelSelect,normalizeClass:_normalizeClass,withModifiers:_withModifiers} = await importShared('vue');

const _hoisted_1 = { class: "mf-root" };
const _hoisted_2 = { class: "planner-week-bar" };
const _hoisted_3 = { class: "shop-panel" };
const _hoisted_4 = { class: "shop-row" };
const _hoisted_5 = {
  key: 0,
  class: "err"
};
const _hoisted_6 = {
  key: 0,
  class: "muted"
};
const _hoisted_7 = {
  key: 1,
  class: "err"
};
const _hoisted_8 = {
  key: 2,
  class: "err"
};
const _hoisted_9 = {
  key: 3,
  class: "layout"
};
const _hoisted_10 = { class: "sidebar" };
const _hoisted_11 = { class: "slot-pick" };
const _hoisted_12 = ["value"];
const _hoisted_13 = {
  class: "rec-list",
  "data-testid": "planner-sidebar-recipes"
};
const _hoisted_14 = ["data-recipe-id", "onDragstart"];
const _hoisted_15 = { class: "week" };
const _hoisted_16 = ["data-focus"];
const _hoisted_17 = ["data-slot-id", "onDragover", "onDragleave", "onDrop"];
const _hoisted_18 = { class: "slot-head" };
const _hoisted_19 = { class: "slot-recipes" };
const _hoisted_20 = ["onDragstart"];
const _hoisted_21 = ["onClick"];
const _hoisted_22 = {
  key: 0,
  class: "muted"
};
const _hoisted_23 = { class: "modal cal" };
const _hoisted_24 = { class: "cal-nav" };
const _hoisted_25 = { class: "dow" };
const _hoisted_26 = { class: "grid" };
const _hoisted_27 = ["disabled", "onClick"];
const {setShellHeader} = await importShared('@meal/shell-chrome');

const {computed,h,onMounted,ref,watch} = await importShared('vue');

const {RouterLink,useRoute,useRouter} = await importShared('vue-router');
const _sfc_main = /* @__PURE__ */ _defineComponent({
  __name: "PlannerPage",
  setup(__props) {
    const route = useRoute();
    const router = useRouter();
    const bff = useBff();
    const week = ref(null);
    const loading = ref(true);
    const error = ref("");
    const slotError = ref("");
    const recipeTitles = ref({});
    const sidebarSearch = ref("");
    const activeSlotId = ref("");
    const shoppingFrom = ref("");
    const shoppingTo = ref("");
    const buildBusy = ref(false);
    const buildError = ref("");
    const monthOpen = ref(false);
    const calYear = ref((/* @__PURE__ */ new Date()).getFullYear());
    const calMonth = ref((/* @__PURE__ */ new Date()).getMonth());
    const dragRecipeId = ref(null);
    const dragOverSlotId = ref(null);
    function todayISODate() {
      const d = /* @__PURE__ */ new Date();
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    }
    function addDays(iso, delta) {
      const [y, mo, da] = iso.split("-").map(Number);
      const d = new Date(Date.UTC(y, mo - 1, da));
      d.setUTCDate(d.getUTCDate() + delta);
      const yy = d.getUTCFullYear();
      const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
      const dd = String(d.getUTCDate()).padStart(2, "0");
      return `${yy}-${mm}-${dd}`;
    }
    const anchorDate = computed(() => {
      const a = route.query.anchorDate;
      const f = route.query.focusDate;
      return a || f || todayISODate();
    });
    const slotOptions = computed(() => {
      if (!week.value) {
        return [];
      }
      const out = [];
      for (const day of week.value.days) {
        for (const s of day.slots) {
          out.push({
            id: s.slotId,
            label: `${day.date} — ${MEAL_SLOT_LABELS[s.slotCode]}`
          });
        }
      }
      return out;
    });
    async function loadRecipeTitles(ids) {
      if (ids.size === 0) {
        return;
      }
      try {
        const res = await bff.json(bffPath("/recipes", { limit: 100, offset: 0 }));
        const m = { ...recipeTitles.value };
        for (const it of res.items) {
          if (ids.has(it.id)) {
            m[it.id] = it.title;
          }
        }
        recipeTitles.value = m;
      } catch {
      }
    }
    async function loadWeek() {
      loading.value = true;
      error.value = "";
      slotError.value = "";
      try {
        const q = {
          anchorDate: anchorDate.value,
          focusDate: route.query.focusDate || void 0,
          recipeSearch: sidebarSearch.value || route.query.recipeSearch || void 0
        };
        const w = await bff.json(bffPath("/plan/week", q));
        week.value = w;
        if (w.recipeSearchHint && !sidebarSearch.value) {
          sidebarSearch.value = w.recipeSearchHint;
        }
        const ids = /* @__PURE__ */ new Set();
        for (const d of w.days) {
          for (const s of d.slots) {
            for (const id of s.recipeIds) {
              ids.add(id);
            }
          }
        }
        await loadRecipeTitles(ids);
        if (!shoppingFrom.value && !shoppingTo.value) {
          shoppingFrom.value = w.weekStart;
          shoppingTo.value = w.weekEnd;
        }
        if (!activeSlotId.value && slotOptions.value.length) {
          activeSlotId.value = slotOptions.value[0].id;
        }
      } catch (e) {
        week.value = null;
        error.value = bffErrorMessage(e);
      } finally {
        loading.value = false;
      }
    }
    onMounted(() => {
      applyPlannerShell();
      sidebarSearch.value = route.query.recipeSearch || "";
      monthOpen.value = route.query.pickDay === "1";
      void loadWeek();
      void loadSidebarRecipes();
    });
    watch(
      () => [route.query.anchorDate, route.query.focusDate, route.query.recipeSearch],
      () => {
        if (route.query.recipeSearch) {
          sidebarSearch.value = route.query.recipeSearch;
        }
        void loadWeek();
      }
    );
    watch(sidebarSearch, () => {
      void loadWeek();
      void loadSidebarRecipes();
    });
    function titleForRecipe(id) {
      return recipeTitles.value[id] ?? id.slice(0, 8) + "…";
    }
    function findSlot(slotId) {
      if (!week.value) {
        return null;
      }
      for (const d of week.value.days) {
        for (const s of d.slots) {
          if (s.slotId === slotId) {
            return s;
          }
        }
      }
      return null;
    }
    async function patchSlot(slot, recipeIds, isRetry = false) {
      slotError.value = "";
      const res = await bff.fetch(`/plan/slots/${slot.slotId}`, {
        method: "PATCH",
        body: JSON.stringify({ recipeIds, expectedVersion: slot.version })
      });
      if (!res.ok) {
        const err = await bffErrorFromResponse(res);
        if (err.code === "VERSION_CONFLICT" && !isRetry) {
          await loadWeek();
          const refreshed = findSlot(slot.slotId);
          if (!refreshed) {
            slotError.value = "Данные плана устарели (другое окно или вкладка). Обновите страницу и повторите действие.";
            return;
          }
          await patchSlot(refreshed, recipeIds, true);
          return;
        }
        if (err.code === "VERSION_CONFLICT") {
          slotError.value = "Данные плана устарели (другое окно или вкладка). Обновляем неделю — повторите действие.";
          await loadWeek();
          return;
        }
        slotError.value = err.message;
        return;
      }
      await loadWeek();
    }
    async function removeRecipeFromSlot(slot, recipeId) {
      const next = slot.recipeIds.filter((id) => id !== recipeId);
      await patchSlot(slot, next);
    }
    async function addRecipeToActiveSlot(recipeId) {
      const slot = activeSlotId.value ? findSlot(activeSlotId.value) : null;
      if (!slot) {
        slotError.value = "Выберите слот.";
        return;
      }
      await moveRecipeToSlot(recipeId, slot.slotId);
    }
    function findSlotForRecipe(recipeId) {
      if (!week.value) {
        return null;
      }
      for (const d of week.value.days) {
        for (const s of d.slots) {
          if (s.recipeIds.includes(recipeId)) {
            return s;
          }
        }
      }
      return null;
    }
    async function moveRecipeToSlot(recipeId, targetSlotId) {
      const target = findSlot(targetSlotId);
      if (!target) {
        return;
      }
      const source = findSlotForRecipe(recipeId);
      if (source?.slotId === targetSlotId) {
        return;
      }
      if (source) {
        await patchSlot(
          source,
          source.recipeIds.filter((id) => id !== recipeId)
        );
        const refreshed = findSlot(targetSlotId);
        if (refreshed && !refreshed.recipeIds.includes(recipeId)) {
          await patchSlot(refreshed, [...refreshed.recipeIds, recipeId]);
        }
        return;
      }
      if (!target.recipeIds.includes(recipeId)) {
        await patchSlot(target, [...target.recipeIds, recipeId]);
      }
    }
    function onRecipeDragStart(event, recipeId) {
      dragRecipeId.value = recipeId;
      event.dataTransfer?.setData("text/recipe-id", recipeId);
      if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = "move";
      }
    }
    function onSlotDragOver(event, slotId) {
      event.preventDefault();
      dragOverSlotId.value = slotId;
      if (event.dataTransfer) {
        event.dataTransfer.dropEffect = "move";
      }
    }
    function onSlotDragLeave(slotId) {
      if (dragOverSlotId.value === slotId) {
        dragOverSlotId.value = null;
      }
    }
    async function onSlotDrop(event, slot) {
      event.preventDefault();
      dragOverSlotId.value = null;
      const recipeId = event.dataTransfer?.getData("text/recipe-id") || dragRecipeId.value;
      dragRecipeId.value = null;
      if (!recipeId) {
        return;
      }
      await moveRecipeToSlot(recipeId, slot.slotId);
    }
    function onDragEnd() {
      dragRecipeId.value = null;
      dragOverSlotId.value = null;
    }
    const sidebarRecipes = ref([]);
    async function loadSidebarRecipes() {
      try {
        const res = await bff.json(
          bffPath("/recipes", {
            q: sidebarSearch.value || void 0,
            limit: 50,
            offset: 0
          })
        );
        sidebarRecipes.value = res.items;
      } catch {
        sidebarRecipes.value = [];
      }
    }
    function shiftWeek(delta) {
      const next = addDays(anchorDate.value, delta);
      void router.replace({ path: "/planner", query: { ...route.query, anchorDate: next, focusDate: next } });
    }
    function presetWeek() {
      if (week.value) {
        shoppingFrom.value = week.value.weekStart;
        shoppingTo.value = week.value.weekEnd;
      }
    }
    function presetTodaySunday() {
      const t = todayISODate();
      shoppingFrom.value = t;
      const d = /* @__PURE__ */ new Date(t + "T12:00:00Z");
      const day = d.getUTCDay();
      const sunOff = day === 0 ? 0 : 7 - day;
      d.setUTCDate(d.getUTCDate() + sunOff);
      const yy = d.getUTCFullYear();
      const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
      const dd = String(d.getUTCDate()).padStart(2, "0");
      shoppingTo.value = `${yy}-${mm}-${dd}`;
    }
    async function buildShopping() {
      buildBusy.value = true;
      buildError.value = "";
      if (!shoppingFrom.value || !shoppingTo.value) {
        buildError.value = "Укажите период «с» и «по».";
        buildBusy.value = false;
        return;
      }
      if (shoppingFrom.value > shoppingTo.value) {
        buildError.value = "Дата «с» не может быть позже «по».";
        buildBusy.value = false;
        return;
      }
      try {
        const res = await bff.json("/shopping/build", {
          method: "POST",
          body: JSON.stringify({ from: shoppingFrom.value, to: shoppingTo.value })
        });
        await router.push({
          path: `/shopping/${res.listId}`,
          query: res.empty ? { empty: "1" } : {}
        });
      } catch (e) {
        buildError.value = bffErrorMessage(e);
      } finally {
        buildBusy.value = false;
      }
    }
    const calLabel = computed(() => {
      const d = new Date(calYear.value, calMonth.value, 1);
      return d.toLocaleString("ru", { month: "long", year: "numeric" });
    });
    const calCells = computed(() => {
      const first = new Date(calYear.value, calMonth.value, 1);
      const startPad = (first.getDay() + 6) % 7;
      const daysInMonth = new Date(calYear.value, calMonth.value + 1, 0).getDate();
      const cells = [];
      for (let i = 0; i < startPad; i++) {
        cells.push({ d: null, iso: null, inMonth: false });
      }
      for (let day = 1; day <= daysInMonth; day++) {
        const iso = `${calYear.value}-${String(calMonth.value + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        cells.push({ d: day, iso, inMonth: true });
      }
      while (cells.length % 7 !== 0) {
        cells.push({ d: null, iso: null, inMonth: false });
      }
      while (cells.length < 42) {
        cells.push({ d: null, iso: null, inMonth: false });
      }
      return cells;
    });
    function openCalendar() {
      const [y, m] = anchorDate.value.split("-").map(Number);
      calYear.value = y;
      calMonth.value = m - 1;
      monthOpen.value = true;
    }
    function pickCalendarDay(iso) {
      if (!iso) {
        return;
      }
      monthOpen.value = false;
      void router.replace({
        path: "/planner",
        query: {
          anchorDate: iso,
          focusDate: iso,
          recipeSearch: route.query.recipeSearch || sidebarSearch.value || void 0
        }
      });
    }
    function prevMonth() {
      if (calMonth.value === 0) {
        calMonth.value = 11;
        calYear.value -= 1;
      } else {
        calMonth.value -= 1;
      }
    }
    function nextMonth() {
      if (calMonth.value === 11) {
        calMonth.value = 0;
        calYear.value += 1;
      } else {
        calMonth.value += 1;
      }
    }
    function formatDateRu(iso) {
      return (/* @__PURE__ */ new Date(`${iso}T12:00:00`)).toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "long",
        year: "numeric"
      });
    }
    const plannerFocusLabel = computed(() => formatDateRu(anchorDate.value));
    function applyPlannerShell() {
      setShellHeader({
        ariaLabel: "Шапка планировщика",
        title: "Планировщик",
        titleAlign: "center",
        showAppNav: true,
        eyebrow: null,
        sublineRender: null,
        leadingRender: () => h(RouterLink, { to: "/recipes", class: "ui-app-header-link--accent" }, () => "К библиотеке"),
        actionsRender: () => h("div", { class: "planner-header-actions" }, [
          h(
            "span",
            { class: "ui-app-header-meta", "data-testid": "planner-week-range" },
            plannerFocusLabel.value
          ),
          h(
            "button",
            {
              type: "button",
              class: "ui-app-header-link",
              "data-testid": "planner-header-shopping-list",
              onClick: openCalendar
            },
            () => "Список покупок"
          )
        ])
      });
    }
    watch(plannerFocusLabel, applyPlannerShell);
    return (_ctx, _cache) => {
      return _openBlock(), _createElementBlock("section", _hoisted_1, [
        _createElementVNode("div", _hoisted_2, [
          _createVNode(_unref(UiButton), {
            type: "button",
            variant: "secondary",
            onClick: _cache[0] || (_cache[0] = ($event) => shiftWeek(-7))
          }, {
            default: _withCtx(() => [..._cache[8] || (_cache[8] = [
              _createTextVNode("← Неделя", -1)
            ])]),
            _: 1
          }),
          _createVNode(_unref(UiButton), {
            type: "button",
            variant: "secondary",
            onClick: _cache[1] || (_cache[1] = ($event) => shiftWeek(7))
          }, {
            default: _withCtx(() => [..._cache[9] || (_cache[9] = [
              _createTextVNode("Неделя →", -1)
            ])]),
            _: 1
          }),
          _createVNode(_unref(UiButton), {
            type: "button",
            variant: "secondary",
            onClick: openCalendar
          }, {
            default: _withCtx(() => [..._cache[10] || (_cache[10] = [
              _createTextVNode("Календарь месяца", -1)
            ])]),
            _: 1
          })
        ]),
        _createElementVNode("section", _hoisted_3, [
          _cache[15] || (_cache[15] = _createElementVNode("h3", null, "Список покупок на период", -1)),
          _createElementVNode("div", _hoisted_4, [
            _createElementVNode("label", null, [
              _cache[11] || (_cache[11] = _createTextVNode(" С ", -1)),
              _withDirectives(_createElementVNode("input", {
                "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => shoppingFrom.value = $event),
                type: "date",
                "data-testid": "planner-shopping-date-from"
              }, null, 512), [
                [_vModelText, shoppingFrom.value]
              ])
            ]),
            _createElementVNode("label", null, [
              _cache[12] || (_cache[12] = _createTextVNode(" По ", -1)),
              _withDirectives(_createElementVNode("input", {
                "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => shoppingTo.value = $event),
                type: "date",
                "data-testid": "planner-shopping-date-to"
              }, null, 512), [
                [_vModelText, shoppingTo.value]
              ])
            ]),
            _createVNode(_unref(UiButton), {
              type: "button",
              variant: "secondary",
              onClick: presetWeek
            }, {
              default: _withCtx(() => [..._cache[13] || (_cache[13] = [
                _createTextVNode("Текущая неделя", -1)
              ])]),
              _: 1
            }),
            _createVNode(_unref(UiButton), {
              type: "button",
              variant: "secondary",
              onClick: presetTodaySunday
            }, {
              default: _withCtx(() => [..._cache[14] || (_cache[14] = [
                _createTextVNode("Сегодня — вс", -1)
              ])]),
              _: 1
            }),
            _createVNode(_unref(UiButton), {
              type: "button",
              "data-testid": "planner-build-shopping-list",
              disabled: buildBusy.value,
              onClick: buildShopping
            }, {
              default: _withCtx(() => [
                _createTextVNode(_toDisplayString(buildBusy.value ? "…" : "Сформировать список покупок"), 1)
              ]),
              _: 1
            }, 8, ["disabled"])
          ]),
          buildError.value ? (_openBlock(), _createElementBlock("p", _hoisted_5, _toDisplayString(buildError.value), 1)) : _createCommentVNode("", true)
        ]),
        loading.value ? (_openBlock(), _createElementBlock("p", _hoisted_6, "Загрузка плана…")) : error.value ? (_openBlock(), _createElementBlock("p", _hoisted_7, _toDisplayString(error.value), 1)) : _createCommentVNode("", true),
        slotError.value ? (_openBlock(), _createElementBlock("p", _hoisted_8, _toDisplayString(slotError.value), 1)) : week.value ? (_openBlock(), _createElementBlock("div", _hoisted_9, [
          _createElementVNode("aside", _hoisted_10, [
            _cache[18] || (_cache[18] = _createElementVNode("h3", null, "Рецепты рядом", -1)),
            _withDirectives(_createElementVNode("input", {
              "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => sidebarSearch.value = $event),
              type: "search",
              placeholder: "Поиск"
            }, null, 512), [
              [_vModelText, sidebarSearch.value]
            ]),
            _createElementVNode("label", _hoisted_11, [
              _cache[16] || (_cache[16] = _createTextVNode(" Слот для добавления ", -1)),
              _withDirectives(_createElementVNode("select", {
                "onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => activeSlotId.value = $event),
                "data-testid": "planner-active-slot"
              }, [
                (_openBlock(true), _createElementBlock(_Fragment, null, _renderList(slotOptions.value, (o) => {
                  return _openBlock(), _createElementBlock("option", {
                    key: o.id,
                    value: o.id
                  }, _toDisplayString(o.label), 9, _hoisted_12);
                }), 128))
              ], 512), [
                [_vModelSelect, activeSlotId.value]
              ])
            ]),
            _createElementVNode("ul", _hoisted_13, [
              (_openBlock(true), _createElementBlock(_Fragment, null, _renderList(sidebarRecipes.value, (r) => {
                return _openBlock(), _createElementBlock("li", {
                  key: r.id,
                  "data-recipe-id": r.id,
                  "data-testid": "planner-sidebar-recipe-row",
                  draggable: "true",
                  class: "draggable-recipe",
                  onDragstart: ($event) => onRecipeDragStart($event, r.id),
                  onDragend: onDragEnd
                }, [
                  _createElementVNode("span", null, _toDisplayString(r.title), 1),
                  _createVNode(_unref(UiButton), {
                    type: "button",
                    size: "sm",
                    onClick: ($event) => addRecipeToActiveSlot(r.id)
                  }, {
                    default: _withCtx(() => [..._cache[17] || (_cache[17] = [
                      _createTextVNode("В слот", -1)
                    ])]),
                    _: 1
                  }, 8, ["onClick"])
                ], 40, _hoisted_14);
              }), 128))
            ])
          ]),
          _createElementVNode("div", _hoisted_15, [
            (_openBlock(true), _createElementBlock(_Fragment, null, _renderList(week.value.days, (day) => {
              return _openBlock(), _createElementBlock("div", {
                key: day.date,
                class: "day",
                "data-focus": day.date === String(_unref(route).query.focusDate || "")
              }, [
                _createElementVNode("h4", null, _toDisplayString(day.date), 1),
                (_openBlock(true), _createElementBlock(_Fragment, null, _renderList(day.slots, (slot) => {
                  return _openBlock(), _createElementBlock("div", {
                    key: slot.slotId,
                    class: _normalizeClass(["slot", { "slot--drag-over": dragOverSlotId.value === slot.slotId }]),
                    "data-testid": "planner-slot-drop",
                    "data-slot-id": slot.slotId,
                    onDragover: ($event) => onSlotDragOver($event, slot.slotId),
                    onDragleave: ($event) => onSlotDragLeave(slot.slotId),
                    onDrop: ($event) => onSlotDrop($event, slot)
                  }, [
                    _createElementVNode("div", _hoisted_18, _toDisplayString(_unref(MEAL_SLOT_LABELS)[slot.slotCode]), 1),
                    _createElementVNode("ul", _hoisted_19, [
                      (_openBlock(true), _createElementBlock(_Fragment, null, _renderList(slot.recipeIds, (rid) => {
                        return _openBlock(), _createElementBlock("li", {
                          key: rid,
                          draggable: "true",
                          class: "draggable-recipe",
                          onDragstart: ($event) => onRecipeDragStart($event, rid),
                          onDragend: onDragEnd
                        }, [
                          _createTextVNode(_toDisplayString(titleForRecipe(rid)) + " ", 1),
                          _createElementVNode("button", {
                            type: "button",
                            class: "link-remove",
                            title: "Убрать",
                            "aria-label": "Убрать рецепт из слота",
                            onClick: ($event) => removeRecipeFromSlot(slot, rid)
                          }, " × ", 8, _hoisted_21)
                        ], 40, _hoisted_20);
                      }), 128)),
                      !slot.recipeIds.length ? (_openBlock(), _createElementBlock("li", _hoisted_22, "Пусто")) : _createCommentVNode("", true)
                    ])
                  ], 42, _hoisted_17);
                }), 128))
              ], 8, _hoisted_16);
            }), 128))
          ])
        ])) : _createCommentVNode("", true),
        monthOpen.value ? (_openBlock(), _createElementBlock("div", {
          key: 4,
          class: "modal-backdrop",
          onClick: _cache[7] || (_cache[7] = _withModifiers(($event) => monthOpen.value = false, ["self"]))
        }, [
          _createElementVNode("div", _hoisted_23, [
            _createElementVNode("div", _hoisted_24, [
              _createVNode(_unref(UiButton), {
                type: "button",
                variant: "secondary",
                onClick: prevMonth
              }, {
                default: _withCtx(() => [..._cache[19] || (_cache[19] = [
                  _createTextVNode("←", -1)
                ])]),
                _: 1
              }),
              _createElementVNode("strong", null, _toDisplayString(calLabel.value), 1),
              _createVNode(_unref(UiButton), {
                type: "button",
                variant: "secondary",
                onClick: nextMonth
              }, {
                default: _withCtx(() => [..._cache[20] || (_cache[20] = [
                  _createTextVNode("→", -1)
                ])]),
                _: 1
              })
            ]),
            _createElementVNode("div", _hoisted_25, [
              (_openBlock(), _createElementBlock(_Fragment, null, _renderList(["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"], (d) => {
                return _createElementVNode("span", { key: d }, _toDisplayString(d), 1);
              }), 64))
            ]),
            _createElementVNode("div", _hoisted_26, [
              (_openBlock(true), _createElementBlock(_Fragment, null, _renderList(calCells.value, (c, i) => {
                return _openBlock(), _createElementBlock("button", {
                  key: i,
                  type: "button",
                  class: "cell",
                  disabled: !c.inMonth,
                  onClick: ($event) => pickCalendarDay(c.iso)
                }, _toDisplayString(c.d ?? ""), 9, _hoisted_27);
              }), 128))
            ]),
            _createVNode(_unref(UiButton), {
              type: "button",
              variant: "secondary",
              onClick: _cache[6] || (_cache[6] = ($event) => monthOpen.value = false)
            }, {
              default: _withCtx(() => [..._cache[21] || (_cache[21] = [
                _createTextVNode("Закрыть", -1)
              ])]),
              _: 1
            })
          ])
        ])) : _createCommentVNode("", true)
      ]);
    };
  }
});

const PlannerPage = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-d3623b9b"]]);

export { PlannerPage as default };
