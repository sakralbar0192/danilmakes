import { importShared } from './__federation_fn_import-D4I1MtYd.js';
import { a as bffErrorMessage, _ as _export_sfc } from './_plugin-vue_export-helper-DSX2Nh7D.js';
import { U as UiButton, a as UiModalShell } from './UiRecipeCard.vue_vue_type_style_index_0_scoped_d89a879e_lang-COwfcZ-u.js';
import { u as useBff } from './useBff-BRmUgJVQ.js';

const {defineComponent:_defineComponent} = await importShared('vue');

const {openBlock:_openBlock,createElementBlock:_createElementBlock,createCommentVNode:_createCommentVNode,toDisplayString:_toDisplayString,createTextVNode:_createTextVNode,unref:_unref,withCtx:_withCtx,createVNode:_createVNode,createElementVNode:_createElementVNode,renderList:_renderList,Fragment:_Fragment,normalizeClass:_normalizeClass} = await importShared('vue');

const _hoisted_1 = { class: "mf-root" };
const _hoisted_2 = {
  key: 0,
  class: "muted"
};
const _hoisted_3 = {
  key: 1,
  class: "err"
};
const _hoisted_4 = {
  class: "recipe-toolbar",
  role: "toolbar",
  "aria-label": "Действия с рецептом"
};
const _hoisted_5 = {
  key: 0,
  class: "hero-image"
};
const _hoisted_6 = ["src", "alt"];
const _hoisted_7 = {
  key: 1,
  class: "block note-block"
};
const _hoisted_8 = { class: "meta-row" };
const _hoisted_9 = {
  key: 0,
  class: "meta-chip"
};
const _hoisted_10 = {
  key: 1,
  class: "meta-chip"
};
const _hoisted_11 = {
  key: 2,
  class: "block"
};
const _hoisted_12 = { class: "nutr" };
const _hoisted_13 = { key: 0 };
const _hoisted_14 = { key: 1 };
const _hoisted_15 = { key: 2 };
const _hoisted_16 = { key: 3 };
const _hoisted_17 = {
  key: 3,
  class: "muted"
};
const _hoisted_18 = { class: "block" };
const _hoisted_19 = { class: "muted" };
const _hoisted_20 = {
  key: 4,
  class: "block"
};
const _hoisted_21 = { class: "cal-modal-body" };
const _hoisted_22 = { class: "cal-nav" };
const _hoisted_23 = { class: "dow" };
const _hoisted_24 = { class: "grid" };
const _hoisted_25 = ["disabled", "onClick"];
const {setShellHeader} = await importShared('@meal/shell-chrome');
const {computed,h,onMounted,ref,watch} = await importShared('vue');

