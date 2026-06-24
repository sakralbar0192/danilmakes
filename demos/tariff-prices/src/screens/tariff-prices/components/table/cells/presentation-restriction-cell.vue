<template>
  <v-card
    :height="$options.presentationCellHeight"
    :width="$options.presentationCellWidth"
    :class="['d-flex flex-column align-center justify-center', cellClass, {
      bordered: true,
    }]"
  >
    <span
      :class="['d-flex align-center', {
        [$style['restriction-cell-copied']]: presentationMode === $options.restrictionCellCopiedPresentationMode
      }]"
    >
      <template v-if="presentationMode === $options.restrictionCellNonePresentationMode">&nbsp;</template>
      <template
        v-else-if="presentationMode === $options.restrictionCellManualPresentationMode
          || presentationMode === $options.restrictionCellCopiedPresentationMode
          || presentationMode === $options.restrictionCellClosedPresentationMode
          || presentationMode === $options.restrictionCellManualToggledPresentationMode
          || presentationMode === $options.restrictionCellManualEditedPresentationMode"
      >
        <span
          v-if="presentationMode !== $options.restrictionCellManualToggledPresentationMode"
          :class="$style['restriction-cell-presentation-value']"
          :style="{
            color: presentationMode === $options.restrictionCellCopiedPresentationMode ? copiedTextColor : null,
          }"
        >
          1
        </span>
        <template
          v-if="(
            presentationMode !== $options.restrictionCellCopiedPresentationMode || !hasCurrentTariffDefaultMinstayRestriction
          ) && presentationMode !== $options.restrictionCellManualEditedPresentationMode"
        >
          <span
            v-if="presentationMode !== $options.restrictionCellManualToggledPresentationMode"
            :style="{color: copiedTextColor, fontSize: '10px', textAlign: 'center'}"
          >
            &nbsp;&nbsp;{{ $t('или') }}&nbsp;&nbsp;
          </span>
          <v-icon
            small
            color="error"
            class="icon-minus-circle"
          />
        </template>
      </template>
    </span>

    <span
      v-if="!withoutCaption"
      :class="$style['caption--presentation']"
    >
      {{ mockedRestriction.caption }}
    </span>
  </v-card>
</template>

<script>
import { mapGetters } from "vuex";
import { resolvePresentationRestrictionCaption } from "../logic/surface/presentation-restriction-caption.js";
import { restrictionCellPresentationModes } from "../../../config/screen-config.js";
import { presentationCellHeight, presentationCellWidth } from "../config/table-grid-metrics.js";

export default {
  name: "BnovoTariffPricesAndRestrictionsTablePresentationRestrictionCell",
  props: {
    withoutCaption: {
      type: Boolean,
      default: false,
    },
    presentationMode: {
      type: String,
      default: "",
    },
    legendSwatch: {
      type: Boolean,
      default: false,
    },
  },
  presentationCellHeight,
  presentationCellWidth,
  restrictionCellNonePresentationMode: restrictionCellPresentationModes.none,
  restrictionCellManualPresentationMode: restrictionCellPresentationModes.manual,
  restrictionCellManualToggledPresentationMode: restrictionCellPresentationModes.manualToggled,
  restrictionCellManualEditedPresentationMode: restrictionCellPresentationModes.manualEdited,
  restrictionCellCopiedPresentationMode: restrictionCellPresentationModes.copied,
  restrictionCellClosedPresentationMode: restrictionCellPresentationModes.closed,
  computed: {
    ...mapGetters("tariffPricesAndRestrictions", [
      "hasCurrentTariffDefaultMinstayRestriction",
      "hasCurrentTariffSomeDependedRestrictions",
    ]),
    cellClass() {
      return [
        this.$style["restriction-cell"],
        {
          [this.$style["restriction-cell-closed"]]: this.presentationMode === this.$options.restrictionCellClosedPresentationMode,
          [this.$style["restriction-cell-presentation"]]: true,
          [this.$style["restriction-cell-copied"]]: this.presentationMode === this.$options.restrictionCellCopiedPresentationMode,
          [this.$style["restriction-cell-legend"]]: this.legendSwatch
            && this.presentationMode !== this.$options.restrictionCellClosedPresentationMode,
        },
      ];
    },
    mockedRestriction() {
      const { captionKey } = resolvePresentationRestrictionCaption({
        presentationMode: this.presentationMode,
        modes: {
          restrictionCellNonePresentationMode: this.$options.restrictionCellNonePresentationMode,
          restrictionCellManualPresentationMode: this.$options.restrictionCellManualPresentationMode,
          restrictionCellCopiedPresentationMode: this.$options.restrictionCellCopiedPresentationMode,
          restrictionCellClosedPresentationMode: this.$options.restrictionCellClosedPresentationMode,
        },
        hasCurrentTariffSomeDependedRestrictions: this.hasCurrentTariffSomeDependedRestrictions,
      });
      return Object.seal({
        value: "",
        caption: this.$t(captionKey),
      });
    },
    copiedTextColor() {
      return this.$vuetify?.theme?.themes?.light?.secondary?.darken3;
    },
  },
};
</script>

<style lang="scss" module>
@import '../../../styles/variables.scss';

.caption--presentation {
  color: $caption !important;
  font-size: 10px;
  font-weight: normal;
  font-style: normal;
  text-align: center;
}

.restriction-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  cursor: url("/public/spa/img/custom-cursor.png") 3 8, auto;
  font-size: 12px !important;

  &-closed {
    background-color: $closed-bg-color !important;
    border-left: 1px solid $closed-bg-color;

    &:hover {
      border-left: 1px solid $closed-hover-bg-color;
      background-color: $closed-hover-bg-color !important;
    }

    .restriction-cell-presentation-value {
      text-decoration: line-through;
    }
  }

  &-copied {
    cursor: url("/public/spa/img/not-allowed-pointer.png"), pointer !important;

    :global(.v-icon) {
      color: #FFCDC3 !important
    }
  }

  &-legend {
    background-color: $sub-cell-bg-color !important;
  }
}
</style>
