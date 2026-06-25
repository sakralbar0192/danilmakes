const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/browser-DMjjyIcU.js","assets/preload-helper-DpTZsdyT.js"])))=>i.map(i=>d[i]);
import { _ as __vitePreload } from './preload-helper-DpTZsdyT.js';
import { i as importShared } from './_virtual___federation_fn_import-C2OYbetV.js';

true&&(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processPreload(link);
  }
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.tagName === "LINK" && node.rel === "modulepreload")
          processPreload(node);
      }
    }
  }).observe(document, { childList: true, subtree: true });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials")
      fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep)
      return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
}());

const {defineComponent:_defineComponent$a} = await importShared('vue');

const {renderSlot:_renderSlot$3,resolveDynamicComponent:_resolveDynamicComponent,normalizeClass:_normalizeClass$1,withCtx:_withCtx$5,openBlock:_openBlock$a,createBlock:_createBlock$2,createCommentVNode:_createCommentVNode$9,createElementBlock:_createElementBlock$9,createElementVNode:_createElementVNode$8,Fragment:_Fragment$1} = await importShared('vue');

const _hoisted_1$7 = ["aria-label"];
const _hoisted_2$6 = {
  key: 0,
  class: "ui-app-header__centered"
};
const _hoisted_3$6 = {
  key: 1,
  class: "ui-app-header__balanced"
};
const _hoisted_4$4 = { class: "ui-app-header__balanced-start" };
const _hoisted_5$2 = {
  key: 0,
  class: "ui-app-header__leading"
};
const _hoisted_6 = { class: "ui-app-header__titles" };
const _hoisted_7 = {
  key: 0,
  class: "ui-app-header__eyebrow"
};
const _hoisted_8 = {
  key: 2,
  class: "ui-app-header__subline"
};
const _hoisted_9 = { class: "ui-app-header__balanced-end" };
const _hoisted_10 = {
  key: 0,
  class: "ui-app-header__actions"
};
const _hoisted_11 = { class: "ui-app-header__main" };
const _hoisted_12 = {
  key: 0,
  class: "ui-app-header__leading"
};
const _hoisted_13 = {
  key: 1,
  class: "ui-app-header__title-block"
};
const _hoisted_14 = {
  key: 2,
  class: "ui-app-header__titles"
};
const _hoisted_15 = {
  key: 0,
  class: "ui-app-header__eyebrow"
};
const _hoisted_16 = {
  key: 2,
  class: "ui-app-header__subline"
};
const _hoisted_17 = {
  key: 0,
  class: "ui-app-header__actions"
};
const {computed,useSlots} = await importShared('vue');

const _sfc_main$8 = /* @__PURE__ */ _defineComponent$a({
  __name: "UiAppHeader",
  props: {
    titleLevel: { default: 2 },
    ariaLabel: { default: void 0 },
    layout: { default: "default" },
    titleAlign: { default: "start" }
  },
  setup(__props) {
    const props = __props;
    const slots = useSlots();
    const titleTag = computed(() => props.titleLevel === 1 ? "h1" : "h2");
    const hasEyebrow = computed(() => Boolean(slots.eyebrow));
    const hasTitle = computed(() => Boolean(slots.title));
    const hasSubline = computed(() => Boolean(slots.subline));
    const hasLeading = computed(() => Boolean(slots.leading));
    const hasActions = computed(() => Boolean(slots.actions));
    const hasTitleBlock = computed(() => Boolean(slots.titleBlock));
    const balancedTitleRow = computed(
      () => props.layout === "default" && props.titleAlign === "center" && !hasTitleBlock.value
    );
    const headerClass = computed(() => [
      "ui-app-header",
      props.layout === "centeredTitle" && "ui-app-header--centered-title",
      props.titleAlign === "center" && "ui-app-header--title-center",
      balancedTitleRow.value && "ui-app-header--title-center-balanced"
    ]);
    return (_ctx, _cache) => {
      return _openBlock$a(), _createElementBlock$9("header", {
        class: _normalizeClass$1(["ui-app-header-root", headerClass.value]),
        "aria-label": __props.ariaLabel
      }, [
        __props.layout === "centeredTitle" ? (_openBlock$a(), _createElementBlock$9("div", _hoisted_2$6, [
          hasTitle.value ? (_openBlock$a(), _createBlock$2(_resolveDynamicComponent(titleTag.value), {
            key: 0,
            class: _normalizeClass$1(["ui-app-header__title", __props.titleLevel === 1 ? "ui-app-header__title--shell" : "ui-app-header__title--screen"])
          }, {
            default: _withCtx$5(() => [
              _renderSlot$3(_ctx.$slots, "title", {}, void 0, true)
            ]),
            _: 3
          }, 8, ["class"])) : _createCommentVNode$9("", true)
        ])) : balancedTitleRow.value ? (_openBlock$a(), _createElementBlock$9("div", _hoisted_3$6, [
          _createElementVNode$8("div", _hoisted_4$4, [
            hasLeading.value ? (_openBlock$a(), _createElementBlock$9("div", _hoisted_5$2, [
              _renderSlot$3(_ctx.$slots, "leading", {}, void 0, true)
            ])) : _createCommentVNode$9("", true)
          ]),
          _createElementVNode$8("div", _hoisted_6, [
            hasEyebrow.value ? (_openBlock$a(), _createElementBlock$9("p", _hoisted_7, [
              _renderSlot$3(_ctx.$slots, "eyebrow", {}, void 0, true)
            ])) : _createCommentVNode$9("", true),
            hasTitle.value ? (_openBlock$a(), _createBlock$2(_resolveDynamicComponent(titleTag.value), {
              key: 1,
              class: _normalizeClass$1(["ui-app-header__title", __props.titleLevel === 1 ? "ui-app-header__title--shell" : "ui-app-header__title--screen"])
            }, {
              default: _withCtx$5(() => [
                _renderSlot$3(_ctx.$slots, "title", {}, void 0, true)
              ]),
              _: 3
            }, 8, ["class"])) : _createCommentVNode$9("", true),
            hasSubline.value ? (_openBlock$a(), _createElementBlock$9("div", _hoisted_8, [
              _renderSlot$3(_ctx.$slots, "subline", {}, void 0, true)
            ])) : _createCommentVNode$9("", true)
          ]),
          _createElementVNode$8("div", _hoisted_9, [
            hasActions.value ? (_openBlock$a(), _createElementBlock$9("div", _hoisted_10, [
              _renderSlot$3(_ctx.$slots, "actions", {}, void 0, true)
            ])) : _createCommentVNode$9("", true)
          ])
        ])) : (_openBlock$a(), _createElementBlock$9(_Fragment$1, { key: 2 }, [
          _createElementVNode$8("div", _hoisted_11, [
            hasLeading.value ? (_openBlock$a(), _createElementBlock$9("div", _hoisted_12, [
              _renderSlot$3(_ctx.$slots, "leading", {}, void 0, true)
            ])) : _createCommentVNode$9("", true),
            hasTitleBlock.value ? (_openBlock$a(), _createElementBlock$9("div", _hoisted_13, [
              _renderSlot$3(_ctx.$slots, "titleBlock", {}, void 0, true)
            ])) : (_openBlock$a(), _createElementBlock$9("div", _hoisted_14, [
              hasEyebrow.value ? (_openBlock$a(), _createElementBlock$9("p", _hoisted_15, [
                _renderSlot$3(_ctx.$slots, "eyebrow", {}, void 0, true)
              ])) : _createCommentVNode$9("", true),
              hasTitle.value ? (_openBlock$a(), _createBlock$2(_resolveDynamicComponent(titleTag.value), {
                key: 1,
                class: _normalizeClass$1(["ui-app-header__title", __props.titleLevel === 1 ? "ui-app-header__title--shell" : "ui-app-header__title--screen"])
              }, {
                default: _withCtx$5(() => [
                  _renderSlot$3(_ctx.$slots, "title", {}, void 0, true)
                ]),
                _: 3
              }, 8, ["class"])) : _createCommentVNode$9("", true),
              hasSubline.value ? (_openBlock$a(), _createElementBlock$9("div", _hoisted_16, [
                _renderSlot$3(_ctx.$slots, "subline", {}, void 0, true)
              ])) : _createCommentVNode$9("", true)
            ]))
          ]),
          hasActions.value ? (_openBlock$a(), _createElementBlock$9("div", _hoisted_17, [
            _renderSlot$3(_ctx.$slots, "actions", {}, void 0, true)
          ])) : _createCommentVNode$9("", true)
        ], 64))
      ], 10, _hoisted_1$7);
    };
  }
});

