import { importShared } from './__federation_fn_import-D4I1MtYd.js';
import { i as isBffHttpError, a as bffErrorMessage, _ as _export_sfc } from './_plugin-vue_export-helper-DSX2Nh7D.js';
import { u as useBff } from './useBff-BRmUgJVQ.js';

const {defineComponent:_defineComponent} = await importShared('vue');

const {createElementVNode:_createElementVNode,createTextVNode:_createTextVNode,vModelText:_vModelText,withDirectives:_withDirectives,toDisplayString:_toDisplayString,openBlock:_openBlock,createElementBlock:_createElementBlock,createCommentVNode:_createCommentVNode,withModifiers:_withModifiers} = await importShared('vue');

const _hoisted_1 = { class: "mf-root" };
const _hoisted_2 = {
  key: 0,
  class: "err"
};
const _hoisted_3 = ["disabled"];
const {setShellHeader} = await importShared('@meal/shell-chrome');

const {h,onMounted,ref} = await importShared('vue');

const {RouterLink,useRouter} = await importShared('vue-router');
const _sfc_main = /* @__PURE__ */ _defineComponent({
  __name: "ImportView",
  setup(__props) {
    const bff = useBff();
    const router = useRouter();
    const url = ref("");
    const loading = ref(false);
    const error = ref("");
    onMounted(() => {
      setShellHeader({
        ariaLabel: "Шапка импорта",
        eyebrow: "Import",
        title: "Импорт по URL",
        showAppNav: true,
        leadingRender: () => h(RouterLink, { to: "/recipes", class: "ui-app-header-link ui-app-header-link--back" }, () => "← К библиотеке"),
        sublineRender: null,
        actionsRender: null
      });
    });
    function importErrorMessage(e) {
      if (!isBffHttpError(e)) {
        return bffErrorMessage(e);
      }
      switch (e.code) {
        case "URL_NOT_ALLOWED":
          return "Этот сайт не в списке разрешённых (IMPORT_ALLOWED_HOSTS). Введите рецепт вручную или укажите URL с разрешённого хоста.";
        case "INVALID_URL":
          return "Некорректный URL.";
        case "UPSTREAM_TIMEOUT":
          return "Сервер долго ждал ответ сайта. Попробуйте позже.";
        case "FETCH_FAILED":
          return "Не удалось загрузить страницу. Проверьте URL и сеть.";
        case "PARSE_FAILED":
          return "Не удалось извлечь рецепт со страницы. Создайте рецепт вручную.";
        default:
          return e.message;
      }
    }
    async function submit() {
      loading.value = true;
      error.value = "";
      try {
        const draft = await bff.json("/import/url", {
          method: "POST",
          body: JSON.stringify({ url: url.value.trim() })
        });
        sessionStorage.setItem("meal_import_draft", JSON.stringify(draft));
        await router.push({ path: "/recipes/new", query: { fromImport: "1" } });
      } catch (e) {
        error.value = importErrorMessage(e);
      } finally {
        loading.value = false;
      }
    }
    return (_ctx, _cache) => {
      return _openBlock(), _createElementBlock("section", _hoisted_1, [
        _cache[2] || (_cache[2] = _createElementVNode("p", { class: "muted" }, [
          _createTextVNode(" Поддерживаются импорт с сайтов "),
          _createElementVNode("strong", null, "eda.ru"),
          _createTextVNode(" и "),
          _createElementVNode("strong", null, "povarenok.ru"),
          _createTextVNode(". Для локальной проверки можно использовать фикстуру: "),
          _createElementVNode("code", null, "http://import-fixtures/eda/borsch.html")
        ], -1)),
        _createElementVNode("form", {
          class: "form",
          onSubmit: _withModifiers(submit, ["prevent"])
        }, [
          _createElementVNode("label", null, [
            _cache[1] || (_cache[1] = _createTextVNode(" URL рецепта ", -1)),
            _withDirectives(_createElementVNode("input", {
              "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => url.value = $event),
              type: "url",
              required: "",
              placeholder: "https://eda.ru/recepty/..."
            }, null, 512), [
              [_vModelText, url.value]
            ])
          ]),
          error.value ? (_openBlock(), _createElementBlock("p", _hoisted_2, _toDisplayString(error.value), 1)) : _createCommentVNode("", true),
          _createElementVNode("button", {
            type: "submit",
            class: "btn",
            disabled: loading.value
          }, _toDisplayString(loading.value ? "Импорт…" : "Импортировать"), 9, _hoisted_3)
        ], 32)
      ]);
    };
  }
});

const ImportView = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-7d8197f0"]]);

export { ImportView as default };
