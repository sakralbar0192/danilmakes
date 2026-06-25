import { importShared } from './__federation_fn_import-D4I1MtYd.js';
import { a as bffErrorMessage, _ as _export_sfc } from './_plugin-vue_export-helper-DSX2Nh7D.js';
import { u as useBff } from './useBff-BRmUgJVQ.js';

const {defineComponent:_defineComponent} = await importShared('vue');

const {openBlock:_openBlock,createElementBlock:_createElementBlock,createCommentVNode:_createCommentVNode,vModelText:_vModelText,createElementVNode:_createElementVNode,withDirectives:_withDirectives,createTextVNode:_createTextVNode,renderList:_renderList,Fragment:_Fragment,vModelCheckbox:_vModelCheckbox,toDisplayString:_toDisplayString,withModifiers:_withModifiers} = await importShared('vue');

const _hoisted_1 = { class: "mf-root" };
const _hoisted_2 = {
  key: 0,
  class: "muted"
};
const _hoisted_3 = {
  key: 0,
  class: "image-preview"
};
const _hoisted_4 = ["src"];
const _hoisted_5 = { class: "nutrition-row" };
const _hoisted_6 = ["onUpdate:modelValue"];
const _hoisted_7 = { class: "inline" };
const _hoisted_8 = ["onUpdate:modelValue", "onChange"];
const _hoisted_9 = ["onUpdate:modelValue", "disabled"];
const _hoisted_10 = ["onUpdate:modelValue", "disabled"];
const _hoisted_11 = ["onUpdate:modelValue"];
const _hoisted_12 = ["onClick"];
const _hoisted_13 = {
  key: 1,
  class: "err"
};
const _hoisted_14 = ["disabled"];
const {setShellHeader} = await importShared('@meal/shell-chrome');

const {computed,h,onMounted,reactive,ref,watch} = await importShared('vue');