const _export_sfc = (sfc, props) => {
  const target = sfc.__vccOpts || sfc;
  for (const [key, val] of props) {
    target[key] = val;
  }
  return target;
};

const UiAppHeader = /* @__PURE__ */ _export_sfc(_sfc_main$8, [["__scopeId", "data-v-99b36543"]]);

const {defineComponent:_defineComponent$9} = await importShared('vue');

const {renderSlot:_renderSlot$2,normalizeClass:_normalizeClass,openBlock:_openBlock$9,createElementBlock:_createElementBlock$8} = await importShared('vue');

const _hoisted_1$6 = ["type", "disabled"];
const _sfc_main$7 = /* @__PURE__ */ _defineComponent$9({
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
      return _openBlock$9(), _createElementBlock$8("button", {
        type: props.type,
        class: _normalizeClass(["ui-btn", [props.variant, props.size]]),
        disabled: props.disabled
      }, [
        _renderSlot$2(_ctx.$slots, "default", {}, void 0, true)
      ], 10, _hoisted_1$6);
    };
  }
});

const UiButton = /* @__PURE__ */ _export_sfc(_sfc_main$7, [["__scopeId", "data-v-75f51063"]]);

const {useModel:_useModel,mergeModels:_mergeModels,defineComponent:_defineComponent$8} = await importShared('vue');

const {toDisplayString:_toDisplayString$6,openBlock:_openBlock$8,createElementBlock:_createElementBlock$7,createCommentVNode:_createCommentVNode$8,vModelDynamic:_vModelDynamic,mergeProps:_mergeProps,createElementVNode:_createElementVNode$7,withDirectives:_withDirectives} = await importShared('vue');

const _hoisted_1$5 = { class: "ui-field" };
const _hoisted_2$5 = { key: 0 };
const _hoisted_3$5 = ["type", "placeholder", "disabled"];
const _sfc_main$6 = /* @__PURE__ */ _defineComponent$8({
  ...{ inheritAttrs: false },
  __name: "UiInput",
  props: /* @__PURE__ */ _mergeModels({
    label: { default: "" },
    placeholder: { default: "" },
    type: { default: "text" },
    disabled: { type: Boolean, default: false }
  }, {
    "modelValue": { default: "" },
    "modelModifiers": {}
  }),
  emits: ["update:modelValue"],
  setup(__props) {
    const model = _useModel(__props, "modelValue");
    const props = __props;
    return (_ctx, _cache) => {
      return _openBlock$8(), _createElementBlock$7("label", _hoisted_1$5, [
        props.label ? (_openBlock$8(), _createElementBlock$7("span", _hoisted_2$5, _toDisplayString$6(props.label), 1)) : _createCommentVNode$8("", true),
        _withDirectives(_createElementVNode$7("input", _mergeProps({
          "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => model.value = $event)
        }, _ctx.$attrs, {
          type: props.type,
          placeholder: props.placeholder,
          disabled: props.disabled
        }), null, 16, _hoisted_3$5), [
          [_vModelDynamic, model.value]
        ])
      ]);
    };
  }
});

const UiInput = /* @__PURE__ */ _export_sfc(_sfc_main$6, [["__scopeId", "data-v-62bc1414"]]);

const {defineComponent:_defineComponent$7} = await importShared('vue');

const {toDisplayString:_toDisplayString$5,createElementVNode:_createElementVNode$6,renderSlot:_renderSlot$1,withModifiers:_withModifiers$3,openBlock:_openBlock$7,createElementBlock:_createElementBlock$6,createCommentVNode:_createCommentVNode$7} = await importShared('vue');

const {defineComponent:_defineComponent$6} = await importShared('vue');

