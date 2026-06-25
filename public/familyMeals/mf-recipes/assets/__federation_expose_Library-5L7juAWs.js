import { importShared } from './__federation_fn_import-D4I1MtYd.js';
import { _ as _export_sfc, b as bffPath, a as bffErrorMessage, d as bffErrorFromResponse } from './_plugin-vue_export-helper-DSX2Nh7D.js';
import { u as useBff } from './useBff-BRmUgJVQ.js';
import { _ as _sfc_main$1, U as UiButton, a as UiModalShell } from './UiRecipeCard.vue_vue_type_style_index_0_scoped_d89a879e_lang-COwfcZ-u.js';

const MEAL_SLOT_CODES = [
  "BREAKFAST",
  "SECOND_BREAKFAST",
  "LUNCH",
  "SNACK",
  "DINNER",
  "LATE_DINNER"
];
const MEAL_SLOT_LABELS = {
  BREAKFAST: "Завтрак",
  SECOND_BREAKFAST: "Второй завтрак",
  LUNCH: "Обед",
  SNACK: "Полдник",
  DINNER: "Ужин",
  LATE_DINNER: "Поздний ужин"
};

const UiRecipeCard = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["__scopeId", "data-v-d89a879e"]]);

const {defineComponent:_defineComponent} = await importShared('vue');

const {createTextVNode:_createTextVNode,unref:_unref,withCtx:_withCtx,createVNode:_createVNode,createElementVNode:_createElementVNode,vModelText:_vModelText,withDirectives:_withDirectives,withModifiers:_withModifiers,openBlock:_openBlock,createElementBlock:_createElementBlock,createCommentVNode:_createCommentVNode,toDisplayString:_toDisplayString,renderList:_renderList,Fragment:_Fragment,vModelSelect:_vModelSelect,createBlock:_createBlock} = await importShared('vue');

const _hoisted_1 = { class: "mf-root" };
const _hoisted_2 = { class: "library-quick" };
const _hoisted_3 = { class: "list-state" };
const _hoisted_4 = {
  key: 0,
  class: "muted"
};
const _hoisted_5 = {
  key: 1,
  class: "err"
};
const _hoisted_6 = {
  key: 2,
  class: "muted"
};
const _hoisted_7 = {
  key: 0,
  class: "cards"
};
const _hoisted_8 = { class: "card-title" };
const _hoisted_9 = {
  key: 0,
  class: "card-meta"
};
const _hoisted_10 = {
  key: 1,
  class: "card-badge"
};
const _hoisted_11 = { class: "plan-modal-body" };
const _hoisted_12 = {
  key: 0,
  class: "recipe-line"
};
const _hoisted_13 = {
  key: 1,
  class: "plan-modal-panel"
};
const _hoisted_14 = {
  key: 2,
  class: "plan-modal-panel"
};
const _hoisted_15 = ["value"];
const _hoisted_16 = {
  key: 3,
  class: "err"
};
const _hoisted_17 = { class: "toast-body" };
const _hoisted_18 = {
  key: 0,
  class: "muted"
};
const {setShellHeader} = await importShared('@meal/shell-chrome');

const {h,onMounted,ref} = await importShared('vue');

