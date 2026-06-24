export const LIGHT_THEME = Object.freeze({
  primary: "#316AEF",
  info: "#3C435A",
  secondary: {
    base: "#EEEEF1",
    darken3: "#838A9A",
  },
  accent: "#3BC953",
  error: "#C23C28",
  success: "#53AA70",
  warning: "#E0600B",
  sand: "#F39509",
  sky: "#E4EDFD",
  text: "#3C435A",
});

export default {
  preset: {
    theme: {
      themes: { light: LIGHT_THEME },
    },
  },
};