const {renderSlot:_renderSlot,toDisplayString:_toDisplayString$4,createElementVNode:_createElementVNode$5,openBlock:_openBlock$6,createElementBlock:_createElementBlock$5,createCommentVNode:_createCommentVNode$6} = await importShared('vue');

const {defineComponent:_defineComponent$5} = await importShared('vue');

const {unref:_unref$5,openBlock:_openBlock$5,createBlock:_createBlock$1,createCommentVNode:_createCommentVNode$5} = await importShared('vue');

const {defineComponent} = await importShared('vue');

const _sfc_main$5 = /* @__PURE__ */ _defineComponent$5({
  __name: "ShellVnode",
  props: {
    factory: { type: [Function, null] }
  },
  setup(__props) {
    const Dyn = defineComponent({
      name: "ShellVnodeDyn",
      props: {
        factory: { type: Function, required: true }
      },
      setup(props) {
        return () => props.factory();
      }
    });
    return (_ctx, _cache) => {
      return __props.factory ? (_openBlock$5(), _createBlock$1(_unref$5(Dyn), {
        key: 0,
        factory: __props.factory
      }, null, 8, ["factory"])) : _createCommentVNode$5("", true);
    };
  }
});

class BffHttpError extends Error {
  constructor(status, message, opts) {
    super(message);
    this.name = "BffHttpError";
    this.status = status;
    this.code = opts?.code;
    this.details = opts?.details;
    this.rawBody = opts?.rawBody ?? "";
  }
}
function parseBffErrorBody(text) {
  const t = text.trim();
  if (!t) {
    return null;
  }
  try {
    const j = JSON.parse(t);
    if (!j || typeof j !== "object") {
      return null;
    }
    const o = j;
    if (typeof o.code !== "string" || typeof o.message !== "string") {
      return null;
    }
    let details;
    if (o.details !== void 0 && o.details !== null && typeof o.details === "object") {
      details = o.details;
    }
    return { code: o.code, message: o.message, details };
  } catch {
    return null;
  }
}
async function bffErrorFromResponse(res) {
  let raw = "";
  try {
    raw = await res.text();
  } catch {
    raw = "";
  }
  const parsed = parseBffErrorBody(raw);
  if (parsed) {
    return new BffHttpError(res.status, parsed.message, {
      code: parsed.code,
      details: parsed.details,
      rawBody: raw
    });
  }
  return new BffHttpError(res.status, raw || res.statusText, { rawBody: raw });
}

let defaultClient = null;
function getDefaultBffClient(envValue) {
  if (!defaultClient) {
    defaultClient = createBffClient(resolveBffBaseUrl(envValue));
  }
  return defaultClient;
}

const DEFAULT_BASE = "http://localhost:8080/bff/v1";
function normalizeBase(base) {
  return base.replace(/\/$/, "");
}
function mergeHeaders(init) {
  const h = new Headers(init?.headers);
  if (!h.has("X-Correlation-Id") && typeof crypto !== "undefined" && "randomUUID" in crypto) {
    h.set("X-Correlation-Id", crypto.randomUUID());
  }
  const body = init?.body;
  if (body !== void 0 && body !== null && !(body instanceof FormData) && !(body instanceof Blob) && !h.has("Content-Type")) {
    h.set("Content-Type", "application/json");
  }
  return h;
}
function resolveBffBaseUrl(envValue) {
  if (typeof envValue === "string" && envValue !== "") {
    return normalizeBase(envValue);
  }
  return DEFAULT_BASE;
}
function createBffClient(baseUrl = DEFAULT_BASE) {
  const root = normalizeBase(baseUrl);
  async function bffFetch(path, init) {
    const p = path.startsWith("/") ? path : `/${path}`;
    return fetch(`${root}${p}`, {
      ...init,
      credentials: "include",
      headers: mergeHeaders(init)
    });
  }
  return {
    fetch: bffFetch,
    async json(path, init) {
      const res = await bffFetch(path, init);
      if (!res.ok) {
        throw await bffErrorFromResponse(res);
      }
      if (res.status === 204) {
        return void 0;
      }
      const ct = res.headers.get("Content-Type");
      if (ct?.includes("application/json")) {
        return await res.json();
      }
      return void 0;
    }
  };
}

let client = null;
function getBff() {
  if (!client) {
    const base = `${"/familyMeals/".replace(/\/$/, "")}/bff/v1` ;
    client = getDefaultBffClient(base);
  }
  return client;
}

function isDemoMode() {
  return true;
}

const {ref: ref$4} = await importShared('vue');
const isLoggedIn = ref$4(true );
function useSession() {
  async function refreshSession() {
    {
      isLoggedIn.value = true;
      return;
    }
  }
  async function login(email, password) {
    const bff = getBff();
    const r = await bff.fetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });
    if (!r.ok) {
      const err = await bffErrorFromResponse(r);
      throw new Error(err.message);
    }
    isLoggedIn.value = true;
  }
  async function register(email, password) {
    const bff = getBff();
    const r = await bff.fetch("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });
    if (!r.ok) {
      const err = await bffErrorFromResponse(r);
      throw new Error(err.message);
    }
  }
  async function logout() {
    {
      return;
    }
  }
  return {
    isLoggedIn,
    refreshSession,
    login,
    register,
    logout
  };
}

const {defineComponent:_defineComponent$4} = await importShared('vue');

const {unref:_unref$4,createTextVNode:_createTextVNode$4,withCtx:_withCtx$4,openBlock:_openBlock$4,createBlock:_createBlock,createCommentVNode:_createCommentVNode$4,toDisplayString:_toDisplayString$3,createVNode:_createVNode$4,createSlots:_createSlots,createElementVNode:_createElementVNode$4,Fragment:_Fragment,createElementBlock:_createElementBlock$4,resolveComponent:_resolveComponent$2} = await importShared('vue');

const _hoisted_1$4 = { class: "shell" };
const _hoisted_2$4 = {
  key: 4,
  class: "shell-app-nav"
};
const _hoisted_3$4 = {
  class: "shell-nav",
  "aria-label": "Основная навигация"
};
const _hoisted_4$3 = { class: "content" };
const {resetShellHeader,shellHeaderState} = await importShared('@meal/shell-chrome');
const {watch: watch$1} = await importShared('vue');

