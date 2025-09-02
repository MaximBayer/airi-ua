<script setup lang="ts">
import type ImageUpload from '@proj-airi/stage-ui/components/Chat/ImageUpload.vue'
import type { ChatProvider } from '@xsai-ext/shared-providers'

import { useMicVAD } from '@proj-airi/stage-ui/composables'
import { useChatStore } from '@proj-airi/stage-ui/stores/chat'
import { useConsciousnessStore } from '@proj-airi/stage-ui/stores/modules/consciousness'
import { useProvidersStore } from '@proj-airi/stage-ui/stores/providers'
import { useSettings, useSettingsAudioDevice } from '@proj-airi/stage-ui/stores/settings'
import { BasicTextarea } from '@proj-airi/ui'
import { useDark, useResizeObserver, useScreenSafeArea } from '@vueuse/core'
import { storeToRefs } from 'pinia'
import { onMounted, ref, useTemplateRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'

import MobileChatHistory from '../Widgets/MobileChatHistory.vue'
import ActionAbout from './InteractiveArea/Actions/About.vue'
import ActionViewControls from './InteractiveArea/Actions/ViewControls.vue'
import ViewControlInputs from './ViewControls/Inputs.vue'

const isDark = useDark({ disableTransition: false })

const viewControlsActiveMode = ref<'x' | 'y' | 'z' | 'scale'>('scale')
const viewControlsInputsRef = useTemplateRef<InstanceType<typeof ViewControlInputs>>('viewControlsInputs')

const messageInput = ref('')
const listening = ref(false)
const isComposing = ref(false)
const uploadedImages = ref<File[]>([])
const imageUploadRef = ref<InstanceType<typeof ImageUpload>>()

const screenSafeArea = useScreenSafeArea()
const providersStore = useProvidersStore()
const { activeProvider, activeModel } = storeToRefs(useConsciousnessStore())

useResizeObserver(document.documentElement, () => screenSafeArea.update())

// const { askPermission } = useSettingsAudioDevice()
const { themeColorsHueDynamic, stageViewControlsEnabled } = storeToRefs(useSettings())
const { enabled, selectedAudioInput } = storeToRefs(useSettingsAudioDevice())
const { send, onAfterMessageComposed, discoverToolsCompatibility, clearChatHistory } = useChatStore()
const { messages } = storeToRefs(useChatStore())
const { t } = useI18n()

async function handleSend() {
  if ((!messageInput.value.trim() && uploadedImages.value.length === 0) || isComposing.value) {
    return
  }

  try {
    const providerConfig = providersStore.getProviderConfig(activeProvider.value)

    // Prepare content - either text only or multimodal (OpenAI format)
    let content: string | Array<{ type: 'text', text: string } | { type: 'image_url', image_url: { url: string } }>

    if (uploadedImages.value.length > 0) {
      // Convert images to base64
      const imagePromises = uploadedImages.value.map((file) => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader()
          reader.onload = e => resolve(e.target?.result as string)
          reader.readAsDataURL(file)
        })
      })

      const imageDataUrls = await Promise.all(imagePromises)

      // Create multimodal content following OpenAI format
      const multimodalContent: Array<{ type: 'text', text: string } | { type: 'image_url', image_url: { url: string } }> = []
      if (messageInput.value.trim()) {
        multimodalContent.push({ type: 'text', text: messageInput.value.trim() })
      }
      imageDataUrls.forEach((imageUrl) => {
        multimodalContent.push({
          type: 'image_url',
          image_url: { url: imageUrl },
        })
      })
      content = multimodalContent
    }
    else {
      content = messageInput.value.trim()
    }

    await send(content as any, {
      chatProvider: await providersStore.getProviderInstance(activeProvider.value) as ChatProvider,
      model: activeModel.value,
      providerConfig,
    })

    // Clear input and images after sending
    messageInput.value = ''
    uploadedImages.value = []
    imageUploadRef.value?.clearAll()
  }
  catch (error) {
    messages.value.pop()
    messages.value.push({
      role: 'error',
      content: (error as Error).message,
    })
  }
}

