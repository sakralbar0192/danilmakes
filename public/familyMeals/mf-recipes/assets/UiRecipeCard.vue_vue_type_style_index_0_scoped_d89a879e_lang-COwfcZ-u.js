import { importShared } from './__federation_fn_import-D4I1MtYd.js';
import { _ as _export_sfc } from './_plugin-vue_export-helper-DSX2Nh7D.js';

const {defineComponent:_defineComponent$4} = await importShared('vue');

const {renderSlot:_renderSlot$3,resolveDynamicComponent:_resolveDynamicComponent,normalizeClass:_normalizeClass$1,withCtx:_withCtx,openBlock:_openBlock$4,createBlock:_createBlock,createCommentVNode:_createCommentVNode$3,createElementBlock:_createElementBlock$4,createElementVNode:_createElementVNode$3,Fragment:_Fragment} = await importShared('vue');
const {computed,useSlots} = await importShared('vue');

const {defineComponent:_defineComponent$3} = await importShared('vue');

const {renderSlot:_renderSlot$2,normalizeClass:_normalizeClass,openBlock:_openBlock$3,createElementBlock:_createElementBlock$3} = await importShared('vue');

const _hoisted_1$2 = ["type", "disabled"];
const _sfc_main$2 = /* @__PURE__ */ _defineComponent$3({
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
      return _openBlock$3(), _createElementBlock$3("button", {
        type: props.type,
        class: _normalizeClass(["ui-btn", [props.variant, props.size]]),
        disabled: props.disabled
      }, [
        _renderSlot$2(_ctx.$slots, "default", {}, void 0, true)
      ], 10, _hoisted_1$2);
    };
  }
});

const UiButton = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["__scopeId", "data-v-75f51063"]]);

const {useModel:_useModel,mergeModels:_mergeModels,defineComponent:_defineComponent$2} = await importShared('vue');

const {toDisplayString:_toDisplayString$2,openBlock:_openBlock$2,createElementBlock:_createElementBlock$2,createCommentVNode:_createCommentVNode$2,vModelDynamic:_vModelDynamic,mergeProps:_mergeProps,createElementVNode:_createElementVNode$2,withDirectives:_withDirectives} = await importShared('vue');

const {defineComponent:_defineComponent$1} = await importShared('vue');

const {toDisplayString:_toDisplayString$1,createElementVNode:_createElementVNode$1,renderSlot:_renderSlot$1,withModifiers:_withModifiers,openBlock:_openBlock$1,createElementBlock:_createElementBlock$1,createCommentVNode:_createCommentVNode$1} = await importShared('vue');

const _hoisted_1$1 = ["aria-label"];
const _hoisted_2$1 = { class: "modal" };
const _hoisted_3$1 = { class: "head" };
const _hoisted_4$1 = { class: "body" };
const _hoisted_5$1 = { class: "actions" };
const _sfc_main$1 = /* @__PURE__ */ _defineComponent$1({
  __name: "UiModalShell",
  props: {
    title: {},
    open: { type: Boolean, default: false }
  },
  emits: ["close"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    return (_ctx, _cache) => {
      return props.open ? (_openBlock$1(), _createElementBlock$1("div", {
        key: 0,
        class: "backdrop",
        role: "dialog",
        "aria-modal": "true",
        "aria-label": props.title,
        onClick: _cache[0] || (_cache[0] = _withModifiers(($event) => emit("close"), ["self"]))
      }, [
        _createElementVNode$1("div", _hoisted_2$1, [
          _createElementVNode$1("header", _hoisted_3$1, [
            _createElementVNode$1("h3", null, _toDisplayString$1(props.title), 1)
          ]),
          _createElementVNode$1("div", _hoisted_4$1, [
            _renderSlot$1(_ctx.$slots, "default", {}, void 0, true)
          ]),
          _createElementVNode$1("footer", _hoisted_5$1, [
            _renderSlot$1(_ctx.$slots, "actions", {}, void 0, true)
          ])
        ])
      ], 8, _hoisted_1$1)) : _createCommentVNode$1("", true);
    };
  }
});

const UiModalShell = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["__scopeId", "data-v-6b32603d"]]);

const {defineComponent:_defineComponent} = await importShared('vue');

const {renderSlot:_renderSlot,toDisplayString:_toDisplayString,createElementVNode:_createElementVNode,openBlock:_openBlock,createElementBlock:_createElementBlock,createCommentVNode:_createCommentVNode} = await importShared('vue');

const _hoisted_1 = { class: "card" };
const _hoisted_2 = { class: "card-top" };
const _hoisted_3 = {
  key: 0,
  class: "meta"
};
const _hoisted_4 = {
  key: 1,
  class: "badge"
};
const _hoisted_5 = { class: "actions" };
const _sfc_main = /* @__PURE__ */ _defineComponent({
  __name: "UiRecipeCard",
  props: {
    title: { default: "" },
    meta: {},
    badge: {}
  },
  setup(__props) {
    return (_ctx, _cache) => {
      return _openBlock(), _createElementBlock("article", _hoisted_1, [
        _createElementVNode("div", _hoisted_2, [
          _renderSlot(_ctx.$slots, "top", {}, () => [
            _createElementVNode("h4", null, _toDisplayString(__props.title), 1),
            __props.meta ? (_openBlock(), _createElementBlock("p", _hoisted_3, _toDisplayString(__props.meta), 1)) : _createCommentVNode("", true),
            __props.badge ? (_openBlock(), _createElementBlock("span", _hoisted_4, _toDisplayString(__props.badge), 1)) : _createCommentVNode("", true)
          ], true)
        ]),
        _createElementVNode("div", _hoisted_5, [
          _renderSlot(_ctx.$slots, "actions", {}, void 0, true)
        ])
      ]);
    };
  }
});

export { UiButton as U, _sfc_main as _, UiModalShell as a };
