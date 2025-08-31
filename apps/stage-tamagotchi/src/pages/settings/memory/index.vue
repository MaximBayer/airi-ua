<script setup lang="ts">
import { Callout } from '@proj-airi/stage-ui/components'
import { useI18n } from 'vue-i18n'
// import { useServerStore } from '@proj-airi/stage-ui/stores/server'
// import { storeToRefs } from 'pinia'
// import { onMounted } from 'vue'

const { t } = useI18n()

// const { server } = storeToRefs(useServerStore())

// onMounted(() => {
//   server.value?.connect()
// })
</script>

<template>
  <div>
    <Callout
      :label="t('settings.development.callout.label')"
      theme="orange"
    >
      <div>
        {{ t('settings.development.callout.description') }}
        <a underline decoration-dotted href="https://github.com/moeru-ai/airi/issues">{{ t('settings.development.callout.githubLink') }}</a>.
        {{ t('settings.development.callout.sourceCodeText') }}
        <a underline decoration-dotted href="https://github.com/moeru-ai/airi/tree/main/apps/stage-tamagotchi/src/pages/settings/memory/index.vue">{{ t('settings.development.callout.hereLink') }}</a>.
      </div>
    </Callout>
  </div>
  <div
    v-motion
    text="neutral-200/50 dark:neutral-600/20" pointer-events-none
    fixed top="[calc(100dvh-15rem)]" bottom-0 right--5 z--1
    :initial="{ scale: 0.9, opacity: 0, y: 15 }"
    :enter="{ scale: 1, opacity: 1, y: 0 }"
    :duration="500"
    size-60
    flex items-center justify-center
  >
    <div text="60" i-solar:leaf-bold-duotone />
  </div>
</template>

<route lang="yaml">
meta:
  layout: settings
  stageTransition:
    name: slide
</route>
