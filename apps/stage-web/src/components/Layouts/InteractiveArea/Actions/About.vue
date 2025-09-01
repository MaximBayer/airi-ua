<script setup lang="ts">
import { UTCDate } from '@date-fns/utc'
import { AboutDialog } from '@proj-airi/stage-ui/components'
import { abbreviatedSha, branch, committerDate } from '~build/git'
import { formatISO9075 } from 'date-fns'
import { ref } from 'vue'

const show = ref(false)
const localDate = formatISO9075(new UTCDate(committerDate))
</script>

<template>
  <button border="2 solid neutral-100/60 dark:neutral-800/30" bg="neutral-50/70 dark:neutral-800/70" w-fit flex items-center self-end justify-center rounded-xl p-2 backdrop-blur-md title="About" @click="show = !show">
    <div i-solar:info-circle-outline size-5 text="neutral-500 dark:neutral-400" />
  </button>
  <AboutDialog v-model="show">
    <div max-w="calc[100%-2rem]" mx-auto h-full flex flex-col pt-14>
      <div mb-14 text-center text-5xl font-sans-rounded>
        <span text="neutral-400 dark:neutral-100/65">Project</span> <span text="pink-400 dark:pink-300/90">AIRI</span>
        <div mt-2 text-base>
          Web ver.
        </div>
      </div>
      <div flex-1>
        <div text="neutral-500 dark:neutral-400">
          Application build information
        </div>
        <div grid="~ cols-[70px_1fr]" mt-4 gap-2 text-sm>
          <div text="neutral-500 dark:neutral-400">
            Branch
          </div>
          <div font-mono>
            {{ branch }}
          </div>
          <div text="neutral-500 dark:neutral-400">
            Commit
          </div>
          <div font-mono>
            {{ abbreviatedSha.substring(0, 7) }}
          </div>
          <div text="neutral-500 dark:neutral-400">
            Built on
          </div>
          <div font-mono>
            {{ localDate }}
          </div>
        </div>
      </div>
      <div my-10>
        <div text="neutral-500 dark:neutral-400">
          About
        </div>
        <div mt-4 flex flex-col gap-2>
          <a
            :class="[
              'block', 'flex items-center gap-2',
              'rounded-xl px-3 py-2 lg:px-5 lg:py-3 outline-none backdrop-blur-md active:scale-95 focus:outline-none text-nowrap text-sm md:text-base',
              'text-slate-700 dark:text-slate-100',
            ]"
            bg="black/4 dark:black/10 dark:hover:white/30"
            transition="colors,transform duration-200 ease-in-out"
            href="https://airi.moeru.ai/docs/"
            target="_blank"
          >
            <div i-solar:home-smile-outline /><div>Home</div>
          </a>
          <a
            href="https://airi.moeru.ai/docs/en/docs/overview/"
            :class="[
              'block', 'flex items-center gap-2',
              'rounded-xl px-3 py-2 lg:px-5 lg:py-3 outline-none backdrop-blur-md active:scale-95 focus:outline-none text-nowrap text-sm md:text-base',
              'text-slate-700 dark:text-slate-100',
            ]"
            bg="black/4 dark:black/10 dark:hover:white/30"
            transition="colors,transform duration-200 ease-in-out"
            target="_blank"
          >
            <div i-solar:document-add-outline /><div>Documentations</div>
          </a>
          <a
            href="https://github.com/MaximBayer/airi-ua"
            :class="[
              'block', 'flex items-center gap-2',
              'rounded-xl px-3 py-2 lg:px-5 lg:py-3 outline-none backdrop-blur-md active:scale-95 focus:outline-none text-nowrap text-sm md:text-base',
              'text-slate-700 dark:text-slate-100',
            ]"
            bg="black/4 dark:black/10 dark:hover:white/30"
            transition="colors,transform duration-200 ease-in-out"
            target="_blank"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg><div>GitHub (Ukrainian)</div>
          </a>
          <a
            href="https://github.com/moeru-ai/airi"
            :class="[
              'block', 'flex items-center gap-2',
              'rounded-xl px-3 py-2 lg:px-5 lg:py-3 outline-none backdrop-blur-md active:scale-95 focus:outline-none text-nowrap text-sm md:text-base',
              'text-slate-700 dark:text-slate-100',
            ]"
            bg="black/4 dark:black/10 dark:hover:white/30"
            transition="colors,transform duration-200 ease-in-out"
            target="_blank"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.30.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg><div>GitHub (Original)</div>
          </a>
        </div>
      </div>
    </div>
  </AboutDialog>
</template>
