<script lang="ts" setup>
// Vue.js
import { computed, ref } from 'vue';

// Quasar
import { scroll } from 'quasar';

// tab labels
const tabLabels = Object.fromEntries(['Home', 'Settings'].map((label) => [
  label.toLowerCase(),
  label,
]));

// tab
const tab = ref('home');

// messages
const messages = ref<{ isLoading: boolean, text: string, type: 'sent' | 'received' }[]>([]);

// messages with attrs
const messagesWithAttrs = computed(() => messages.value.map(({ isLoading, text, type }) => {
  if (type === 'sent') {
    return {
      bgColor: 'green-4',
      icon: 'mdi-account-circle',
      isLoading,
      name: 'Me',
      sent: true,
      text,
      type,
    };
  } else {
    return {
      bgColor: 'grey-4',
      icon: 'mdi-robot',
      isLoading,
      name: "Quail's GPT",
      sent: false,
      text,
      type,
    };
  }
}));

// loading message
const loadingMessage = computed(() => messages.value.find(({ isLoading }) => isLoading));

// message
const message = ref('');

// send message
const sendMessage = async (text: string) => {
  // my message
  messages.value.push({
    type: 'sent',
    text,
    isLoading: false,
  });

  // loading message
  messages.value.push({
    type: 'received',
    text: '',
    isLoading: true,
  });

  // reset message
  message.value = '';

  // send message
  const { body } = await fetch(import.meta.env.VITE_CHAT_FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: text,
    }),
  });

  if (body === null) {
    return;
  }

  // reader
  const reader = body.pipeThrough(new TextDecoderStream()).getReader();

  // receive message
  while (loadingMessage.value?.isLoading) {
    const result = await reader.read();

    if (!result.done) {
      loadingMessage.value.text += result.value;
    } else {
      loadingMessage.value.isLoading = false;
    }
  }
};

// resize
const resize = (size: { width: number, height: number }) => {
  scroll.setVerticalScrollPosition(window, size.height);
};
</script>

<template>
  <q-layout view="hHh LpR fFf">
    <q-header class="bg-grey-9 text-grey-3" elevated>
      <q-toolbar class="q-mx-auto">
        <q-toolbar-title shrink>
          Quail's GPT
        </q-toolbar-title>
        <q-tabs v-model="tab" stretch>
          <q-tab v-for="(label, name) in tabLabels" :label="label" :name="name" no-caps />
        </q-tabs>
        <q-space />
        <q-btn dense flat href="https://github.com/malvaceae/gpt.mallows.io" round>
          <q-icon name="mdi-github" />
        </q-btn>
      </q-toolbar>
    </q-header>
    <q-page-container>
      <q-page>
        <q-tab-panels v-model="tab">
          <q-tab-panel name="home">
            <q-card class="q-mx-auto" flat>
              <div class="text-h5">
                {{ tabLabels[tab] }}
              </div>
              <template v-for="{ bgColor, icon, isLoading, name, sent, text, type } in messagesWithAttrs">
                <q-chat-message :bg-color="bgColor" :name="name" :sent="sent" :text="[text]">
                  <template #avatar>
                    <q-avatar :class="`q-message-avatar q-message-avatar--${type}`">
                      <q-icon :name="icon" size="48px" />
                    </q-avatar>
                  </template>
                  <template #default v-if="isLoading && text.length === 0">
                    <div class="flex justify-center">
                      <q-spinner-dots size="32px" />
                    </div>
                  </template>
                  <template #default v-else-if="type === 'received'">
                    <q-markdown no-html :src="text" />
                  </template>
                </q-chat-message>
              </template>
              <q-resize-observer debounce="0" @resize="resize" />
            </q-card>
            <q-input v-model="message" class="fixed-bottom q-mx-auto q-pa-md" dense placeholder="Send a message..."
              @keydown="$event.keyCode === 13 && !(!/\S/.test(message) || !!loadingMessage) && sendMessage(message)">
              <template #append>
                <q-btn :disable="!/\S/.test(message) || !!loadingMessage" flat round @click="sendMessage(message)">
                  <q-icon name="mdi-send" />
                </q-btn>
              </template>
            </q-input>
          </q-tab-panel>
          <q-tab-panel name="settings">
            <q-card class="q-mx-auto" flat>
              <div class="text-h5">
                {{ tabLabels[tab] }}
              </div>
            </q-card>
          </q-tab-panel>
        </q-tab-panels>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<style lang="scss" scoped>
.q-toolbar {
  max-width: $breakpoint-md-min;
}

.q-card {
  max-width: $breakpoint-sm-min;
}

.q-field {
  max-width: $breakpoint-sm-min;
}

.q-message:last-child {
  margin-bottom: 48px;
}

.q-markdown {
  line-height: 1.5;
  word-break: normal;
}
</style>