const { destroy, start } = useMicVAD(selectedAudioInput, {
  onSpeechStart: () => {
    // TODO: interrupt the playback
    // TODO: interrupt any of the ongoing TTS
    // TODO: interrupt any of the ongoing LLM requests
    // TODO: interrupt any of the ongoing animation of Live2D or VRM
    // TODO: once interrupted, we should somehow switch to listen or thinking
    //       emotion / expression?
    listening.value = true
  },
  // VAD misfire means while speech end is detected but
  // the frames of the segment of the audio buffer
  // is not enough to be considered as a speech segment
  // which controlled by the `minSpeechFrames` parameter
  onVADMisfire: () => {
    // TODO: do audio buffer send to whisper
    listening.value = false
  },
  onSpeechEnd: (buffer) => {
    // TODO: do audio buffer send to whisper
    listening.value = false
    handleTranscription(buffer)
  },
  auto: false,
})

function handleTranscription(_buffer: Float32Array<ArrayBufferLike>) {
  // eslint-disable-next-line no-alert
  alert('Transcription is not implemented yet')
}

function handleImageUpload(images: File[]) {
  uploadedImages.value = images
}

function handleImageClear() {
  uploadedImages.value = []
}

watch(enabled, async (value) => {
  if (value === false) {
    destroy()
  }
})

onAfterMessageComposed(async () => {
  messageInput.value = ''
})

watch([activeProvider, activeModel], async () => {
  if (activeProvider.value && activeModel.value) {
    await discoverToolsCompatibility(activeModel.value, await providersStore.getProviderInstance<ChatProvider>(activeProvider.value), [])
  }
})

onMounted(() => {
  start()
  screenSafeArea.update()
})
</script>