const {RouterLink: RouterLink$1,useRoute: useRoute$1} = await importShared('vue-router');
const _sfc_main$4 = /* @__PURE__ */ _defineComponent$4({
  __name: "App",
  setup(__props) {
    const route = useRoute$1();
    const demoMode = isDemoMode();
    const { isLoggedIn, logout } = useSession();
    watch$1(
      () => route.name,
      (name) => {
        if (name === "login" || name === "register" || name === "profile") {
          resetShellHeader();
        }
      }
    );
    async function onLogout() {
      await logout();
    }
    return (_ctx, _cache) => {
      const _component_RouterView = _resolveComponent$2("RouterView");
      return _openBlock$4(), _createElementBlock$4("div", _hoisted_1$4, [
        _unref$4(route).name === "login" && !_unref$4(demoMode) ? (_openBlock$4(), _createBlock(_unref$4(UiAppHeader), {
          key: 0,
          class: "shell-header",
          layout: "centeredTitle",
          "title-level": 1,
          "aria-label": "Шапка входа"
        }, {
          title: _withCtx$4(() => [..._cache[0] || (_cache[0] = [
            _createTextVNode$4("Вход в аккаунт", -1)
          ])]),
          _: 1
        })) : _unref$4(route).name === "register" && !_unref$4(demoMode) ? (_openBlock$4(), _createBlock(_unref$4(UiAppHeader), {
          key: 1,
          class: "shell-header",
          layout: "centeredTitle",
          "title-level": 1,
          "aria-label": "Шапка регистрации"
        }, {
          title: _withCtx$4(() => [..._cache[1] || (_cache[1] = [
            _createTextVNode$4("Регистрация", -1)
          ])]),
          _: 1
        })) : _unref$4(route).name === "profile" ? (_openBlock$4(), _createBlock(_unref$4(UiAppHeader), {
          key: 2,
          class: "shell-header",
          layout: "centeredTitle",
          "title-level": 1,
          "aria-label": "Шапка профиля"
        }, {
          title: _withCtx$4(() => [..._cache[2] || (_cache[2] = [
            _createTextVNode$4("Профиль", -1)
          ])]),
          _: 1
        })) : (_openBlock$4(), _createBlock(_unref$4(UiAppHeader), {
          key: 3,
          class: "shell-header",
          layout: _unref$4(shellHeaderState).layout,
          "title-level": _unref$4(shellHeaderState).titleLevel,
          "title-align": _unref$4(shellHeaderState).titleAlign,
          "aria-label": _unref$4(shellHeaderState).ariaLabel || "Приложение"
        }, _createSlots({ _: 2 }, [
          _unref$4(shellHeaderState).eyebrow ? {
            name: "eyebrow",
            fn: _withCtx$4(() => [
              _createTextVNode$4(_toDisplayString$3(_unref$4(shellHeaderState).eyebrow), 1)
            ]),
            key: "0"
          } : void 0,
          _unref$4(shellHeaderState).title ? {
            name: "title",
            fn: _withCtx$4(() => [
              _createTextVNode$4(_toDisplayString$3(_unref$4(shellHeaderState).title), 1)
            ]),
            key: "1"
          } : void 0,
          _unref$4(shellHeaderState).leadingRender ? {
            name: "leading",
            fn: _withCtx$4(() => [
              _createVNode$4(_sfc_main$5, {
                factory: _unref$4(shellHeaderState).leadingRender
              }, null, 8, ["factory"])
            ]),
            key: "2"
          } : void 0,
          _unref$4(shellHeaderState).sublineRender ? {
            name: "subline",
            fn: _withCtx$4(() => [
              _createVNode$4(_sfc_main$5, {
                factory: _unref$4(shellHeaderState).sublineRender
              }, null, 8, ["factory"])
            ]),
            key: "3"
          } : void 0,
          _unref$4(shellHeaderState).actionsRender ? {
            name: "actions",
            fn: _withCtx$4(() => [
              _createVNode$4(_sfc_main$5, {
                factory: _unref$4(shellHeaderState).actionsRender
              }, null, 8, ["factory"])
            ]),
            key: "4"
          } : void 0
        ]), 1032, ["layout", "title-level", "title-align", "aria-label"])),
        _unref$4(shellHeaderState).showAppNav ? (_openBlock$4(), _createElementBlock$4("div", _hoisted_2$4, [
          _createElementVNode$4("nav", _hoisted_3$4, [
            _unref$4(demoMode) || _unref$4(isLoggedIn) ? (_openBlock$4(), _createElementBlock$4(_Fragment, { key: 0 }, [
              _createVNode$4(_unref$4(RouterLink$1), {
                class: "ui-app-header-link",
                to: "/recipes",
                "data-testid": "nav-recipes"
              }, {
                default: _withCtx$4(() => [..._cache[3] || (_cache[3] = [
                  _createTextVNode$4("Рецепты", -1)
                ])]),
                _: 1
              }),
              _createVNode$4(_unref$4(RouterLink$1), {
                class: "ui-app-header-link",
                to: "/planner",
                "data-testid": "nav-planner"
              }, {
                default: _withCtx$4(() => [..._cache[4] || (_cache[4] = [
                  _createTextVNode$4("Планировщик", -1)
                ])]),
                _: 1
              }),
              !_unref$4(demoMode) ? (_openBlock$4(), _createElementBlock$4(_Fragment, { key: 0 }, [
                _createVNode$4(_unref$4(RouterLink$1), {
                  class: "ui-app-header-link ui-app-header-link--secondary",
                  to: "/profile",
                  "data-testid": "nav-profile"
                }, {
                  default: _withCtx$4(() => [..._cache[5] || (_cache[5] = [
                    _createTextVNode$4(" Профиль ", -1)
                  ])]),
                  _: 1
                }),
                _createElementVNode$4("button", {
                  type: "button",
                  class: "ui-app-header-link ui-app-header-link--secondary",
                  "data-testid": "logout-button",
                  onClick: onLogout
                }, " Выйти ")
              ], 64)) : _createCommentVNode$4("", true)
            ], 64)) : (_openBlock$4(), _createElementBlock$4(_Fragment, { key: 1 }, [
              _createVNode$4(_unref$4(RouterLink$1), {
                class: "ui-app-header-link ui-app-header-link--secondary",
                to: "/login",
                "data-testid": "nav-login"
              }, {
                default: _withCtx$4(() => [..._cache[6] || (_cache[6] = [
                  _createTextVNode$4(" Вход ", -1)
                ])]),
                _: 1
              }),
              _createVNode$4(_unref$4(RouterLink$1), {
                class: "ui-app-header-link",
                to: "/register",
                "data-testid": "nav-register"
              }, {
                default: _withCtx$4(() => [..._cache[7] || (_cache[7] = [
                  _createTextVNode$4("Регистрация", -1)
                ])]),
                _: 1
              })
            ], 64))
          ])
        ])) : _createCommentVNode$4("", true),
        _createElementVNode$4("main", _hoisted_4$3, [
          _createVNode$4(_component_RouterView)
        ])
      ]);
    };
  }
});

