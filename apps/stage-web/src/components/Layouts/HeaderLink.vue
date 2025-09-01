<script setup lang="ts">
import { useDark } from '@vueuse/core'
import { RouterLink } from 'vue-router'

import LogoDark from '../../assets/logo-dark.svg'
import Logo from '../../assets/logo.svg'

const dark = useDark()
</script>

<template>
  <div flex="~" items-center justify-between w-full>
    <RouterLink
      to="/" flex="~" items-center
      gap-2 px-2 text-nowrap text-2xl outline-none
    >
      <template v-if="dark">
        <img :src="LogoDark" h-8 w-8 class="theme-colored">
      </template>
      <template v-else>
        <img :src="Logo" h-8 w-8 class="theme-colored">
      </template>
      <div translate-y="[2px]" font-quicksand font-semibold>
        <span>AIRI</span>
      </div>
    </RouterLink>

    <!-- GitHub Button -->
    <a
      href="https://github.com/MaximBayer/airi-ua"
      target="_blank"
      rel="noopener noreferrer"
      class="github-button"
      flex items-center gap-2 px-3 py-2 rounded-lg
      bg="neutral-100/60 hover:neutral-200/60 dark:neutral-800/60 dark:hover:neutral-700/60"
      text="neutral-600 hover:neutral-800 dark:neutral-400 dark:hover:neutral-200"
      transition="all duration-200"
      title="GitHub Repository"
    >
      <div i-carbon:logo-github size-4 />
      <span class="hidden md:inline text-sm font-medium">GitHub</span>
    </a>
  </div>
</template>

<style scoped>
.theme-colored {
  filter: hue-rotate(calc(var(--chromatic-hue, 0) * 1deg));
}

.github-button {
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.github-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.dark .github-button:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}
</style>
