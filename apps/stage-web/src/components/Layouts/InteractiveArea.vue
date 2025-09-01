<script setup lang="ts">
import type { ChatProvider } from '@xsai-ext/shared-providers'

import ImageUpload from '@proj-airi/stage-ui/components/Chat/ImageUpload.vue'
import WhisperWorker from '@proj-airi/stage-ui/libs/workers/worker?worker&url'

import { toWAVBase64 } from '@proj-airi/audio'
import { useMicVAD, useWhisper } from '@proj-airi/stage-ui/composables'
import { useAudioContext } from '@proj-airi/stage-ui/stores/audio'
import { useChatStore } from '@proj-airi/stage-ui/stores/chat'
import { useConsciousnessStore } from '@proj-airi/stage-ui/stores/modules/consciousness'
import { useProvidersStore } from '@proj-airi/stage-ui/stores/providers'
import { useSettings, useSettingsAudioDevice } from '@proj-airi/stage-ui/stores/settings'
import { BasicTextarea } from '@proj-airi/ui'
import { storeToRefs } from 'pinia'
import { onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import ChatHistory from '../Widgets/ChatHistory.vue'

const messageInput = ref('')
const listening = ref(false)
const showMicrophoneSelect = ref(false)
const isComposing = ref(false)
const uploadedImages = ref<File[]>([])
const imageUploadRef = ref<InstanceType<typeof ImageUpload>>()

const providersStore = useProvidersStore()
const { activeProvider, activeModel } = storeToRefs(useConsciousnessStore())
const { themeColorsHueDynamic } = storeToRefs(useSettings())

const { askPermission } = useSettingsAudioDevice()
const { enabled, selectedAudioInput } = storeToRefs(useSettingsAudioDevice())
const { send, onAfterMessageComposed, discoverToolsCompatibility, clearChatHistory } = useChatStore()
const { messages } = storeToRefs(useChatStore())
const { audioContext } = useAudioContext()
const { t } = useI18n()

const { transcribe: generate, terminate } = useWhisper(WhisperWorker, {
  onComplete: async (res) => {
    if (!res || !res.trim()) {
      return
    }

    const providerConfig = providersStore.getProviderConfig(activeProvider.value)

    await send(res, {
      chatProvider: await providersStore.getProviderInstance(activeProvider.value) as ChatProvider,
      model: activeModel.value,
      providerConfig,
    })
  },
})

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

function handleImageUpload(images: File[]) {
  uploadedImages.value = images
}

function handleImageClear() {
  uploadedImages.value = []
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
    handleTranscription(buffer.buffer)
  },
  auto: false,
})

async function handleTranscription(buffer: ArrayBufferLike) {
  await audioContext.resume()

  // Convert Float32Array to WAV format
  const audioBase64 = await toWAVBase64(buffer, audioContext.sampleRate)
  generate({ type: 'generate', data: { audio: audioBase64, language: 'en' } })
}

watch(enabled, async (value) => {
  if (value === false) {
    destroy()
    terminate()
  }
})

watch(showMicrophoneSelect, async (value) => {
  if (value) {
    await askPermission()
  }
})

watch([activeProvider, activeModel], async () => {
  if (activeProvider.value && activeModel.value) {
    await discoverToolsCompatibility(activeModel.value, await providersStore.getProviderInstance<ChatProvider>(activeProvider.value), [])
  }
})

onMounted(() => {
  // loadWhisper()
  start()
})

onAfterMessageComposed(async () => {
  messageInput.value = ''
})
</script>

<template>
  <div flex="col" items-center pt-4>
    <div h-full max-h="[85vh]" w-full py="4">
      <div
        flex="~ col"
        border="solid 4 primary-200/20 dark:primary-400/20"
        h-full w-full overflow-scroll rounded-xl
        bg="primary-50/50 dark:primary-950/70" backdrop-blur-md
      >
        <div flex items-center justify-between px-4 pt-2>
          <button
            class="image-upload-btn"
            title="Прикріпити зображення"
            @click="() => imageUploadRef?.openFileDialog?.()"
          >
            <div i-solar:gallery-add-outline size-4 />
          </button>
          <button
            class="clear-chat-btn"
            title="Очистити історію чату"
            @click="clearChatHistory"
          >
            <div i-solar:trash-bin-minimalistic-outline size-4 />
          </button>
        </div>
        <ChatHistory h-full flex-1 p-4 w="full" max-h="<md:[60%]" />
        <div h="<md:full" flex="~ col" gap-2>
          <!-- Image Upload Area - only show when images are uploaded -->
          <div v-if="uploadedImages.length > 0" px-4>
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

          <!-- Text Input -->
          <div flex gap-2>
            <BasicTextarea
              v-model="messageInput"
              :placeholder="t('stage.message')"
              text="primary-500 hover:primary-600 dark:primary-300/50 dark:hover:primary-500 placeholder:primary-400 placeholder:hover:primary-500 placeholder:dark:primary-300/50 placeholder:dark:hover:primary-500"
              bg="primary-200/20 dark:primary-400/20"
              min-h="[100px]" max-h="[300px]" w-full
              rounded-t-xl p-4 font-medium
              outline-none transition="all duration-250 ease-in-out placeholder:all placeholder:duration-250 placeholder:ease-in-out"
              :class="{
                'transition-colors-none placeholder:transition-colors-none': themeColorsHueDynamic,
              }"
              @submit="handleSend"
              @compositionstart="isComposing = true"
              @compositionend="isComposing = false"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.clear-chat-btn {
  @apply p-2 rounded-lg transition-all duration-200;
  @apply text-primary-400 hover:text-primary-600 dark:text-primary-300 dark:hover:text-primary-100;
  @apply bg-primary-100/50 hover:bg-primary-200/70 dark:bg-primary-800/50 dark:hover:bg-primary-700/70;
  @apply backdrop-blur-sm;
}

.image-upload-btn {
  @apply p-2 rounded-lg transition-all duration-200;
  @apply text-primary-400 hover:text-primary-600 dark:text-primary-300 dark:hover:text-primary-100;
  @apply bg-primary-100/50 hover:bg-primary-200/70 dark:bg-primary-800/50 dark:hover:bg-primary-700/70;
  @apply backdrop-blur-sm;
}
</style>
