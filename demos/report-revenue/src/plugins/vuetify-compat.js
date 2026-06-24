import { LIGHT_THEME } from "./vuetify-shim";

function applyVuetifyThemeCompat(instance) {
  const theme = instance?.$vuetify?.theme;
  if (!theme) return;

  theme.themes = {
    ...theme.themes,
    light: {
      ...LIGHT_THEME,
      ...(theme.themes?.light || {}),
      secondary: {
        ...LIGHT_THEME.secondary,
        ...(theme.themes?.light?.secondary || {}),
      },
    },
  };

  theme.currentTheme = {
    ...LIGHT_THEME,
    ...(theme.currentTheme || {}),
    secondary: {
      ...LIGHT_THEME.secondary,
      ...(theme.currentTheme?.secondary || {}),
    },
  };
}

export function installVuetifyCompat(app) {
  app.mixin({
    beforeMount() {
      applyVuetifyThemeCompat(this);
    },
  });
}
