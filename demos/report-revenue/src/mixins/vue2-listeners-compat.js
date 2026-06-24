/** Vue 2 `$listeners` shim for Vue 3 (events live on `$attrs` as `onEvent`). */
export default {
  computed: {
    $listeners() {
      const listeners = {};
      const attrs = this.$attrs || {};
      Object.entries(attrs).forEach(([key, handler]) => {
        if (!key.startsWith("on") || typeof handler !== "function") {
          return;
        }
        const event = key.charAt(2).toLowerCase() + key.slice(3);
        listeners[event] = handler;
      });
      return listeners;
    },
  },
};