const App = /* @__PURE__ */ _export_sfc(_sfc_main$4, [["__scopeId", "data-v-cbdbd760"]]);

const remotesMap = {
'mf_recipes':{url:'/familyMeals/mf-recipes/assets/remoteEntry.js',format:'esm',from:'vite'},
  'mf_planner':{url:'/familyMeals/mf-planner/assets/remoteEntry.js',format:'esm',from:'vite'},
  'mf_shopping':{url:'/familyMeals/mf-shopping/assets/remoteEntry.js',format:'esm',from:'vite'}
};
                const currentImports = {};
                const loadJS = async (url, fn) => {
                    const resolvedUrl = typeof url === 'function' ? await url() : url;
                    const script = document.createElement('script');
                    script.type = 'text/javascript';
                    script.onload = fn;
                    script.src = resolvedUrl;
                    document.getElementsByTagName('head')[0].appendChild(script);
                };

                function get(name, remoteFrom) {
                    return __federation_import(name).then(module => () => {
                        if (remoteFrom === 'webpack') {
                            return Object.prototype.toString.call(module).indexOf('Module') > -1 && module.default ? module.default : module
                        }
                        return module
                    })
                }
                
                function merge(obj1, obj2) {
                  const mergedObj = Object.assign(obj1, obj2);
                  for (const key of Object.keys(mergedObj)) {
                    if (typeof mergedObj[key] === 'object' && typeof obj2[key] === 'object') {
                      mergedObj[key] = merge(mergedObj[key], obj2[key]);
                    }
                  }
                  return mergedObj;
                }

                const wrapShareModule = remoteFrom => {
                  return merge({
                    'vue':{'3.5.30':{get:()=>get(new URL('__federation_shared_vue-BzKvbPDO.js', import.meta.url).href, remoteFrom), loaded:1}},'vue-router':{'4.6.4':{get:()=>get(new URL('__federation_shared_vue-router-Bhzjv2H2.js', import.meta.url).href, remoteFrom), loaded:1}},'@meal/shell-chrome':{'0.0.1':{get:()=>get(new URL('__federation_shared_@meal/shell-chrome-CF-TFgvq.js', import.meta.url).href, remoteFrom), loaded:1}}
                  }, (globalThis.__federation_shared__ || {})['default'] || {});
                };

                async function __federation_import(name) {
                    currentImports[name] ??= import(name);
                    return currentImports[name]
                }

                async function __federation_method_ensure(remoteId) {
                    const remote = remotesMap[remoteId];
                    if (!remote.inited) {
                        if ('var' === remote.format) {
                            // loading js with script tag
                            return new Promise(resolve => {
                                const callback = () => {
                                    if (!remote.inited) {
                                        remote.lib = window[remoteId];
                                        remote.lib.init(wrapShareModule(remote.from));
                                        remote.inited = true;
                                    }
                                    resolve(remote.lib);
                                };
                                return loadJS(remote.url, callback);
                            });
                        } else if (['esm', 'systemjs'].includes(remote.format)) {
                            // loading js with import(...)
                            return new Promise((resolve, reject) => {
                                const getUrl = typeof remote.url === 'function' ? remote.url : () => Promise.resolve(remote.url);
                                getUrl().then(url => {
                                    import(/* @vite-ignore */ url).then(lib => {
                                        if (!remote.inited) {
                                            const shareScope = wrapShareModule(remote.from);
                                            lib.init(shareScope);
                                            remote.lib = lib;
                                            remote.lib.init(shareScope);
                                            remote.inited = true;
                                        }
                                        resolve(remote.lib);
                                    }).catch(reject);
                                });
                            })
                        }
                    } else {
                        return remote.lib;
                    }
                }

                function __federation_method_wrapDefault(module, need) {
                    if (!module?.default && need) {
                        let obj = Object.create(null);
                        obj.default = module;
                        obj.__esModule = true;
                        return obj;
                    }
                    return module;
                }

                function __federation_method_getRemote(remoteName, componentName) {
                    return __federation_method_ensure(remoteName).then((remote) => remote.get(componentName).then(factory => factory()));
                }

const {defineComponent:_defineComponent$3} = await importShared('vue');

const {unref:_unref$3,createElementVNode:_createElementVNode$3,openBlock:_openBlock$3,createElementBlock:_createElementBlock$3,createCommentVNode:_createCommentVNode$3,createTextVNode:_createTextVNode$3,withCtx:_withCtx$3,createVNode:_createVNode$3} = await importShared('vue');

const _hoisted_1$3 = { class: "home" };
const _hoisted_2$3 = {
  key: 0,
  class: "session-card session-card-ok",
  "data-testid": "session-banner"
};
const _hoisted_3$3 = {
  key: 1,
  class: "session-card",
  "data-testid": "session-guest"
};
const _hoisted_4$2 = {
  key: 2,
  class: "tiles",
  "aria-label": "Разделы"
};
const {setShellHeader} = await importShared('@meal/shell-chrome');

const {h,onMounted,ref: ref$3,watch} = await importShared('vue');

