<template>
  <div
    :class="['report-revenue__card-wrapper',
             {'pa-4 report-revenue__card-wrapper--alternate': alternateMode,
              'report-revenue__card-wrapper--total': !isSagComponent }]"
  >
    <v-card outlined class="report-revenue__card rounded-lg pa-6" elevation="1">
      <v-card-title class="pa-0 d-flex align-baseline">
        <h4 class="report-revenue__header">
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
              class="report-revenue__card-sheet d-flex flex-column rounded-lg pt-2 pr-4 pb-4 pl-5"
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
  name: "ReportRevenueMetricBlock",
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
      return this.alternateMode ? "#f0f7fc" : "#eef6fa";
    },
    getBorderStyle() {
      return this.alternateMode ? "1px solid #c5e0ef" : "1px solid #b8dce8";
    },
  },
};
</script>

<style lang="scss">
  .report-revenue__header {
    font-weight: 600;
    font-size: 16px;
    color: #2d3748;
  }

  .report-revenue__bold {
    font-size: 14px;
  }

  .report-revenue__card-wrapper {
    max-width: 320px;

    &--alternate {
      min-width: 293px;
      max-width: max-content;
      padding: map-get($gaps, groups);
      background-color: $secondary-hover;
      border-radius: map-get($gaps, groups);
    }
  }

  .report-revenue__card.rounded-lg.v-card {
    border: 1px solid var(--demo-border, #d8e8f2);
    box-shadow: 0 2px 12px rgba(30, 139, 195, 0.06);
  }

  .report-revenue__card-sheet {
    border: 1px solid rgba(30, 139, 195, 0.18);
    gap: 12px;
    small {
      color: var(--demo-text-muted, #6b7c8a);
    }
  }

  .report-revenue__card-sheet-sign {
    color: var(--v-secondary-darken3);
  }

  .hero-34 {
    font-size: 34px;
  }

  @media #{map-get($display-breakpoints, 'lg-and-up')} {
    .report-revenue__card-wrapper--total {
      height: 100%;
      & > .report-revenue__card {
        height: 100%;
        & > .v-card__text {
          height: calc(100% - 32px);
          & > .report-revenue__card-sheet {
            height: 100%;
          }
        }
      }
    }
  }

  @media (max-width: map-get($grid-breakpoints-custom, lg)) {
    .report-revenue__card-wrapper {
      max-width: 100%;
      width: 100%;
      height: auto;
    }
    .report-revenue__card-wrapper--total {
      height: 100%;
      & .report-revenue__card-sheet {
        min-height: 140px;
      }
    }
  }


  @media (max-width: map-get($grid-breakpoints-custom, sm)) {
    .report-revenue__card-wrapper {
      max-width: 480px;
    }
    .report-revenue__card-wrapper--total {
      height: 100%;
      & .report-revenue__card-sheet {
        min-height: auto;
      }
    }
  }
</style>
