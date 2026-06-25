import { importShared } from './__federation_fn_import-D4I1MtYd.js';
import { c as createBffClient, r as resolveBffBaseUrl, _ as _export_sfc } from './_plugin-vue_export-helper-CflmyXFI.js';

const {defineComponent:_defineComponent} = await importShared('vue');

const {openBlock:_openBlock,createElementBlock:_createElementBlock} = await importShared('vue');

const _hoisted_1 = { class: "mf-root" };
const {setShellHeader} = await importShared('@meal/shell-chrome');

const {h,onMounted,ref,watch} = await importShared('vue');

const _sfc_main = /* @__PURE__ */ _defineComponent({
  __name: "Entry",
  setup(__props) {
    const bffLine = ref("");
    function pushEntryShell() {
      setShellHeader({
        ariaLabel: "Микрофронт планировщика",
        title: "Планировщик (mf-planner)",
        showAppNav: false,
        sublineRender: () => h("div", null, [
          h("p", { class: "mf-entry-intro" }, "Неделя, слоты, DnD, панель периода для списка покупок."),
          h("p", { class: "mf-entry-meta" }, bffLine.value)
        ])
      });
    }
    watch(bffLine, pushEntryShell);
    onMounted(async () => {
      const bff = createBffClient(resolveBffBaseUrl("/familyMeals/bff/v1"));
      try {
        await bff.json("/health");
        bffLine.value = "Клиент BFF: credentials include; далее GET /plan/week и PATCH слотов.";
      } catch {
        bffLine.value = "BFF недоступен — см. frontend/README.md (CORS, VITE_BFF_BASE_URL).";
      }
      pushEntryShell();
    });
    return (_ctx, _cache) => {
      return _openBlock(), _createElementBlock("section", _hoisted_1);
    };
  }
});

const Entry = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-541b0c41"]]);

export { Entry as default };
