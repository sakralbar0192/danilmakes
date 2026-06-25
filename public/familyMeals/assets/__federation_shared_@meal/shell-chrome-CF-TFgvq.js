import { i as importShared } from '../_virtual___federation_fn_import-C2OYbetV.js';

const {reactive} = await importShared('vue');

const defaults = {
  layout: "default",
  titleLevel: 2,
  titleAlign: "start",
  ariaLabel: "",
  eyebrow: null,
  title: null,
  showAppNav: true,
  leadingRender: null,
  sublineRender: null,
  actionsRender: null
};
const shellHeaderState = reactive({ ...defaults });
function setShellHeader(patch) {
  if (patch.layout !== void 0) {
    shellHeaderState.layout = patch.layout;
  }
  if (patch.titleLevel !== void 0) {
    shellHeaderState.titleLevel = patch.titleLevel;
  }
  if (patch.titleAlign !== void 0) {
    shellHeaderState.titleAlign = patch.titleAlign;
  }
  if (patch.ariaLabel !== void 0) {
    shellHeaderState.ariaLabel = patch.ariaLabel;
  }
  if ("eyebrow" in patch) {
    shellHeaderState.eyebrow = patch.eyebrow ?? null;
  }
  if ("title" in patch) {
    shellHeaderState.title = patch.title ?? null;
  }
  if (patch.showAppNav !== void 0) {
    shellHeaderState.showAppNav = patch.showAppNav;
  }
  if ("leadingRender" in patch) {
    shellHeaderState.leadingRender = patch.leadingRender ?? null;
  }
  if ("sublineRender" in patch) {
    shellHeaderState.sublineRender = patch.sublineRender ?? null;
  }
  if ("actionsRender" in patch) {
    shellHeaderState.actionsRender = patch.actionsRender ?? null;
  }
}
function resetShellHeader() {
  Object.assign(shellHeaderState, defaults);
}

export { resetShellHeader, setShellHeader, shellHeaderState };