const {RouterLink,useRoute,useRouter} = await importShared('vue-router');
const _sfc_main = /* @__PURE__ */ _defineComponent({
  __name: "RecipeDetail",
  setup(__props) {
    const route = useRoute();
    const router = useRouter();
    const bff = useBff();
    const recipe = ref(null);
    const loading = ref(true);
    const error = ref("");
    const monthOpen = ref(false);
    const pickDate = ref("");
    const deleteBusy = ref(false);
    const calYear = ref((/* @__PURE__ */ new Date()).getFullYear());
    const calMonth = ref((/* @__PURE__ */ new Date()).getMonth());
    function todayISODate() {
      const d = /* @__PURE__ */ new Date();
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
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
    async function load() {
      const id = route.params.id;
      if (!id) {
        return;
      }
      loading.value = true;
      error.value = "";
      try {
        recipe.value = await bff.json(`/recipes/${id}`);
      } catch (e) {
        recipe.value = null;
        error.value = bffErrorMessage(e);
      } finally {
        loading.value = false;
      }
    }
    onMounted(load);
    watch(
      () => route.params.id,
      () => load()
    );
    function openMonthPicker() {
      pickDate.value = todayISODate();
      const [y, m] = pickDate.value.split("-").map(Number);
      calYear.value = y;
      calMonth.value = m - 1;
      monthOpen.value = true;
    }
    function closeMonthModal() {
      monthOpen.value = false;
    }
    function selectCalendarDay(iso) {
      if (!iso) {
        return;
      }
      pickDate.value = iso;
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
    function goPlannerWithDate() {
      if (!recipe.value || !pickDate.value) {
        return;
      }
      monthOpen.value = false;
      void router.push({
        path: "/planner",
        query: {
          anchorDate: pickDate.value,
          focusDate: pickDate.value,
          recipeSearch: recipe.value.title
        }
      });
    }
    async function deleteRecipe() {
      if (!recipe.value || deleteBusy.value) {
        return;
      }
      if (!window.confirm(`Удалить рецепт «${recipe.value.title}»?`)) {
        return;
      }
      deleteBusy.value = true;
      try {
        await bff.fetch(`/recipes/${recipe.value.id}`, { method: "DELETE" });
        await router.push("/recipes");
      } catch (e) {
        error.value = bffErrorMessage(e);
      } finally {
        deleteBusy.value = false;
      }
    }
    function applyRecipeDetailShell() {
      if (loading.value) {
        setShellHeader({
          ariaLabel: "Шапка рецепта",
          title: "Загрузка…",
          titleAlign: "center",
          showAppNav: true,
          eyebrow: null,
          leadingRender: null,
          sublineRender: null,
          actionsRender: null
        });
        return;
      }
      if (error.value || !recipe.value) {
        setShellHeader({
          ariaLabel: "Шапка рецепта",
          title: "Рецепт",
          titleAlign: "center",
          showAppNav: true,
          eyebrow: null,
          sublineRender: null,
          leadingRender: () => h(RouterLink, { to: "/recipes", class: "ui-app-header-link--accent" }, () => "К библиотеке"),
          actionsRender: null
        });
        return;
      }
      setShellHeader({
        ariaLabel: "Шапка рецепта",
        title: recipe.value.title,
        titleAlign: "center",
        showAppNav: true,
        eyebrow: null,
        sublineRender: null,
        leadingRender: () => h(RouterLink, { to: "/recipes", class: "ui-app-header-link--accent" }, () => "К библиотеке"),
        actionsRender: () => h(
          "button",
          {
            type: "button",
            class: "ui-app-header-link--accent",
            "data-testid": "recipe-add-to-plan",
            onClick: openMonthPicker
          },
          () => "В план"
        )
      });
    }
    watch([recipe, loading, error], applyRecipeDetailShell, { immediate: true });
    return (_ctx, _cache) => {
      return _openBlock(), _createElementBlock("section", _hoisted_1, [
        loading.value ? (_openBlock(), _createElementBlock("p", _hoisted_2, "Загрузка…")) : error.value ? (_openBlock(), _createElementBlock("p", _hoisted_3, _toDisplayString(error.value), 1)) : recipe.value ? (_openBlock(), _createElementBlock(_Fragment, { key: 2 }, [
          _createElementVNode("div", _hoisted_4, [
            _createVNode(_unref(RouterLink), {
              class: "toolbar-edit",
              to: `/recipes/${recipe.value.id}/edit`
            }, {
              default: _withCtx(() => [..._cache[0] || (_cache[0] = [
                _createTextVNode("Редактировать", -1)
              ])]),
              _: 1
            }, 8, ["to"]),
            _createVNode(_unref(UiButton), {
              variant: "secondary",
              disabled: deleteBusy.value,
              "data-testid": "recipe-delete",
              onClick: deleteRecipe
            }, {
              default: _withCtx(() => [
                _createTextVNode(_toDisplayString(deleteBusy.value ? "…" : "Удалить"), 1)
              ]),
              _: 1
            }, 8, ["disabled"])
          ]),
          recipe.value.imageUrl ? (_openBlock(), _createElementBlock("figure", _hoisted_5, [
            _createElementVNode("img", {
              src: recipe.value.imageUrl,
              alt: recipe.value.title
            }, null, 8, _hoisted_6)
          ])) : _createCommentVNode("", true),
          recipe.value.note ? (_openBlock(), _createElementBlock("section", _hoisted_7, [
            _cache[1] || (_cache[1] = _createElementVNode("h3", null, "Заметка", -1)),
            _createElementVNode("p", null, _toDisplayString(recipe.value.note), 1)
          ])) : _createCommentVNode("", true),
          _createElementVNode("section", _hoisted_8, [
            recipe.value.cookTimeMinutes != null ? (_openBlock(), _createElementBlock("p", _hoisted_9, " Время: " + _toDisplayString(recipe.value.cookTimeMinutes) + " мин ", 1)) : _createCommentVNode("", true),
            recipe.value.mealCategory ? (_openBlock(), _createElementBlock("p", _hoisted_10, "Приём пищи: " + _toDisplayString(recipe.value.mealCategory), 1)) : _createCommentVNode("", true)
          ]),
          recipe.value.nutrition ? (_openBlock(), _createElementBlock("section", _hoisted_11, [
            _cache[2] || (_cache[2] = _createElementVNode("h3", null, "Пищевая ценность", -1)),
            _createElementVNode("ul", _hoisted_12, [
              recipe.value.nutrition.proteinG != null ? (_openBlock(), _createElementBlock("li", _hoisted_13, "Белки: " + _toDisplayString(recipe.value.nutrition.proteinG) + " г", 1)) : _createCommentVNode("", true),
              recipe.value.nutrition.fatG != null ? (_openBlock(), _createElementBlock("li", _hoisted_14, "Жиры: " + _toDisplayString(recipe.value.nutrition.fatG) + " г", 1)) : _createCommentVNode("", true),
              recipe.value.nutrition.carbsG != null ? (_openBlock(), _createElementBlock("li", _hoisted_15, "Углеводы: " + _toDisplayString(recipe.value.nutrition.carbsG) + " г", 1)) : _createCommentVNode("", true),
              recipe.value.nutrition.calories != null ? (_openBlock(), _createElementBlock("li", _hoisted_16, "Ккал: " + _toDisplayString(recipe.value.nutrition.calories), 1)) : _createCommentVNode("", true)
            ])
          ])) : (_openBlock(), _createElementBlock("p", _hoisted_17, "Пищевая ценность не заполнена — укажите в редакторе.")),
          _createElementVNode("section", _hoisted_18, [
            _cache[3] || (_cache[3] = _createElementVNode("h3", null, "Ингредиенты", -1)),
            _createElementVNode("ul", null, [
              (_openBlock(true), _createElementBlock(_Fragment, null, _renderList(recipe.value.ingredients, (ing, i) => {
                return _openBlock(), _createElementBlock("li", { key: i }, [
                  _createTextVNode(_toDisplayString(ing.name) + " ", 1),
                  ing.quantity != null ? (_openBlock(), _createElementBlock(_Fragment, { key: 0 }, [
                    _createTextVNode(" — " + _toDisplayString(ing.quantity) + " " + _toDisplayString(ing.unit ?? ""), 1)
                  ], 64)) : (_openBlock(), _createElementBlock(_Fragment, { key: 1 }, [
                    _createTextVNode(" — по вкусу")
                  ], 64)),
                  _createElementVNode("span", _hoisted_19, " (" + _toDisplayString(ing.productCategory) + ")", 1)
                ]);
              }), 128))
            ])
          ]),
          recipe.value.steps?.length ? (_openBlock(), _createElementBlock("section", _hoisted_20, [
            _cache[4] || (_cache[4] = _createElementVNode("h3", null, "Шаги", -1)),
            _createElementVNode("ol", null, [
              (_openBlock(true), _createElementBlock(_Fragment, null, _renderList(recipe.value.steps, (s, i) => {
                return _openBlock(), _createElementBlock("li", { key: i }, _toDisplayString(s), 1);
              }), 128))
            ])
          ])) : _createCommentVNode("", true)
        ], 64)) : _createCommentVNode("", true),
        _createVNode(_unref(UiModalShell), {
          open: monthOpen.value,
          title: "Выберите день",
          onClose: closeMonthModal
        }, {
          actions: _withCtx(() => [
            _createVNode(_unref(UiButton), {
              variant: "secondary",
              onClick: closeMonthModal
            }, {
              default: _withCtx(() => [..._cache[8] || (_cache[8] = [
                _createTextVNode("Закрыть", -1)
              ])]),
              _: 1
            }),
            _createVNode(_unref(UiButton), { onClick: goPlannerWithDate }, {
              default: _withCtx(() => [..._cache[9] || (_cache[9] = [
                _createTextVNode("Перейти в планировщик", -1)
              ])]),
              _: 1
            })
          ]),
          default: _withCtx(() => [
            _createElementVNode("div", _hoisted_21, [
              _cache[7] || (_cache[7] = _createElementVNode("p", { class: "muted" }, "Далее откроется планировщик с поиском по названию рецепта.", -1)),
              _createElementVNode("div", _hoisted_22, [
                _createVNode(_unref(UiButton), {
                  type: "button",
                  variant: "secondary",
                  onClick: prevMonth
                }, {
                  default: _withCtx(() => [..._cache[5] || (_cache[5] = [
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
                  default: _withCtx(() => [..._cache[6] || (_cache[6] = [
                    _createTextVNode("→", -1)
                  ])]),
                  _: 1
                })
              ]),
              _createElementVNode("div", _hoisted_23, [
                (_openBlock(), _createElementBlock(_Fragment, null, _renderList(["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"], (d) => {
                  return _createElementVNode("span", { key: d }, _toDisplayString(d), 1);
                }), 64))
              ]),
              _createElementVNode("div", _hoisted_24, [
                (_openBlock(true), _createElementBlock(_Fragment, null, _renderList(calCells.value, (c, i) => {
                  return _openBlock(), _createElementBlock("button", {
                    key: i,
                    type: "button",
                    class: _normalizeClass(["cell", { selected: c.iso === pickDate.value }]),
                    disabled: !c.inMonth,
                    onClick: ($event) => selectCalendarDay(c.iso)
                  }, _toDisplayString(c.d ?? ""), 11, _hoisted_25);
                }), 128))
              ])
            ])
          ]),
          _: 1
        }, 8, ["open"])
      ]);
    };
  }
});

const RecipeDetail = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-c7b0a51c"]]);

export { RecipeDetail as default };
