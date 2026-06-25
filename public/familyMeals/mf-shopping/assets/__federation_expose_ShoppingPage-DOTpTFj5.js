import { importShared } from './__federation_fn_import-D4I1MtYd.js';
import { c as createBffClient, r as resolveBffBaseUrl, _ as _export_sfc, b as bffErrorMessage, a as bffErrorFromResponse } from './_plugin-vue_export-helper-7eE1XsNM.js';

let defaultClient = null;
function getDefaultBffClient(envValue) {
  if (!defaultClient) {
    defaultClient = createBffClient(resolveBffBaseUrl(envValue));
  }
  return defaultClient;
}

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

const {toDisplayString:_toDisplayString$2,createElementVNode:_createElementVNode$2,renderSlot:_renderSlot$1,withModifiers:_withModifiers,openBlock:_openBlock$2,createElementBlock:_createElementBlock$2,createCommentVNode:_createCommentVNode$2} = await importShared('vue');

const {defineComponent:_defineComponent$1} = await importShared('vue');

const {renderSlot:_renderSlot,toDisplayString:_toDisplayString$1,createElementVNode:_createElementVNode$1,openBlock:_openBlock$1,createElementBlock:_createElementBlock$1,createCommentVNode:_createCommentVNode$1} = await importShared('vue');

const {defineComponent:_defineComponent} = await importShared('vue');

const {openBlock:_openBlock,createElementBlock:_createElementBlock,createCommentVNode:_createCommentVNode,toDisplayString:_toDisplayString,createElementVNode:_createElementVNode,createTextVNode:_createTextVNode,unref:_unref,withCtx:_withCtx,createVNode:_createVNode,renderList:_renderList,Fragment:_Fragment,normalizeClass:_normalizeClass,vModelText:_vModelText,withDirectives:_withDirectives} = await importShared('vue');

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
  key: 0,
  class: "empty soft",
  "data-testid": "shopping-empty-state"
};
const _hoisted_5 = { class: "toolbar" };
const _hoisted_6 = { class: "lines" };
const _hoisted_7 = { class: "check" };
const _hoisted_8 = ["checked", "onChange"];
const _hoisted_9 = {
  key: 0,
  class: "qty"
};
const _hoisted_10 = {
  key: 1,
  class: "muted"
};
const _hoisted_11 = { class: "manual" };
const _hoisted_12 = { class: "manual-row" };
const {setShellHeader} = await importShared('@meal/shell-chrome');

const {computed,h,onMounted,ref,watch} = await importShared('vue');

