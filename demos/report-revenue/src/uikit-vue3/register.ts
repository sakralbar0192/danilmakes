import type { App } from "vue";
import BBtn from "./b-btn.vue";
import BCol from "./b-col.vue";
import BDrawer from "./b-drawer.vue";
import BMenu from "./b-menu.vue";
import BSelect from "./b-select.vue";
import BSwitch from "./b-switch.vue";
import BBtnGroup from "./b-btn-group.vue";
import BTooltipArrowed from "./b-tooltip-arrowed.vue";
import BInputGroup from "./b-input-group.vue";
import BDropdownDatepicker from "./b-dropdown-datepicker.vue";
import BOptionsGroup from "./b-options-group.vue";
import BStatus from "./b-status.vue";
import BScreenHeader from "./b-screen-header.vue";
import BScreenFooter from "./b-screen-footer.vue";
import BScreenOverlay from "./b-screen-overlay.vue";
import BLayoutTabs from "./b-layout-tabs.vue";
import BAlert from "./b-alert.vue";
import BInputLabel from "./b-input-label.vue";
import BTeleportWrapper from "./b-teleport-wrapper.vue";
import BRelatedDropdownDateRange from "./b-related-dropdown-date-range.vue";
import BMenuTooltip from "./b-menu-tooltip.vue";
import BTextField from "./b-text-field.vue";
import BCheckbox from "./b-checkbox.vue";
import BDialog from "./b-dialog.vue";
import BChart from "./b-chart.vue";
import BMixedChart from "./b-mixed-chart.vue";
import BDataTable from "./b-data-table.vue";
import BWidgetWrapper from "./b-widget-wrapper.vue";
import BBtnDownload from "./b-btn-download.vue";
import BBtnGroupSeparate from "./b-btn-group-separate.vue";

const map: Record<string, object> = {
  BBtn,
  BCol,
  BDrawer,
  BDialog,
  BMenu,
  BSelect,
  BSwitch,
  BBtnGroup,
  BTooltipArrowed,
  BInputGroup,
  BDropdownDatepicker,
  BOptionsGroup,
  BStatus,
  BScreenHeader,
  BScreenFooter,
  BScreenOverlay,
  BLayoutTabs,
  BAlert,
  BInputLabel,
  BTeleportWrapper,
  BRelatedDropdownDateRange,
  BMenuTooltip,
  BTextField,
  BCheckbox,
  BChart,
  BMixedChart,
  BDataTable,
  BWidgetWrapper,
  BBtnDownload,
  BBtnGroupSeparate,
};

export function registerUIKit(app: App) {
  Object.entries(map).forEach(([name, component]) => {
    app.component(name, component);
  });
}
