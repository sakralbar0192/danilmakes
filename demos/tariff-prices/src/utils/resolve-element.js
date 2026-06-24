/**
 * Vue 3: ref на компонент Vuetify — это instance, не HTMLElement.
 * ResizeObserver и layout-метрики требуют DOM-узел.
 */
export function resolveElement(ref) {
  if (!ref) {
    return null;
  }
  if (typeof Element !== "undefined" && ref instanceof Element) {
    return ref;
  }
  const el = ref.$el;
  if (typeof Element !== "undefined" && el instanceof Element) {
    return el;
  }
  return null;
}

export default resolveElement;