const {RouterLink,useRoute,useRouter} = await importShared('vue-router');
const _sfc_main = /* @__PURE__ */ _defineComponent({
  __name: "RecipeForm",
  setup(__props) {
    const route = useRoute();
    const router = useRouter();
    const bff = useBff();
    const isCreate = ref(route.name === "recipe-new");
    const shellTitle = computed(() => isCreate.value ? "Новый рецепт" : "Редактор рецепта");
    function applyRecipeFormShell() {
      setShellHeader({
        ariaLabel: "Шапка редактора рецепта",
        title: shellTitle.value,
        showAppNav: true,
        eyebrow: null,
        leadingRender: null,
        sublineRender: null,
        actionsRender: () => h(RouterLink, { to: "/recipes", class: "ui-app-header-link--accent" }, () => "К библиотеке")
      });
    }
    watch(shellTitle, applyRecipeFormShell);
    const loading = ref(!isCreate.value);
    const saving = ref(false);
    const error = ref("");
    const title = ref("");
    const stepsText = ref("");
    const cookTimeMinutes = ref("");
    const mealCategory = ref("");
    const sourceUrl = ref("");
    const note = ref("");
    const imageUrl = ref("");
    const proteinG = ref("");
    const fatG = ref("");
    const carbsG = ref("");
    const calories = ref("");
    const ingredients = reactive([
      { name: "", productCategory: "other", quantity: null, unit: "", toTaste: false }
    ]);
    function addIngredient() {
      ingredients.push({ name: "", productCategory: "other", quantity: null, unit: "", toTaste: false });
    }
    function removeIngredient(i) {
      if (ingredients.length > 1) {
        ingredients.splice(i, 1);
      }
    }
    function onToTasteChange(ing) {
      if (ing.toTaste) {
        ing.quantity = null;
        ing.unit = "";
      }
    }
    function parseSteps() {
      return stepsText.value.split("\n").map((s) => s.trim()).filter(Boolean);
    }
    function payloadFromForm() {
      const ings = ingredients.filter((i) => i.name.trim() !== "").map((i) => ({
        name: i.name.trim(),
        productCategory: (i.productCategory.trim() || "other").toLowerCase(),
        quantity: i.toTaste || i.quantity == null || i.quantity === "" ? null : Number(i.quantity),
        unit: i.toTaste ? void 0 : i.unit?.trim() || void 0
      }));
      const body = {
        title: title.value.trim(),
        ingredients: ings,
        steps: parseSteps()
      };
      if (cookTimeMinutes.value !== "") {
        body.cookTimeMinutes = Number(cookTimeMinutes.value);
      }
      if (mealCategory.value.trim()) {
        body.mealCategory = mealCategory.value.trim();
      }
      if (sourceUrl.value.trim()) {
        body.sourceUrl = sourceUrl.value.trim();
      }
      if (note.value.trim()) {
        body.note = note.value.trim();
      }
      if (imageUrl.value.trim()) {
        body.imageUrl = imageUrl.value.trim();
      }
      const nutrition = {};
      if (proteinG.value !== "") nutrition.proteinG = Number(proteinG.value);
      if (fatG.value !== "") nutrition.fatG = Number(fatG.value);
      if (carbsG.value !== "") nutrition.carbsG = Number(carbsG.value);
      if (calories.value !== "") nutrition.calories = Number(calories.value);
      if (Object.keys(nutrition).length) {
        body.nutrition = nutrition;
      }
      return body;
    }
    async function loadEdit() {
      const id = route.params.id;
      loading.value = true;
      error.value = "";
      try {
        const r = await bff.json(`/recipes/${id}`);
        title.value = r.title;
        stepsText.value = (r.steps ?? []).join("\n");
        cookTimeMinutes.value = r.cookTimeMinutes ?? "";
        mealCategory.value = r.mealCategory ?? "";
        sourceUrl.value = r.sourceUrl ?? "";
        note.value = r.note ?? "";
        imageUrl.value = r.imageUrl ?? "";
        proteinG.value = r.nutrition?.proteinG ?? "";
        fatG.value = r.nutrition?.fatG ?? "";
        carbsG.value = r.nutrition?.carbsG ?? "";
        calories.value = r.nutrition?.calories ?? "";
        ingredients.splice(
          0,
          ingredients.length,
          ...r.ingredients.length ? r.ingredients.map((x) => ({
            ...x,
            toTaste: x.quantity == null && x.unit == null
          })) : [{ name: "", productCategory: "other", quantity: null, unit: "", toTaste: false }]
        );
      } catch (e) {
        error.value = bffErrorMessage(e);
      } finally {
        loading.value = false;
      }
    }
    function applyImportDraft() {
      if (route.query.fromImport !== "1") {
        return;
      }
      const raw = sessionStorage.getItem("meal_import_draft");
      if (!raw) {
        return;
      }
      try {
        const d = JSON.parse(raw);
        title.value = d.title ?? "";
        stepsText.value = (d.steps ?? []).join("\n");
        cookTimeMinutes.value = d.cookTimeMinutes ?? "";
        mealCategory.value = d.mealCategory ?? "";
        sourceUrl.value = d.sourceUrl ?? "";
        imageUrl.value = d.imageUrl ?? "";
        proteinG.value = d.nutrition?.proteinG ?? "";
        fatG.value = d.nutrition?.fatG ?? "";
        carbsG.value = d.nutrition?.carbsG ?? "";
        calories.value = d.nutrition?.calories ?? "";
        const ings = (d.ingredients ?? []).map((x) => ({
          name: x.name ?? "",
          productCategory: x.productCategory ?? "other",
          quantity: x.quantity ?? null,
          unit: x.unit ?? "",
          toTaste: (x.quantity == null || x.quantity === void 0) && !x.unit
        }));
        ingredients.splice(
          0,
          ingredients.length,
          ...ings.length ? ings : [{ name: "", productCategory: "other", quantity: null, unit: "", toTaste: false }]
        );
        sessionStorage.removeItem("meal_import_draft");
      } catch {
        sessionStorage.removeItem("meal_import_draft");
      }
    }
    onMounted(() => {
      isCreate.value = route.name === "recipe-new";
      applyRecipeFormShell();
      if (!isCreate.value) {
        void loadEdit();
      } else {
        loading.value = false;
        applyImportDraft();
      }
    });
    watch(
      () => route.name,
      (n) => {
        isCreate.value = n === "recipe-new";
        if (isCreate.value) {
          title.value = "";
          stepsText.value = "";
          cookTimeMinutes.value = "";
          mealCategory.value = "";
          sourceUrl.value = "";
          note.value = "";
          imageUrl.value = "";
          proteinG.value = "";
          fatG.value = "";
          carbsG.value = "";
          calories.value = "";
          ingredients.splice(0, ingredients.length, {
            name: "",
            productCategory: "other",
            quantity: null,
            unit: "",
            toTaste: false
          });
          loading.value = false;
          applyImportDraft();
        } else {
          void loadEdit();
        }
        applyRecipeFormShell();
      }
    );
    watch(
      () => route.params.id,
      () => {
        if (route.name === "recipe-edit") {
          void loadEdit();
        }
      }
    );
    function validateForm() {
      if (!title.value.trim()) {
        return "Укажите название рецепта.";
      }
      const named = ingredients.filter((i) => i.name.trim() !== "");
      if (named.length === 0) {
        return "Добавьте хотя бы один ингредиент с названием.";
      }
      for (const i of named) {
        if (!i.productCategory.trim()) {
          return `У ингредиента «${i.name.trim()}» укажите категорию продукта (для списка покупок).`;
        }
        if (!i.toTaste && i.quantity != null && i.quantity !== "" && Number(i.quantity) < 0) {
          return `Количество для «${i.name.trim()}» не может быть отрицательным.`;
        }
      }
      if (cookTimeMinutes.value !== "" && Number(cookTimeMinutes.value) < 1) {
        return "Время приготовления должно быть не меньше 1 минуты.";
      }
      return null;
    }
    async function save() {
      saving.value = true;
      error.value = "";
      const v = validateForm();
      if (v) {
        error.value = v;
        saving.value = false;
        return;
      }
      const body = payloadFromForm();
      try {
        if (isCreate.value) {
          const created = await bff.json("/recipes", {
            method: "POST",
            body: JSON.stringify(body)
          });
          await router.push(`/recipes/${created.id}`);
        } else {
          const id = route.params.id;
          await bff.json(`/recipes/${id}`, {
            method: "PATCH",
            body: JSON.stringify(body)
          });
          await router.push(`/recipes/${id}`);
        }
      } catch (e) {
        error.value = bffErrorMessage(e);
      } finally {
        saving.value = false;
      }
    }
    return (_ctx, _cache) => {
      return _openBlock(), _createElementBlock("section", _hoisted_1, [
        loading.value ? (_openBlock(), _createElementBlock("p", _hoisted_2, "Загрузка…")) : (_openBlock(), _createElementBlock("form", {
          key: 1,
          class: "form",
          onSubmit: _withModifiers(save, ["prevent"])
        }, [
          _createElementVNode("label", null, [
            _cache[11] || (_cache[11] = _createTextVNode(" Название * ", -1)),
            _withDirectives(_createElementVNode("input", {
              "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => title.value = $event),
              required: ""
            }, null, 512), [
              [_vModelText, title.value]
            ])
          ]),
          _createElementVNode("label", null, [
            _cache[12] || (_cache[12] = _createTextVNode(" Шаги (каждый с новой строки) ", -1)),
            _withDirectives(_createElementVNode("textarea", {
              "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => stepsText.value = $event),
              rows: "6"
            }, null, 512), [
              [_vModelText, stepsText.value]
            ])
          ]),
          _createElementVNode("label", null, [
            _cache[13] || (_cache[13] = _createTextVNode(" Время (мин) ", -1)),
            _withDirectives(_createElementVNode("input", {
              "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => cookTimeMinutes.value = $event),
              type: "number",
              min: "1"
            }, null, 512), [
              [
                _vModelText,
                cookTimeMinutes.value,
                void 0,
                { number: true }
              ]
            ])
          ]),
          _createElementVNode("label", null, [
            _cache[14] || (_cache[14] = _createTextVNode(" Категория приёма пищи ", -1)),
            _withDirectives(_createElementVNode("input", {
              "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => mealCategory.value = $event)
            }, null, 512), [
              [_vModelText, mealCategory.value]
            ])
          ]),
          _createElementVNode("label", null, [
            _cache[15] || (_cache[15] = _createTextVNode(" Источник (URL) ", -1)),
            _withDirectives(_createElementVNode("input", {
              "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => sourceUrl.value = $event),
              type: "url"
            }, null, 512), [
              [_vModelText, sourceUrl.value]
            ])
          ]),
          _createElementVNode("label", null, [
            _cache[16] || (_cache[16] = _createTextVNode(" URL изображения ", -1)),
            _withDirectives(_createElementVNode("input", {
              "onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => imageUrl.value = $event),
              type: "url",
              placeholder: "https://..."
            }, null, 512), [
              [_vModelText, imageUrl.value]
            ])
          ]),
          imageUrl.value.trim() ? (_openBlock(), _createElementBlock("figure", _hoisted_3, [
            _createElementVNode("img", {
              src: imageUrl.value.trim(),
              alt: "Превью рецепта"
            }, null, 8, _hoisted_4)
          ])) : _createCommentVNode("", true),
          _createElementVNode("label", null, [
            _cache[17] || (_cache[17] = _createTextVNode(" Заметка ", -1)),
            _withDirectives(_createElementVNode("textarea", {
              "onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => note.value = $event),
              rows: "3",
              placeholder: "Комментарий к рецепту"
            }, null, 512), [
              [_vModelText, note.value]
            ])
          ]),
          _createElementVNode("fieldset", null, [
            _cache[22] || (_cache[22] = _createElementVNode("legend", null, "Пищевая ценность (на порцию)", -1)),
            _createElementVNode("div", _hoisted_5, [
              _createElementVNode("label", null, [
                _cache[18] || (_cache[18] = _createTextVNode(" Белки (г) ", -1)),
                _withDirectives(_createElementVNode("input", {
                  "onUpdate:modelValue": _cache[7] || (_cache[7] = ($event) => proteinG.value = $event),
                  type: "number",
                  min: "0",
                  step: "any"
                }, null, 512), [
                  [
                    _vModelText,
                    proteinG.value,
                    void 0,
                    { number: true }
                  ]
                ])
              ]),
              _createElementVNode("label", null, [
                _cache[19] || (_cache[19] = _createTextVNode(" Жиры (г) ", -1)),
                _withDirectives(_createElementVNode("input", {
                  "onUpdate:modelValue": _cache[8] || (_cache[8] = ($event) => fatG.value = $event),
                  type: "number",
                  min: "0",
                  step: "any"
                }, null, 512), [
                  [
                    _vModelText,
                    fatG.value,
                    void 0,
                    { number: true }
                  ]
                ])
              ]),
              _createElementVNode("label", null, [
                _cache[20] || (_cache[20] = _createTextVNode(" Углеводы (г) ", -1)),
                _withDirectives(_createElementVNode("input", {
                  "onUpdate:modelValue": _cache[9] || (_cache[9] = ($event) => carbsG.value = $event),
                  type: "number",
                  min: "0",
                  step: "any"
                }, null, 512), [
                  [
                    _vModelText,
                    carbsG.value,
                    void 0,
                    { number: true }
                  ]
                ])
              ]),
              _createElementVNode("label", null, [
                _cache[21] || (_cache[21] = _createTextVNode(" Ккал ", -1)),
                _withDirectives(_createElementVNode("input", {
                  "onUpdate:modelValue": _cache[10] || (_cache[10] = ($event) => calories.value = $event),
                  type: "number",
                  min: "0",
                  step: "any"
                }, null, 512), [
                  [
                    _vModelText,
                    calories.value,
                    void 0,
                    { number: true }
                  ]
                ])
              ])
            ])
          ]),
          _createElementVNode("fieldset", null, [
            _cache[24] || (_cache[24] = _createElementVNode("legend", null, "Ингредиенты *", -1)),
            (_openBlock(true), _createElementBlock(_Fragment, null, _renderList(ingredients, (ing, i) => {
              return _openBlock(), _createElementBlock("div", {
                key: i,
                class: "ing-row"
              }, [
                _withDirectives(_createElementVNode("input", {
                  "onUpdate:modelValue": ($event) => ing.name = $event,
                  placeholder: "Название"
                }, null, 8, _hoisted_6), [
                  [_vModelText, ing.name]
                ]),
                _createElementVNode("label", _hoisted_7, [
                  _withDirectives(_createElementVNode("input", {
                    "onUpdate:modelValue": ($event) => ing.toTaste = $event,
                    type: "checkbox",
                    onChange: ($event) => onToTasteChange(ing)
                  }, null, 40, _hoisted_8), [
                    [_vModelCheckbox, ing.toTaste]
                  ]),
                  _cache[23] || (_cache[23] = _createTextVNode(" по вкусу ", -1))
                ]),
                _withDirectives(_createElementVNode("input", {
                  "onUpdate:modelValue": ($event) => ing.quantity = $event,
                  type: "number",
                  step: "any",
                  placeholder: "Кол-во",
                  disabled: ing.toTaste
                }, null, 8, _hoisted_9), [
                  [
                    _vModelText,
                    ing.quantity,
                    void 0,
                    { number: true }
                  ]
                ]),
                _withDirectives(_createElementVNode("input", {
                  "onUpdate:modelValue": ($event) => ing.unit = $event,
                  placeholder: "Ед.",
                  disabled: ing.toTaste
                }, null, 8, _hoisted_10), [
                  [_vModelText, ing.unit]
                ]),
                _withDirectives(_createElementVNode("input", {
                  "onUpdate:modelValue": ($event) => ing.productCategory = $event,
                  placeholder: "Категория продукта"
                }, null, 8, _hoisted_11), [
                  [_vModelText, ing.productCategory]
                ]),
                _createElementVNode("button", {
                  type: "button",
                  class: "btn small secondary remove-btn",
                  onClick: ($event) => removeIngredient(i)
                }, " Удалить ", 8, _hoisted_12)
              ]);
            }), 128)),
            _createElementVNode("button", {
              type: "button",
              class: "btn secondary small add-btn",
              onClick: addIngredient
            }, " Добавить строку ")
          ]),
          error.value ? (_openBlock(), _createElementBlock("p", _hoisted_13, _toDisplayString(error.value), 1)) : _createCommentVNode("", true),
          _createElementVNode("button", {
            type: "submit",
            class: "btn",
            disabled: saving.value
          }, _toDisplayString(saving.value ? "Сохранение…" : "Сохранить"), 9, _hoisted_14)
        ], 32))
      ]);
    };
  }
});

const RecipeForm = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-99552f0a"]]);

export { RecipeForm as default };