<template>
  <div fixed bottom-0 w-full flex flex-col>
    <KeepAlive>
      <Transition name="fade">
        <MobileChatHistory v-if="!stageViewControlsEnabled" max-w="[calc(100%-3.5rem)]" w-full self-start pl-3 />
      </Transition>
    </KeepAlive>
    <div relative w-full self-end>
      <div top="50%" translate-y="[-50%]" fixed z-15 px-3>
        <ViewControlInputs ref="viewControlsInputs" :mode="viewControlsActiveMode" />
      </div>
      <div translate-y="[-100%]" absolute right-0 w-full px-3 pb-3 font-sans>
        <div flex="~ col" w-full gap-1>
          <ActionAbout />
          <a
            href="https://github.com/MaximBayer/airi-ua"
            target="_blank"
            rel="noopener noreferrer"
            border="2 solid neutral-100/60 dark:neutral-800/30"
            bg="neutral-50/70 dark:neutral-800/70"
            w-fit flex items-center self-end justify-center rounded-xl p-2 backdrop-blur-md
            title="GitHub Repository"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" class="text-neutral-500 dark:text-neutral-400">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
          </a>
          <button
            border="2 solid neutral-100/60 dark:neutral-800/30"
            bg="neutral-50/70 dark:neutral-800/70"
            w-fit flex items-center self-end justify-center rounded-xl p-2 backdrop-blur-md
            title="Прикріпити зображення"
            @click="() => imageUploadRef?.openFileDialog?.()"
          >
            <div i-solar:gallery-add-outline size-5 text="neutral-500 dark:neutral-400" />
          </button>
          <button
            border="2 solid neutral-100/60 dark:neutral-800/30"
            bg="neutral-50/70 dark:neutral-800/70"
            w-fit flex items-center self-end justify-center rounded-xl p-2 backdrop-blur-md
            title="Очистити історію чату"
            @click="clearChatHistory"
          >
            <div i-solar:trash-bin-minimalistic-outline size-5 text="neutral-500 dark:neutral-400" />
          </button>
          <button border="2 solid neutral-100/60 dark:neutral-800/30" bg="neutral-50/70 dark:neutral-800/70" w-fit flex items-center self-end justify-center rounded-xl p-2 backdrop-blur-md title="Theme" @click="isDark = !isDark">
            <Transition name="fade" mode="out-in">
              <div v-if="isDark" i-solar:moon-outline size-5 text="neutral-500 dark:neutral-400" />
              <div v-else i-solar:sun-2-outline size-5 text="neutral-500 dark:neutral-400" />
            </Transition>
          </button>
          <!-- <button border="2 solid neutral-100/60 dark:neutral-800/30" bg="neutral-50/70 dark:neutral-800/70" w-fit flex items-center self-end justify-center rounded-xl p-2 backdrop-blur-md title="Language">
            <div i-solar:earth-outline size-5 text="neutral-500 dark:neutral-400" />
          </button> -->
          <RouterLink to="/settings" border="2 solid neutral-100/60 dark:neutral-800/30" bg="neutral-50/70 dark:neutral-800/70" w-fit flex items-center self-end justify-center rounded-xl p-2 backdrop-blur-md title="Settings">
            <div i-solar:settings-outline size-5 text="neutral-500 dark:neutral-400" />
          </RouterLink>
          <!-- <button border="2 solid neutral-100/60 dark:neutral-800/30" bg="neutral-50/70 dark:neutral-800/70" w-fit flex items-center self-end justify-center rounded-xl p-2 backdrop-blur-md title="Model">
            <div i-solar:face-scan-circle-outline size-5 text="neutral-500 dark:neutral-400" />
          </button> -->
          <ActionViewControls v-model="viewControlsActiveMode" @reset="() => viewControlsInputsRef?.resetOnMode()" />
        </div>
      </div>
      <div bg="white dark:neutral-800" max-h-100dvh max-w-100dvw w-full flex="~ col" gap-2 overflow-auto px-3 pt-2 :style="{ paddingBottom: `${Math.max(Number.parseFloat(screenSafeArea.bottom.value.replace('px', '')), 12)}px` }">
        <!-- Image Upload Area - only show when images are uploaded -->
        <div v-if="uploadedImages.length > 0">
          <ImageUpload
            ref="imageUploadRef"
            @upload="handleImageUpload"
            @clear="handleImageClear"
          />
        </div>

        <!-- Hidden image upload for file dialog functionality -->
        <div v-else style="display: none;">
          <ImageUpload
            ref="imageUploadRef"
            @upload="handleImageUpload"
            @clear="handleImageClear"
          />
        </div>

        <!-- Text Input Area -->
        <div flex gap-1>
          <BasicTextarea
            v-model="messageInput"
            :placeholder="t('stage.message')"
            border="solid 2 neutral-200/60 dark:neutral-700/60"
            text="neutral-500 hover:neutral-600 dark:neutral-100 dark:hover:neutral-200 placeholder:neutral-400 placeholder:hover:neutral-500 placeholder:dark:neutral-300 placeholder:dark:hover:neutral-400"
            bg="neutral-100/80 dark:neutral-950/80"
            max-h="[10lh]" min-h="[calc(1lh+4px+4px)]"
            w-full resize-none overflow-y-scroll rounded="[1lh]" px-4 py-0.5 outline-none backdrop-blur-md scrollbar-none
            transition="all duration-250 ease-in-out placeholder:all placeholder:duration-250 placeholder:ease-in-out"
            :class="[themeColorsHueDynamic ? 'transition-colors-none placeholder:transition-colors-none' : '']"
            default-height="1lh"
            @submit="handleSend"
            @compositionstart="isComposing = true"
            @compositionend="isComposing = false"
          />
          <button
            v-if="messageInput.trim() || isComposing || uploadedImages.length > 0"
            w="[calc(1lh+4px+4px)]" h="[calc(1lh+4px+4px)]" aspect-square flex items-center self-end justify-center rounded-full outline-none backdrop-blur-md
            text="neutral-500 hover:neutral-600 dark:neutral-900 dark:hover:neutral-800"
            bg="primary-50/80 dark:neutral-100/80 hover:neutral-50"
            transition="all duration-250 ease-in-out"
            @click="handleSend"
          >
            <div i-solar:arrow-up-outline />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
