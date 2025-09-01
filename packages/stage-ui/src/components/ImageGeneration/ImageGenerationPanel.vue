<script setup lang="ts">
import type { ImageGenerationOptions } from '../../stores/providers/image-generation'

import { BasicTextarea, Select } from '@proj-airi/ui'
import { storeToRefs } from 'pinia'
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import { useImageGenerationStore } from '../../stores/modules/image-generation'
import { Button } from '../Misc'

const { t } = useI18n()
const imageStore = useImageGenerationStore()

const {
  selectedProvider,
  activeModel,
  defaultOptions,
  availableModels,
  isGenerating,
  generationError,
  generatedImages,
} = storeToRefs(imageStore)

const prompt = ref('')
const selectedSize = ref(defaultOptions.value.size || '1024x1024')
const selectedQuality = ref(defaultOptions.value.quality || 'standard')
const selectedStyle = ref(defaultOptions.value.style || 'vivid')
const selectedCount = ref(defaultOptions.value.n || 1)

const sizeOptions = [
  { value: '256x256', label: '256x256' },
  { value: '512x512', label: '512x512' },
  { value: '1024x1024', label: '1024x1024' },
  { value: '1792x1024', label: '1792x1024 (landscape)' },
  { value: '1024x1792', label: '1024x1792 (portrait)' },
]

const qualityOptions = [
  { value: 'standard', label: 'Standard' },
  { value: 'hd', label: 'HD' },
]

const styleOptions = [
  { value: 'vivid', label: 'Vivid' },
  { value: 'natural', label: 'Natural' },
]

// Update default options when settings change
watch([selectedSize, selectedQuality, selectedStyle, selectedCount], () => {
  defaultOptions.value = {
    size: selectedSize.value as any,
    quality: selectedQuality.value as any,
    style: selectedStyle.value as any,
    n: selectedCount.value,
  }
})

async function handleGenerate() {
  if (!prompt.value.trim())
    return

  try {
    const options: ImageGenerationOptions = {
      size: selectedSize.value as any,
      quality: selectedQuality.value as any,
      style: selectedStyle.value as any,
      n: selectedCount.value,
    }
    await imageStore.generateImage(prompt.value, options)
  }
  catch (error) {
    console.error('Image generation failed:', error)
  }
}

function handleDownload(imageUrl: string, index: number) {
  const filename = `airi-generated-${Date.now()}-${index}.png`
  imageStore.downloadImage(imageUrl, filename)
}
</script>

<template>
  <div class="image-generation-panel" flex flex-col gap-4 p-4>
    <!-- Header -->
    <div class="header">
      <h3 text-lg font-semibold>
        {{ t('imageGeneration.title', 'Generate Images') }}
      </h3>
      <p text-sm opacity-70>
        {{ t('imageGeneration.description', 'Create images using AI') }}
      </p>
    </div>

    <!-- Settings -->
    <div class="settings" grid grid-cols-2 gap-4>
      <div>
        <label mb-2 block text-sm font-medium>{{ t('imageGeneration.model', 'Model') }}</label>
        <Select
          v-model="activeModel"
          :options="availableModels.map(m => ({ value: m.id, label: m.name }))"
          placeholder="Select model"
        />
      </div>

      <div>
        <label mb-2 block text-sm font-medium>{{ t('imageGeneration.size', 'Size') }}</label>
        <Select
          v-model="selectedSize"
          :options="sizeOptions"
        />
      </div>

      <div>
        <label mb-2 block text-sm font-medium>{{ t('imageGeneration.quality', 'Quality') }}</label>
        <Select
          v-model="selectedQuality"
          :options="qualityOptions"
        />
      </div>

      <div>
        <label mb-2 block text-sm font-medium>{{ t('imageGeneration.style', 'Style') }}</label>
        <Select
          v-model="selectedStyle"
          :options="styleOptions"
        />
      </div>
    </div>

    <!-- Prompt Input -->
    <div class="prompt-section">
      <label mb-2 block text-sm font-medium>{{ t('imageGeneration.prompt', 'Prompt') }}</label>
      <BasicTextarea
        v-model="prompt"
        :placeholder="t('imageGeneration.promptPlaceholder', 'Describe the image you want to generate...')"
        rows="3"
        class="w-full"
      />
    </div>

    <!-- Generate Button -->
    <Button
      :disabled="!prompt.trim() || isGenerating || !selectedProvider"
      :loading="isGenerating"
      class="w-full"
      variant="primary"
      @click="handleGenerate"
    >
      <span v-if="isGenerating">
        {{ t('imageGeneration.generating', 'Generating...') }}
      </span>
      <span v-else>
        {{ t('imageGeneration.generate', 'Generate Image') }}
      </span>
    </Button>

    <!-- Error Message -->
    <div
      v-if="generationError"
      class="error-message"
      border border-red-200 rounded-lg bg-red-50 p-3 text-sm text-red-700
    >
      {{ generationError }}
    </div>

    <!-- Generated Images -->
    <div v-if="generatedImages.length > 0" class="generated-images">
      <h4 mb-3 text-base font-medium>
        {{ t('imageGeneration.recentImages', 'Recent Images') }}
      </h4>

      <div class="images-grid" grid grid-cols-2 max-h-96 gap-4 overflow-y-auto>
        <div
          v-for="item in generatedImages.slice(0, 12)"
          :key="item.id"
          class="image-item"
          overflow-hidden border border-neutral-200 rounded-lg bg-white
        >
          <div class="images-container" grid gap-1>
            <img
              v-for="(image, index) in item.images"
              :key="index"
              :src="image.url || `data:image/png;base64,${image.b64_json}`"
              :alt="item.prompt"
              class="h-32 w-full cursor-pointer object-cover transition-opacity hover:opacity-80"
              @click="handleDownload(image.url || `data:image/png;base64,${image.b64_json}`, index)"
            >
          </div>

          <div class="image-info" p-2>
            <p class="prompt" line-clamp-2 mb-1 text-xs text-neutral-600>
              {{ item.prompt }}
            </p>
            <div class="meta" flex items-center justify-between text-xs text-neutral-500>
              <span>{{ item.model }}</span>
              <span>{{ new Date(item.timestamp).toLocaleDateString() }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="actions" mt-4 flex gap-2>
        <Button
          variant="secondary"
          size="sm"
          @click="imageStore.clearHistory"
        >
          {{ t('imageGeneration.clearHistory', 'Clear History') }}
        </Button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.image-generation-panel {
  max-width: 800px;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