const {RouterLink,useRouter: useRouter$3} = await importShared('vue-router');
const _sfc_main$3 = /* @__PURE__ */ _defineComponent$3({
  __name: "HomeView",
  setup(__props) {
    const { isLoggedIn, refreshSession } = useSession();
    const router = useRouter$3();
    const bffStatus = ref$3("BFF: …");
    function applyHomeShell() {
      setShellHeader({
        ariaLabel: "Главная страница",
        title: "Добро пожаловать",
        showAppNav: true,
        leadingRender: null,
        actionsRender: null,
        sublineRender: () => h("div", { class: "shell-host-welcome" }, [
          h(
            "p",
            { class: "shell-host-welcome__lead" },
            "Планируйте питание на неделю, собирайте рецепты и формируйте список покупок."
          ),
          h("p", { class: "shell-host-welcome__bff" }, bffStatus.value)
        ])
      });
    }
    watch(bffStatus, applyHomeShell);
    onMounted(async () => {
      applyHomeShell();
      const bff = getBff();
      try {
        const health = await bff.json("/health");
        bffStatus.value = health?.status === "ok" ? "BFF: ok" : "BFF: неожиданный ответ";
      } catch {
        bffStatus.value = "BFF: нет связи";
      }
      await refreshSession();
      applyHomeShell();
      {
        await router.replace("/recipes");
        return;
      }
    });
    return (_ctx, _cache) => {
      return _openBlock$3(), _createElementBlock$3("section", _hoisted_1$3, [
        _unref$3(isLoggedIn) === true ? (_openBlock$3(), _createElementBlock$3("article", _hoisted_2$3, [..._cache[0] || (_cache[0] = [
          _createElementVNode$3("h3", null, "Сессия активна", -1),
          _createElementVNode$3("p", { class: "muted" }, "Можно переходить к рецептам и планировщику.", -1)
        ])])) : _unref$3(isLoggedIn) === false ? (_openBlock$3(), _createElementBlock$3("article", _hoisted_3$3, [..._cache[1] || (_cache[1] = [
          _createElementVNode$3("h3", null, "Гостевой режим", -1),
          _createElementVNode$3("p", { class: "muted" }, "Войдите или зарегистрируйтесь, чтобы открыть рабочие разделы.", -1)
        ])])) : _createCommentVNode$3("", true),
        _unref$3(isLoggedIn) ? (_openBlock$3(), _createElementBlock$3("nav", _hoisted_4$2, [
          _createVNode$3(_unref$3(RouterLink), {
            class: "tile tile-primary",
            to: "/recipes"
          }, {
            default: _withCtx$3(() => [..._cache[2] || (_cache[2] = [
              _createTextVNode$3("Рецепты", -1)
            ])]),
            _: 1
          }),
          _createVNode$3(_unref$3(RouterLink), {
            class: "tile tile-secondary",
            to: "/planner"
          }, {
            default: _withCtx$3(() => [..._cache[3] || (_cache[3] = [
              _createTextVNode$3("Планировщик", -1)
            ])]),
            _: 1
          })
        ])) : _createCommentVNode$3("", true)
      ]);
    };
  }
});

const HomeView = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["__scopeId", "data-v-72b24ead"]]);

const {defineComponent:_defineComponent$2} = await importShared('vue');

const {unref:_unref$2,createVNode:_createVNode$2,createElementVNode:_createElementVNode$2,toDisplayString:_toDisplayString$2,openBlock:_openBlock$2,createElementBlock:_createElementBlock$2,createCommentVNode:_createCommentVNode$2,createTextVNode:_createTextVNode$2,withCtx:_withCtx$2,withModifiers:_withModifiers$2,resolveComponent:_resolveComponent$1} = await importShared('vue');

const _hoisted_1$2 = {
  class: "auth-card",
  "aria-label": "Форма входа"
};
const _hoisted_2$2 = { class: "field" };
const _hoisted_3$2 = { class: "field" };
const _hoisted_4$1 = {
  key: 0,
  class: "err",
  "data-testid": "login-error"
};
const _hoisted_5$1 = { class: "hint" };
const {ref: ref$2} = await importShared('vue');

const {useRoute,useRouter: useRouter$2} = await importShared('vue-router');
const _sfc_main$2 = /* @__PURE__ */ _defineComponent$2({
  __name: "LoginView",
  setup(__props) {
    const router = useRouter$2();
    const route = useRoute();
    const { login } = useSession();
    const email = ref$2("");
    const password = ref$2("");
    const error = ref$2("");
    const busy = ref$2(false);
    async function onSubmit() {
      error.value = "";
      busy.value = true;
      try {
        await login(email.value.trim(), password.value);
        const redir = route.query.redirect;
        if (typeof redir === "string" && redir.startsWith("/") && !redir.startsWith("//")) {
          await router.push(redir);
        } else {
          await router.push({ name: "home" });
        }
      } catch (e) {
        error.value = e instanceof Error ? e.message : "Ошибка входа";
      } finally {
        busy.value = false;
      }
    }
    return (_ctx, _cache) => {
      const _component_RouterLink = _resolveComponent$1("RouterLink");
      return _openBlock$2(), _createElementBlock$2("section", _hoisted_1$2, [
        _createElementVNode$2("form", {
          class: "form",
          onSubmit: _withModifiers$2(onSubmit, ["prevent"])
        }, [
          _createElementVNode$2("label", _hoisted_2$2, [
            _createVNode$2(_unref$2(UiInput), {
              modelValue: email.value,
              "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => email.value = $event),
              label: "Email",
              type: "email",
              placeholder: "user@example.com",
              "data-testid": "login-email"
            }, null, 8, ["modelValue"])
          ]),
          _createElementVNode$2("label", _hoisted_3$2, [
            _createVNode$2(_unref$2(UiInput), {
              modelValue: password.value,
              "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => password.value = $event),
              label: "Пароль",
              type: "password",
              placeholder: "********",
              "data-testid": "login-password"
            }, null, 8, ["modelValue"])
          ]),
          error.value ? (_openBlock$2(), _createElementBlock$2("p", _hoisted_4$1, _toDisplayString$2(error.value), 1)) : _createCommentVNode$2("", true),
          _createVNode$2(_unref$2(UiButton), {
            type: "submit",
            disabled: busy.value,
            "data-testid": "login-submit"
          }, {
            default: _withCtx$2(() => [
              _createTextVNode$2(_toDisplayString$2(busy.value ? "…" : "Войти"), 1)
            ]),
            _: 1
          }, 8, ["disabled"])
        ], 32),
        _createElementVNode$2("p", _hoisted_5$1, [
          _cache[3] || (_cache[3] = _createTextVNode$2(" Нет аккаунта? ", -1)),
          _createVNode$2(_component_RouterLink, { to: "/register" }, {
            default: _withCtx$2(() => [..._cache[2] || (_cache[2] = [
              _createTextVNode$2("Регистрация", -1)
            ])]),
            _: 1
          })
        ])
      ]);
    };
  }
});

