<template>
  <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="snackbar.timeout">
    <span v-html="snackbar.text" />
  </v-snackbar>

  <v-dialog v-model="message.show" max-width="520">
    <v-card>
      <v-card-title>{{ message.title }}</v-card-title>
      <v-card-text><span v-html="message.content" /></v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn
          v-for="(btn, i) in message.buttons"
          :key="i"
          :color="btn.color || 'primary'"
          :variant="btn.outlined ? 'outlined' : 'flat'"
          @click="onButton(btn)"
        >
          {{ btn.text }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-overlay :model-value="loader" class="align-center justify-center" persistent>
    <v-progress-circular indeterminate size="64" color="primary" />
  </v-overlay>
</template>

<script setup>
import { computed } from "vue";
import { dialogState } from "@/plugins/dialog";

const snackbar = dialogState.snackbar;
const message = dialogState.message;
const loader = computed(() => dialogState.loader);

function onButton(btn) {
  btn.callback?.();
  if (btn.closeOnHandler !== false) {
    message.show = false;
  }
}
</script>
