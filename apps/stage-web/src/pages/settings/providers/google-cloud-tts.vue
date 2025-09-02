<script setup lang="ts">
import type { SpeechProviderWithExtraOptions } from '@xsai-ext/shared-providers'

import {
  SpeechPlayground,
  SpeechProviderSettings,
} from '@proj-airi/stage-ui/components'
import { useSpeechStore } from '@proj-airi/stage-ui/stores/modules/speech'
import { useProvidersStore } from '@proj-airi/stage-ui/stores/providers'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'

const speechStore = useSpeechStore()
const providersStore = useProvidersStore()
const { providers } = storeToRefs(providersStore)

// Get provider metadata
const providerId = 'google-cloud-tts'
const defaultModel = 'gemini-2.5-flash-preview-tts'

// Check if API key is configured
const apiKeyConfigured = computed(() => !!providers.value[providerId]?.apiKey)

// Generate speech with Google Cloud TTS-specific parameters
async function handleGenerateSpeech(text: string) {
  const provider = await providersStore.getProviderInstance<SpeechProviderWithExtraOptions<string, any>>(providerId)
  if (!provider) {
    throw new Error('Failed to initialize speech provider')
  }

  // Get provider configuration
  const providerConfig = providersStore.getProviderConfig(providerId)

  // Get model from configuration or use default
  const model = providerConfig.model as string | undefined || defaultModel

  // Get active voice
  const activeVoice = speechStore.activeSpeechVoice

  return await speechStore.speech(
    provider,
    model,
    text,
    activeVoice?.id || 'uk-UA-Wavenet-A',
    'mp3',
  )
}
</script>

<template>
  <SpeechProviderSettings
    :provider-id="providerId"
    :default-model="defaultModel"
  >
    <template #playground>
      <SpeechPlayground
        :generate-speech="handleGenerateSpeech"
        :api-key-configured="apiKeyConfigured"
      />
    </template>
  </SpeechProviderSettings>
</template>

<route lang="yaml">
  meta:
    layout: settings
</route>