const LoginView = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["__scopeId", "data-v-adaff1ff"]]);

const {defineComponent:_defineComponent$1} = await importShared('vue');

const {unref:_unref$1,createVNode:_createVNode$1,createElementVNode:_createElementVNode$1,toDisplayString:_toDisplayString$1,openBlock:_openBlock$1,createElementBlock:_createElementBlock$1,createCommentVNode:_createCommentVNode$1,createTextVNode:_createTextVNode$1,withCtx:_withCtx$1,withModifiers:_withModifiers$1,resolveComponent:_resolveComponent} = await importShared('vue');

const _hoisted_1$1 = {
  class: "auth-card",
  "aria-label": "Форма регистрации"
};
const _hoisted_2$1 = { class: "field" };
const _hoisted_3$1 = { class: "field" };
const _hoisted_4 = {
  key: 0,
  class: "err",
  "data-testid": "register-error"
};
const _hoisted_5 = { class: "hint" };
const {ref: ref$1} = await importShared('vue');

const {useRouter: useRouter$1} = await importShared('vue-router');
const _sfc_main$1 = /* @__PURE__ */ _defineComponent$1({
  __name: "RegisterView",
  setup(__props) {
    const router = useRouter$1();
    const { register, login } = useSession();
    const email = ref$1("");
    const password = ref$1("");
    const error = ref$1("");
    const busy = ref$1(false);
    async function onSubmit() {
      error.value = "";
      busy.value = true;
      try {
        await register(email.value.trim(), password.value);
        await login(email.value.trim(), password.value);
        await router.push({ name: "home" });
      } catch (e) {
        error.value = e instanceof Error ? e.message : "Ошибка регистрации";
      } finally {
        busy.value = false;
      }
    }
    return (_ctx, _cache) => {
      const _component_RouterLink = _resolveComponent("RouterLink");
      return _openBlock$1(), _createElementBlock$1("section", _hoisted_1$1, [
        _createElementVNode$1("form", {
          class: "form",
          onSubmit: _withModifiers$1(onSubmit, ["prevent"])
        }, [
          _createElementVNode$1("label", _hoisted_2$1, [
            _createVNode$1(_unref$1(UiInput), {
              modelValue: email.value,
              "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => email.value = $event),
              label: "Email",
              type: "email",
              placeholder: "user@example.com",
              autocomplete: "username",
              required: "",
              "data-testid": "register-email"
            }, null, 8, ["modelValue"])
          ]),
          _createElementVNode$1("label", _hoisted_3$1, [
            _createVNode$1(_unref$1(UiInput), {
              modelValue: password.value,
              "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => password.value = $event),
              label: "Пароль (мин. 8 символов)",
              type: "password",
              placeholder: "********",
              autocomplete: "new-password",
              required: "",
              minlength: "8",
              "data-testid": "register-password"
            }, null, 8, ["modelValue"])
          ]),
          error.value ? (_openBlock$1(), _createElementBlock$1("p", _hoisted_4, _toDisplayString$1(error.value), 1)) : _createCommentVNode$1("", true),
          _createVNode$1(_unref$1(UiButton), {
            type: "submit",
            disabled: busy.value,
            "data-testid": "register-submit"
          }, {
            default: _withCtx$1(() => [
              _createTextVNode$1(_toDisplayString$1(busy.value ? "…" : "Создать аккаунт"), 1)
            ]),
            _: 1
          }, 8, ["disabled"])
        ], 32),
        _createElementVNode$1("p", _hoisted_5, [
          _cache[3] || (_cache[3] = _createTextVNode$1(" Уже есть аккаунт? ", -1)),
          _createVNode$1(_component_RouterLink, { to: "/login" }, {
            default: _withCtx$1(() => [..._cache[2] || (_cache[2] = [
              _createTextVNode$1("Вход", -1)
            ])]),
            _: 1
          })
        ])
      ]);
    };
  }
});

const RegisterView = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["__scopeId", "data-v-b2b18f75"]]);

const {defineComponent:_defineComponent} = await importShared('vue');

const {createElementVNode:_createElementVNode,unref:_unref,createVNode:_createVNode,toDisplayString:_toDisplayString,openBlock:_openBlock,createElementBlock:_createElementBlock,createCommentVNode:_createCommentVNode,createTextVNode:_createTextVNode,withCtx:_withCtx,withModifiers:_withModifiers} = await importShared('vue');

const _hoisted_1 = {
  class: "auth-card",
  "aria-label": "Профиль"
};
const _hoisted_2 = {
  key: 0,
  class: "err",
  "data-testid": "profile-error"
};
const _hoisted_3 = {
  key: 1,
  class: "ok",
  "data-testid": "profile-success"
};
const {ref} = await importShared('vue');