const {RouterLink,useRouter} = await importShared('vue-router');
const _sfc_main = /* @__PURE__ */ _defineComponent({
  __name: "Library",
  setup(__props) {
    const router = useRouter();
    const bff = useBff();
    const items = ref([]);
    const total = ref(0);
    const loading = ref(true);
    const error = ref("");
    const q = ref("");
    const mealCategory = ref("");
    const maxCookTimeMinutes = ref("");
    const planModalOpen = ref(false);
    const planStep = ref(1);
    const planRecipe = ref(null);
    const planDate = ref("");
    const planSlotCode = ref(MEAL_SLOT_CODES[0]);
    const planBusy = ref(false);
    const planError = ref("");
    const toastOpen = ref(false);
    const toastContext = ref(null);
    async function loadList() {
      loading.value = true;
      error.value = "";
      try {
        const path = bffPath("/recipes", {
          q: q.value || void 0,
          mealCategory: mealCategory.value || void 0,
          maxCookTimeMinutes: maxCookTimeMinutes.value === "" ? void 0 : maxCookTimeMinutes.value,
          limit: 50,
          offset: 0
        });
        const res = await bff.json(path);
        items.value = res.items;
        total.value = res.total;
      } catch (e) {
        error.value = bffErrorMessage(e);
      } finally {
        loading.value = false;
      }
    }
    onMounted(() => {
      setShellHeader({
        ariaLabel: "Шапка библиотеки",
        title: "Рецепты",
        showAppNav: true,
        eyebrow: null,
        leadingRender: null,
        sublineRender: null,
        actionsRender: () => h(RouterLink, { to: "/recipes/import", class: "ui-app-header-link--accent" }, () => "Импорт по URL")
      });
      void loadList();
    });
    function openPlanModal(r) {
      planRecipe.value = r;
      planDate.value = todayISODate();
      planSlotCode.value = MEAL_SLOT_CODES[0];
      planError.value = "";
      planStep.value = 1;
      planModalOpen.value = true;
    }
    function closePlanModal() {
      planModalOpen.value = false;
      planRecipe.value = null;
      planStep.value = 1;
      planError.value = "";
    }
    function goToPlanStep2() {
      if (!planDate.value) {
        planError.value = "Укажите дату.";
        return;
      }
      planError.value = "";
      planStep.value = 2;
    }
    function backToPlanStep1() {
      planStep.value = 1;
      planError.value = "";
    }
    function todayISODate() {
      const d = /* @__PURE__ */ new Date();
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    }
    function findSlot(week, date, code) {
      const day = week.days.find((d) => d.date === date);
      if (!day) {
        return null;
      }
      return day.slots.find((s) => s.slotCode === code) ?? null;
    }
    async function confirmAddToPlan() {
      if (!planRecipe.value || !planDate.value) {
        return;
      }
      planBusy.value = true;
      planError.value = "";
      const recipeTitle = planRecipe.value.title;
      const dateIso = planDate.value;
      const slotLabel = MEAL_SLOT_LABELS[planSlotCode.value];
      try {
        const week = await bff.json(
          bffPath("/plan/week", { anchorDate: planDate.value })
        );
        const slot = findSlot(week, planDate.value, planSlotCode.value);
        if (!slot) {
          planError.value = "Слот не найден для выбранной даты.";
          return;
        }
        const nextIds = [.../* @__PURE__ */ new Set([...slot.recipeIds, planRecipe.value.id])];
        const res = await bff.fetch(`/plan/slots/${slot.slotId}`, {
          method: "PATCH",
          body: JSON.stringify({
            recipeIds: nextIds,
            expectedVersion: slot.version
          })
        });
        if (!res.ok) {
          const err = await bffErrorFromResponse(res);
          if (err.code === "VERSION_CONFLICT") {
            planError.value = "План изменился. Закройте окно и откройте «В план» снова, либо обновите планировщик.";
            return;
          }
          planError.value = err.message;
          return;
        }
        closePlanModal();
        toastContext.value = { recipeTitle, date: dateIso, slotLabel };
        toastOpen.value = true;
      } catch (e) {
        planError.value = bffErrorMessage(e);
      } finally {
        planBusy.value = false;
      }
    }
    function closeToast() {
      toastOpen.value = false;
      toastContext.value = null;
    }
    function openPlannerFromToast() {
      if (!toastContext.value) {
        return;
      }
      const { date } = toastContext.value;
      closeToast();
      void router.push({
        path: "/planner",
        query: { anchorDate: date, focusDate: date }
      });
    }
    async function deleteRecipe(r) {
      if (!confirm(`Удалить «${r.title}»?`)) {
        return;
      }
      try {
        const res = await bff.fetch(`/recipes/${r.id}`, { method: "DELETE" });
        if (!res.ok) {
          error.value = (await bffErrorFromResponse(res)).message;
          return;
        }
        await loadList();
      } catch (e) {
        error.value = bffErrorMessage(e);
      }
    }
    return (_ctx, _cache) => {
      return _openBlock(), _createElementBlock("section", _hoisted_1, [
        _createElementVNode("div", _hoisted_2, [
          _createVNode(_unref(RouterLink), {
            class: "quick-link",
            to: "/recipes/new"
          }, {
            default: _withCtx(() => [..._cache[5] || (_cache[5] = [
              _createTextVNode("Создать рецепт", -1)
            ])]),
            _: 1
          }),
          _createVNode(_unref(RouterLink), {
            class: "quick-link",
            to: "/planner?pickDay=1"
          }, {
            default: _withCtx(() => [..._cache[6] || (_cache[6] = [
              _createTextVNode("Планировщик", -1)
            ])]),
            _: 1
          })
        ]),
        _createElementVNode("form", {
          class: "filters",
          onSubmit: _withModifiers(loadList, ["prevent"])
        }, [
          _withDirectives(_createElementVNode("input", {
            "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => q.value = $event),
            type: "search",
            placeholder: "Поиск по названию",
            "aria-label": "Поиск"
          }, null, 512), [
            [_vModelText, q.value]
          ]),
          _withDirectives(_createElementVNode("input", {
            "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => mealCategory.value = $event),
            type: "text",
            placeholder: "Категория приёма пищи"
          }, null, 512), [
            [_vModelText, mealCategory.value]
          ]),
          _withDirectives(_createElementVNode("input", {
            "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => maxCookTimeMinutes.value = $event),
            type: "number",
            min: "1",
            placeholder: "Макс. время (мин)"
          }, null, 512), [
            [
              _vModelText,
              maxCookTimeMinutes.value,
              void 0,
              { number: true }
            ]
          ]),
          _cache[7] || (_cache[7] = _createElementVNode("button", {
            type: "submit",
            class: "btn"
          }, "Найти", -1))
        ], 32),
        _createElementVNode("div", _hoisted_3, [
          loading.value ? (_openBlock(), _createElementBlock("p", _hoisted_4, "Загрузка…")) : error.value ? (_openBlock(), _createElementBlock("p", _hoisted_5, _toDisplayString(error.value), 1)) : (_openBlock(), _createElementBlock("p", _hoisted_6, "Всего: " + _toDisplayString(total.value), 1))
        ]),
        !loading.value ? (_openBlock(), _createElementBlock("ul", _hoisted_7, [
          (_openBlock(true), _createElementBlock(_Fragment, null, _renderList(items.value, (r) => {
            return _openBlock(), _createElementBlock("li", {
              key: r.id,
              class: "card-item"
            }, [
              _createVNode(_unref(UiRecipeCard), null, {
                top: _withCtx(() => [
                  _createVNode(_unref(RouterLink), {
                    class: "card-link",
                    to: `/recipes/${r.id}`
                  }, {
                    default: _withCtx(() => [
                      _createElementVNode("h4", _hoisted_8, _toDisplayString(r.title), 1),
                      r.cookTimeMinutes != null ? (_openBlock(), _createElementBlock("p", _hoisted_9, _toDisplayString(r.cookTimeMinutes) + " мин", 1)) : _createCommentVNode("", true),
                      r.mealCategory ? (_openBlock(), _createElementBlock("span", _hoisted_10, _toDisplayString(r.mealCategory), 1)) : _createCommentVNode("", true)
                    ]),
                    _: 2
                  }, 1032, ["to"])
                ]),
                actions: _withCtx(() => [
                  _createVNode(_unref(UiButton), {
                    size: "sm",
                    onClick: ($event) => openPlanModal(r)
                  }, {
                    default: _withCtx(() => [..._cache[8] || (_cache[8] = [
                      _createTextVNode("В план", -1)
                    ])]),
                    _: 1
                  }, 8, ["onClick"]),
                  _createVNode(_unref(RouterLink), {
                    class: "btn small secondary",
                    to: `/recipes/${r.id}/edit`
                  }, {
                    default: _withCtx(() => [..._cache[9] || (_cache[9] = [
                      _createTextVNode("Изменить", -1)
                    ])]),
                    _: 1
                  }, 8, ["to"]),
                  _createVNode(_unref(UiButton), {
                    size: "sm",
                    variant: "danger",
                    onClick: ($event) => deleteRecipe(r)
                  }, {
                    default: _withCtx(() => [..._cache[10] || (_cache[10] = [
                      _createTextVNode("Удалить", -1)
                    ])]),
                    _: 1
                  }, 8, ["onClick"])
                ]),
                _: 2
              }, 1024)
            ]);
          }), 128))
        ])) : _createCommentVNode("", true),
        planModalOpen.value ? (_openBlock(), _createBlock(_unref(UiModalShell), {
          key: 1,
          open: planModalOpen.value,
          title: planStep.value === 1 ? "Добавить в план (шаг 1 из 2)" : "Добавить в план (шаг 2 из 2)",
          onClose: closePlanModal
        }, {
          actions: _withCtx(() => [
            planStep.value === 1 ? (_openBlock(), _createElementBlock(_Fragment, { key: 0 }, [
              _createVNode(_unref(UiButton), {
                variant: "secondary",
                disabled: planBusy.value,
                onClick: closePlanModal
              }, {
                default: _withCtx(() => [..._cache[15] || (_cache[15] = [
                  _createTextVNode("Отмена", -1)
                ])]),
                _: 1
              }, 8, ["disabled"]),
              _createVNode(_unref(UiButton), {
                disabled: planBusy.value,
                onClick: goToPlanStep2
              }, {
                default: _withCtx(() => [..._cache[16] || (_cache[16] = [
                  _createTextVNode("Далее", -1)
                ])]),
                _: 1
              }, 8, ["disabled"])
            ], 64)) : (_openBlock(), _createElementBlock(_Fragment, { key: 1 }, [
              _createVNode(_unref(UiButton), {
                variant: "secondary",
                disabled: planBusy.value,
                onClick: backToPlanStep1
              }, {
                default: _withCtx(() => [..._cache[17] || (_cache[17] = [
                  _createTextVNode("Назад", -1)
                ])]),
                _: 1
              }, 8, ["disabled"]),
              _createVNode(_unref(UiButton), {
                disabled: planBusy.value,
                onClick: confirmAddToPlan
              }, {
                default: _withCtx(() => [..._cache[18] || (_cache[18] = [
                  _createTextVNode("Добавить", -1)
                ])]),
                _: 1
              }, 8, ["disabled"])
            ], 64))
          ]),
          default: _withCtx(() => [
            _createElementVNode("div", _hoisted_11, [
              planRecipe.value ? (_openBlock(), _createElementBlock("p", _hoisted_12, _toDisplayString(planRecipe.value.title), 1)) : _createCommentVNode("", true),
              planStep.value === 1 ? (_openBlock(), _createElementBlock("div", _hoisted_13, [
                _cache[12] || (_cache[12] = _createElementVNode("p", { class: "muted plan-hint" }, "Выберите день для блюда в плане.", -1)),
                _createElementVNode("label", null, [
                  _cache[11] || (_cache[11] = _createTextVNode(" Дата ", -1)),
                  _withDirectives(_createElementVNode("input", {
                    "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => planDate.value = $event),
                    type: "date"
                  }, null, 512), [
                    [_vModelText, planDate.value]
                  ])
                ])
              ])) : (_openBlock(), _createElementBlock("div", _hoisted_14, [
                _cache[14] || (_cache[14] = _createElementVNode("p", { class: "muted plan-hint" }, "Выберите один из шести фиксированных приёмов пищи.", -1)),
                _createElementVNode("label", null, [
                  _cache[13] || (_cache[13] = _createTextVNode(" Приём пищи ", -1)),
                  _withDirectives(_createElementVNode("select", {
                    "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => planSlotCode.value = $event)
                  }, [
                    (_openBlock(true), _createElementBlock(_Fragment, null, _renderList(_unref(MEAL_SLOT_CODES), (c) => {
                      return _openBlock(), _createElementBlock("option", {
                        key: c,
                        value: c
                      }, _toDisplayString(_unref(MEAL_SLOT_LABELS)[c]), 9, _hoisted_15);
                    }), 128))
                  ], 512), [
                    [_vModelSelect, planSlotCode.value]
                  ])
                ])
              ])),
              planError.value ? (_openBlock(), _createElementBlock("p", _hoisted_16, _toDisplayString(planError.value), 1)) : _createCommentVNode("", true)
            ])
          ]),
          _: 1
        }, 8, ["open", "title"])) : _createCommentVNode("", true),
        toastOpen.value ? (_openBlock(), _createBlock(_unref(UiModalShell), {
          key: 2,
          open: toastOpen.value,
          title: "Рецепт добавлен",
          onClose: closeToast
        }, {
          actions: _withCtx(() => [
            _createVNode(_unref(UiButton), {
              variant: "secondary",
              "data-testid": "plan-toast-planner",
              onClick: openPlannerFromToast
            }, {
              default: _withCtx(() => [..._cache[20] || (_cache[20] = [
                _createTextVNode(" В планировщик ", -1)
              ])]),
              _: 1
            }),
            _createVNode(_unref(UiButton), {
              "data-testid": "plan-toast-ok",
              onClick: closeToast
            }, {
              default: _withCtx(() => [..._cache[21] || (_cache[21] = [
                _createTextVNode("OK", -1)
              ])]),
              _: 1
            })
          ]),
          default: _withCtx(() => [
            _createElementVNode("div", _hoisted_17, [
              toastContext.value ? (_openBlock(), _createElementBlock("p", _hoisted_18, _toDisplayString(toastContext.value.recipeTitle) + " · " + _toDisplayString(toastContext.value.date) + " · " + _toDisplayString(toastContext.value.slotLabel), 1)) : _createCommentVNode("", true),
              _cache[19] || (_cache[19] = _createElementVNode("p", { class: "muted toast-sub" }, "Блюдо добавлено в план.", -1))
            ])
          ]),
          _: 1
        }, 8, ["open"])) : _createCommentVNode("", true)
      ]);
    };
  }
});

const Library = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-6615d4c9"]]);

export { Library as default };