const {RouterLink,useRoute,useRouter} = await importShared('vue-router');
const _sfc_main = /* @__PURE__ */ _defineComponent({
  __name: "ShoppingPage",
  setup(__props) {
    const route = useRoute();
    const router = useRouter();
    const bff = useBff();
    const detail = ref(null);
    const loading = ref(true);
    const error = ref("");
    const manualName = ref("");
    const manualQty = ref("");
    const manualUnit = ref("");
    const manualCat = ref("");
    const listId = computed(() => route.params.listId);
    const showEmpty = computed(() => {
      if (loading.value || !detail.value) {
        return false;
      }
      const n = detail.value.lines?.length ?? 0;
      if (n > 0) {
        return false;
      }
      return detail.value.empty === true || route.query.empty === "1" || n === 0;
    });
    async function load() {
      if (!listId.value) {
        return;
      }
      loading.value = true;
      error.value = "";
      try {
        detail.value = await bff.json(`/shopping/lists/${listId.value}`);
      } catch (e) {
        detail.value = null;
        error.value = bffErrorMessage(e);
      } finally {
        loading.value = false;
        applyShoppingShell();
      }
    }
    onMounted(() => {
      applyShoppingShell();
      void load();
    });
    watch(listId, () => load());
    function formatShoppingPeriod(from, to) {
      const d1 = /* @__PURE__ */ new Date(`${from}T12:00:00`);
      const d2 = /* @__PURE__ */ new Date(`${to}T12:00:00`);
      const y1 = d1.getFullYear();
      const y2 = d2.getFullYear();
      const m1 = d1.getMonth();
      const m2 = d2.getMonth();
      if (y1 === y2 && m1 === m2) {
        const monthYear = d1.toLocaleDateString("ru-RU", { month: "long", year: "numeric" });
        return `Период: ${d1.getDate()}—${d2.getDate()} ${monthYear}`;
      }
      if (y1 === y2) {
        const a2 = d1.toLocaleDateString("ru-RU", { day: "numeric", month: "long" });
        const b2 = d2.toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
        return `Период: ${a2} — ${b2}`;
      }
      const a = d1.toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
      const b = d2.toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
      return `Период: ${a} — ${b}`;
    }
    const shoppingPeriodLabel = computed(
      () => detail.value ? formatShoppingPeriod(detail.value.from, detail.value.to) : ""
    );
    const grouped = computed(() => {
      const lines = detail.value?.lines ?? [];
      const m = /* @__PURE__ */ new Map();
      for (const line of lines) {
        const key = line.productCategory?.trim() || "_other";
        if (!m.has(key)) {
          m.set(key, []);
        }
        m.get(key).push(line);
      }
      const keys = [...m.keys()].sort((a, b) => {
        if (a === "_other") {
          return 1;
        }
        if (b === "_other") {
          return -1;
        }
        return a.localeCompare(b);
      });
      return keys.map((k) => ({ category: k === "_other" ? "Без категории" : k, lines: m.get(k) }));
    });
    async function togglePurchased(line) {
      const res = await bff.fetch(`/shopping/lists/${listId.value}/lines/${line.lineId}`, {
        method: "PATCH",
        body: JSON.stringify({ purchased: !line.purchased })
      });
      if (!res.ok) {
        error.value = (await bffErrorFromResponse(res)).message;
        return;
      }
      await load();
    }
    async function removeLine(line) {
      if (!confirm(`Удалить «${line.displayName}»?`)) {
        return;
      }
      const res = await bff.fetch(`/shopping/lists/${listId.value}/lines/${line.lineId}`, {
        method: "DELETE"
      });
      if (!res.ok) {
        error.value = (await bffErrorFromResponse(res)).message;
        return;
      }
      await load();
    }
    async function addManual() {
      if (!manualName.value.trim()) {
        error.value = "Укажите название продукта.";
        return;
      }
      const body = { displayName: manualName.value.trim() };
      if (manualQty.value !== "") {
        body.quantity = Number(manualQty.value);
      }
      if (manualUnit.value.trim()) {
        body.unit = manualUnit.value.trim();
      }
      if (manualCat.value.trim()) {
        body.productCategory = manualCat.value.trim();
      }
      const res = await bff.fetch(`/shopping/lists/${listId.value}/lines`, {
        method: "POST",
        body: JSON.stringify(body)
      });
      if (!res.ok) {
        error.value = (await bffErrorFromResponse(res)).message;
        return;
      }
      manualName.value = "";
      manualQty.value = "";
      manualUnit.value = "";
      manualCat.value = "";
      await load();
    }
    async function exportText() {
      detail.value?.lines ?? [];
      const parts = [];
      if (detail.value) {
        parts.push(`Период: ${detail.value.from} — ${detail.value.to}`);
      }
      for (const g of grouped.value) {
        parts.push(`
[${g.category}]`);
        for (const l of g.lines) {
          const q = l.quantity != null ? `${l.quantity} ${l.unit ?? ""}`.trim() : "";
          parts.push(`${l.purchased ? "✓" : "○"} ${l.displayName}${q ? ` — ${q}` : ""}`);
        }
      }
      const text = parts.join("\n");
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        error.value = "Не удалось скопировать в буфер";
      }
    }
    function goPlanner() {
      void router.push({ path: "/planner" });
    }
    function applyShoppingShell() {
      setShellHeader({
        ariaLabel: "Шапка списка покупок",
        title: "Список покупок",
        showAppNav: true,
        eyebrow: null,
        leadingRender: null,
        actionsRender: () => h(RouterLink, { to: "/planner", class: "ui-app-header-link--accent" }, () => "К планировщику"),
        sublineRender: detail.value ? () => h("div", { class: "shopping-period-line", "data-testid": "shopping-period" }, [
          h("span", null, shoppingPeriodLabel.value),
          h(RouterLink, { to: "/planner", class: "ui-app-header-link--accent" }, () => "Изменить период")
        ]) : null
      });
    }
    watch([detail, shoppingPeriodLabel], applyShoppingShell, { deep: true });
    return (_ctx, _cache) => {
      return _openBlock(), _createElementBlock("section", _hoisted_1, [
        loading.value ? (_openBlock(), _createElementBlock("p", _hoisted_2, "Загрузка…")) : error.value ? (_openBlock(), _createElementBlock("p", _hoisted_3, _toDisplayString(error.value), 1)) : detail.value ? (_openBlock(), _createElementBlock(_Fragment, { key: 2 }, [
          showEmpty.value ? (_openBlock(), _createElementBlock("div", _hoisted_4, [
            _cache[5] || (_cache[5] = _createElementVNode("p", null, "За период не было назначений — можно добавить продукты вручную или вернуться в планировщик.", -1)),
            _createVNode(_unref(UiButton), {
              type: "button",
              variant: "secondary",
              onClick: goPlanner
            }, {
              default: _withCtx(() => [..._cache[4] || (_cache[4] = [
                _createTextVNode("Планировщик", -1)
              ])]),
              _: 1
            })
          ])) : _createCommentVNode("", true),
          _createElementVNode("div", _hoisted_5, [
            _createVNode(_unref(UiButton), {
              type: "button",
              variant: "secondary",
              "data-testid": "shopping-copy-list",
              onClick: exportText
            }, {
              default: _withCtx(() => [..._cache[6] || (_cache[6] = [
                _createTextVNode(" Копировать список ", -1)
              ])]),
              _: 1
            })
          ]),
          (_openBlock(true), _createElementBlock(_Fragment, null, _renderList(grouped.value, (g) => {
            return _openBlock(), _createElementBlock("div", {
              key: g.category,
              class: "group",
              "data-testid": "shopping-group"
            }, [
              _createElementVNode("h3", null, _toDisplayString(g.category), 1),
              _createElementVNode("ul", _hoisted_6, [
                (_openBlock(true), _createElementBlock(_Fragment, null, _renderList(g.lines, (line) => {
                  return _openBlock(), _createElementBlock("li", {
                    key: line.lineId,
                    class: "line",
                    "data-testid": "shopping-line"
                  }, [
                    _createElementVNode("label", _hoisted_7, [
                      _createElementVNode("input", {
                        type: "checkbox",
                        checked: line.purchased,
                        onChange: ($event) => togglePurchased(line)
                      }, null, 40, _hoisted_8),
                      _createElementVNode("span", {
                        class: _normalizeClass({ done: line.purchased })
                      }, _toDisplayString(line.displayName), 3)
                    ]),
                    line.quantity != null ? (_openBlock(), _createElementBlock("span", _hoisted_9, _toDisplayString(line.quantity) + " " + _toDisplayString(line.unit ?? ""), 1)) : _createCommentVNode("", true),
                    line.mergeNote ? (_openBlock(), _createElementBlock("span", _hoisted_10, _toDisplayString(line.mergeNote), 1)) : _createCommentVNode("", true),
                    _createVNode(_unref(UiButton), {
                      type: "button",
                      variant: "danger",
                      size: "sm",
                      onClick: ($event) => removeLine(line)
                    }, {
                      default: _withCtx(() => [..._cache[7] || (_cache[7] = [
                        _createTextVNode("Удалить", -1)
                      ])]),
                      _: 1
                    }, 8, ["onClick"])
                  ]);
                }), 128))
              ])
            ]);
          }), 128)),
          _createElementVNode("section", _hoisted_11, [
            _cache[9] || (_cache[9] = _createElementVNode("h3", null, "Свой продукт", -1)),
            _createElementVNode("div", _hoisted_12, [
              _withDirectives(_createElementVNode("input", {
                "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => manualName.value = $event),
                placeholder: "Название"
              }, null, 512), [
                [_vModelText, manualName.value]
              ]),
              _withDirectives(_createElementVNode("input", {
                "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => manualQty.value = $event),
                type: "number",
                step: "any",
                placeholder: "Кол-во"
              }, null, 512), [
                [
                  _vModelText,
                  manualQty.value,
                  void 0,
                  { number: true }
                ]
              ]),
              _withDirectives(_createElementVNode("input", {
                "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => manualUnit.value = $event),
                placeholder: "Ед."
              }, null, 512), [
                [_vModelText, manualUnit.value]
              ]),
              _withDirectives(_createElementVNode("input", {
                "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => manualCat.value = $event),
                placeholder: "Категория"
              }, null, 512), [
                [_vModelText, manualCat.value]
              ]),
              _createVNode(_unref(UiButton), {
                type: "button",
                onClick: addManual
              }, {
                default: _withCtx(() => [..._cache[8] || (_cache[8] = [
                  _createTextVNode("Добавить", -1)
                ])]),
                _: 1
              })
            ])
          ])
        ], 64)) : _createCommentVNode("", true)
      ]);
    };
  }
});

const ShoppingPage = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-3329b5a7"]]);

export { ShoppingPage as default };