const {useRouter} = await importShared('vue-router');
const _sfc_main = /* @__PURE__ */ _defineComponent({
  __name: "ProfileView",
  setup(__props) {
    const router = useRouter();
    const { logout } = useSession();
    const currentPassword = ref("");
    const newPassword = ref("");
    const confirmPassword = ref("");
    const error = ref("");
    const success = ref("");
    const busy = ref(false);
    async function onSubmit() {
      error.value = "";
      success.value = "";
      if (newPassword.value.length < 8) {
        error.value = "Новый пароль должен быть не короче 8 символов.";
        return;
      }
      if (newPassword.value !== confirmPassword.value) {
        error.value = "Пароли не совпадают.";
        return;
      }
      busy.value = true;
      try {
        const bff = getBff();
        const r = await bff.fetch("/auth/password", {
          method: "POST",
          body: JSON.stringify({
            currentPassword: currentPassword.value,
            newPassword: newPassword.value
          })
        });
        if (!r.ok) {
          const err = await bffErrorFromResponse(r);
          throw new Error(err.message);
        }
        success.value = "Пароль обновлён.";
        currentPassword.value = "";
        newPassword.value = "";
        confirmPassword.value = "";
      } catch (e) {
        error.value = e instanceof Error ? e.message : "Не удалось сменить пароль.";
      } finally {
        busy.value = false;
      }
    }
    async function onLogout() {
      await logout();
      await router.push({ name: "login" });
    }
    return (_ctx, _cache) => {
      return _openBlock(), _createElementBlock("section", _hoisted_1, [
        _cache[4] || (_cache[4] = _createElementVNode("h2", { class: "heading" }, "Профиль", -1)),
        _cache[5] || (_cache[5] = _createElementVNode("p", { class: "muted" }, "Смена пароля и выход из аккаунта.", -1)),
        _createElementVNode("form", {
          class: "form",
          onSubmit: _withModifiers(onSubmit, ["prevent"])
        }, [
          _createVNode(_unref(UiInput), {
            modelValue: currentPassword.value,
            "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => currentPassword.value = $event),
            label: "Текущий пароль",
            type: "password",
            autocomplete: "current-password",
            "data-testid": "profile-current-password"
          }, null, 8, ["modelValue"]),
          _createVNode(_unref(UiInput), {
            modelValue: newPassword.value,
            "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => newPassword.value = $event),
            label: "Новый пароль",
            type: "password",
            autocomplete: "new-password",
            "data-testid": "profile-new-password"
          }, null, 8, ["modelValue"]),
          _createVNode(_unref(UiInput), {
            modelValue: confirmPassword.value,
            "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => confirmPassword.value = $event),
            label: "Подтверждение пароля",
            type: "password",
            autocomplete: "new-password",
            "data-testid": "profile-confirm-password"
          }, null, 8, ["modelValue"]),
          error.value ? (_openBlock(), _createElementBlock("p", _hoisted_2, _toDisplayString(error.value), 1)) : _createCommentVNode("", true),
          success.value ? (_openBlock(), _createElementBlock("p", _hoisted_3, _toDisplayString(success.value), 1)) : _createCommentVNode("", true),
          _createVNode(_unref(UiButton), {
            type: "submit",
            disabled: busy.value,
            "data-testid": "profile-submit"
          }, {
            default: _withCtx(() => [
              _createTextVNode(_toDisplayString(busy.value ? "…" : "Сменить пароль"), 1)
            ]),
            _: 1
          }, 8, ["disabled"])
        ], 32),
        _createVNode(_unref(UiButton), {
          variant: "secondary",
          "data-testid": "profile-logout",
          onClick: onLogout
        }, {
          default: _withCtx(() => [..._cache[3] || (_cache[3] = [
            _createTextVNode("Выйти", -1)
          ])]),
          _: 1
        })
      ]);
    };
  }
});

const ProfileView = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-945eed9e"]]);

const APP_ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  PROFILE: "/profile",
  RECIPES: "/recipes",
  RECIPES_IMPORT: "/recipes/import",
  RECIPES_NEW: "/recipes/new",
  RECIPE_EDIT: "/recipes/:id/edit",
  RECIPE_DETAIL: "/recipes/:id",
  PLANNER: "/planner",
  SHOPPING: "/shopping/:listId"
};

const {createRouter,createWebHistory} = await importShared('vue-router');
const RecipesLibrary = () => __federation_method_getRemote("mf_recipes" , "./Library").then(module=>__federation_method_wrapDefault(module, true));
const RecipesImport = () => __federation_method_getRemote("mf_recipes" , "./ImportView").then(module=>__federation_method_wrapDefault(module, true));
const RecipeDetail = () => __federation_method_getRemote("mf_recipes" , "./RecipeDetail").then(module=>__federation_method_wrapDefault(module, true));
const RecipeForm = () => __federation_method_getRemote("mf_recipes" , "./RecipeForm").then(module=>__federation_method_wrapDefault(module, true));
const PlannerPage = () => __federation_method_getRemote("mf_planner" , "./PlannerPage").then(module=>__federation_method_wrapDefault(module, true));
const ShoppingPage = () => __federation_method_getRemote("mf_shopping" , "./ShoppingPage").then(module=>__federation_method_wrapDefault(module, true));
const router = createRouter({
  history: createWebHistory("/familyMeals/"),
  routes: [
    { path: APP_ROUTES.HOME, name: "home", component: HomeView },
    { path: APP_ROUTES.LOGIN, name: "login", component: LoginView },
    { path: APP_ROUTES.REGISTER, name: "register", component: RegisterView },
    { path: APP_ROUTES.PROFILE, name: "profile", component: ProfileView, meta: { requiresAuth: true } },
    { path: APP_ROUTES.RECIPES, name: "recipes", component: RecipesLibrary, meta: { requiresAuth: true } },
    { path: APP_ROUTES.RECIPES_IMPORT, name: "recipes-import", component: RecipesImport, meta: { requiresAuth: true } },
    { path: APP_ROUTES.RECIPES_NEW, name: "recipe-new", component: RecipeForm, meta: { requiresAuth: true } },
    { path: APP_ROUTES.RECIPE_EDIT, name: "recipe-edit", component: RecipeForm, meta: { requiresAuth: true } },
    { path: APP_ROUTES.RECIPE_DETAIL, name: "recipe-detail", component: RecipeDetail, meta: { requiresAuth: true } },
    { path: APP_ROUTES.PLANNER, name: "planner", component: PlannerPage, meta: { requiresAuth: true } },
    { path: APP_ROUTES.SHOPPING, name: "shopping", component: ShoppingPage, meta: { requiresAuth: true } }
  ]
});
router.beforeEach(async (to) => {
  {
    if (to.name === "login" || to.name === "register" || to.name === "profile") {
      return { name: "recipes" };
    }
    return true;
  }
});

const {createApp} = await importShared('vue');
async function bootstrap() {
  {
    const { startDemoMocks } = await __vitePreload(async () => { const { startDemoMocks } = await import('./browser-DMjjyIcU.js');return { startDemoMocks }},true?__vite__mapDeps([0,1]):void 0);
    await startDemoMocks();
  }
  createApp(App).use(router).mount("#app");
}
void bootstrap();
