<template>
  <div
    :class="['bnovo-report-revenue__card-wrapper',
             {'pa-4 bnovo-report-revenue__card-wrapper--alternate': alternateMode,
              'bnovo-report-revenue__card-wrapper--total': !isSagComponent }]"
  >
    <v-card outlined class="bnovo-report-revenue__card rounded-lg pa-6" elevation="1">
      <v-card-title class="pa-0 d-flex align-baseline">
        <h4 class="bnovo-report-revenue__header">
          <slot name="title"/>
        </h4>
        <slot name="hint"/>
      </v-card-title>
      <v-card-text class="pa-0">
        <v-tooltip
          location="bottom"
          min-width="270"
          :disabled="!$slots['tooltip-content']"
        >
          <template #activator="{ props: activatorProps }">
            <v-sheet
              v-bind="activatorProps"
              :color="getBackgroundSheetColor"
              class="bnovo-report-revenue__card-sheet d-flex flex-column rounded-lg pt-2 pr-4 pb-4 pl-5"
              :style="{ border: getBorderStyle }"
            >
              <slot name="text"/>
              <footer class="d-none">
                <slot name="footer"/>
              </footer>
            </v-sheet>
          </template>
          <slot name="tooltip-content"/>
        </v-tooltip>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
export default {
  name: "BnovoReportRevenueMetricBlock",
  props: {
    alternateMode: {
      type: Boolean,
      default: false,
    },
    context: {
      type: String,
      default: "default",
    },
  },
  computed: {
    isSagComponent() {
      return this.context === "separated";
    },
    getBackgroundSheetColor() {
      return this.alternateMode ? "#F5F9FE" : "#EFFBF1";
    },
    getBorderStyle() {
      return this.alternateMode ? "1px solid #E2EEFD" : "1px solid #2FAC4429";
    },
  },
};
</script>

<style lang="scss">
  .bnovo-report-revenue__header {
    font-weight: 600;
    font-size: 16px;
  }

  .bnovo-report-revenue__bold {
    font-size: 14px;
  }

  .bnovo-report-revenue__card-wrapper {
    max-width: 320px;

    &--alternate {
      min-width: 293px;
      max-width: max-content;
      padding: map-get($gaps, groups);
      background-color: $secondary-hover;
      border-radius: map-get($gaps, groups);
    }
  }

  .bnovo-report-revenue__card.rounded-lg.v-card {
    border: 1px solid $border-color;
  }

  .bnovo-report-revenue__card-sheet {
    border: 1px solid rgba(47, 172, 68, 0.16);
    gap: 12px;
    small {
      color: var(--v-secondary-darken3);
    }
  }

  .bnovo-report-revenue__card-sheet-sign {
    color: var(--v-secondary-darken3);
  }

  .hero-34 {
    font-size: 34px;
  }

  @media #{map-get($display-breakpoints, 'lg-and-up')} {
    .bnovo-report-revenue__card-wrapper--total {
      height: 100%;
      & > .bnovo-report-revenue__card {
        height: 100%;
        & > .v-card__text {
          height: calc(100% - 32px);
          & > .bnovo-report-revenue__card-sheet {
            height: 100%;
          }
        }
      }
    }
  }

  @media (max-width: map-get($grid-breakpoints-custom, lg)) {
    .bnovo-report-revenue__card-wrapper {
      max-width: 100%;
      width: 100%;
      height: auto;
    }
    .bnovo-report-revenue__card-wrapper--total {
      height: 100%;
      & .bnovo-report-revenue__card-sheet {
        min-height: 140px;
      }
    }
  }


  @media (max-width: map-get($grid-breakpoints-custom, sm)) {
    .bnovo-report-revenue__card-wrapper {
      max-width: 480px;
    }
    .bnovo-report-revenue__card-wrapper--total {
      height: 100%;
      & .bnovo-report-revenue__card-sheet {
        min-height: auto;
      }
    }
  }
</style>
