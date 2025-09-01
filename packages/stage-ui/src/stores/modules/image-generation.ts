import type { GeneratedImage, ImageGenerationOptions, ImageGenerationProvider } from '../providers/image-generation'

import { useLocalStorage } from '@vueuse/core'
import { defineStore, storeToRefs } from 'pinia'
import { computed, ref } from 'vue'

import { useProvidersStore } from '../providers'

export interface GeneratedImageItem {
  id: string
  prompt: string
  images: GeneratedImage[]
  timestamp: number
  provider: string
  model?: string
  options?: ImageGenerationOptions
}

export const useImageGenerationStore = defineStore('image-generation', () => {
  const providersStore = useProvidersStore()
  const { configuredImageGenerationProvidersMetadata } = storeToRefs(providersStore)

  // Settings
  const activeProvider = useLocalStorage('image-generation/active-provider', '')
  const activeModel = useLocalStorage('image-generation/active-model', 'dall-e-3')
  const defaultOptions = useLocalStorage<ImageGenerationOptions>('image-generation/default-options', {
    size: '1024x1024',
    quality: 'standard',
    style: 'vivid',
    n: 1,
  })

  // Generated images history
  const generatedImages = useLocalStorage<GeneratedImageItem[]>('image-generation/history', [])

  // Current generation state
  const isGenerating = ref(false)
  const generationError = ref<string>('')

  // Auto-select first configured provider if none selected
  const selectedProvider = computed(() => {
    if (!activeProvider.value && configuredImageGenerationProvidersMetadata.value.length > 0) {
      activeProvider.value = configuredImageGenerationProvidersMetadata.value[0].id
    }
    return activeProvider.value
  })

  const availableModels = computed(() => {
    const provider = configuredImageGenerationProvidersMetadata.value.find(p => p.id === selectedProvider.value)
    if (!provider)
      return []

    // Return available models based on provider
    switch (provider.id) {
      case 'openai-dall-e':
        return [
          { id: 'dall-e-3', name: 'DALL-E 3' },
          { id: 'dall-e-2', name: 'DALL-E 2' },
        ]
      case 'stability-ai':
        return [
          { id: 'stable-diffusion-xl-1024-v1-0', name: 'Stable Diffusion XL' },
          { id: 'stable-diffusion-v1-6', name: 'Stable Diffusion v1.6' },
        ]
      default:
        return []
    }
  })

  async function generateImage(prompt: string, options?: Partial<ImageGenerationOptions>) {
    if (!selectedProvider.value) {
      throw new Error('No image generation provider selected')
    }

    if (!prompt.trim()) {
      throw new Error('Prompt cannot be empty')
    }

    try {
      isGenerating.value = true
      generationError.value = ''

      // Get provider configuration and create instance manually
      const providerConfig = providersStore.getProviderConfig(selectedProvider.value)
      if (!providerConfig) {
        throw new Error('Provider not configured')
      }

      const providerMetadata = providersStore.availableProvidersMetadata.find(p => p.id === selectedProvider.value)
      if (!providerMetadata) {
        throw new Error('Provider metadata not found')
      }

      const provider = await Promise.resolve(providerMetadata.createProvider(providerConfig)) as unknown as ImageGenerationProvider
      if (!provider) {
        throw new Error('Failed to get provider instance')
      }

      const mergedOptions = { ...defaultOptions.value, ...options }
      const result = await provider.generateImage(prompt, mergedOptions)

      // Create history item
      const historyItem: GeneratedImageItem = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        prompt,
        images: result.images,
        timestamp: Date.now(),
        provider: selectedProvider.value,
        model: activeModel.value,
        options: mergedOptions,
      }

      // Add to history (keep last 50 items)
      generatedImages.value.unshift(historyItem)
      if (generatedImages.value.length > 50) {
        generatedImages.value = generatedImages.value.slice(0, 50)
      }

      return historyItem
    }
    catch (error) {
      generationError.value = error instanceof Error ? error.message : 'Unknown error occurred'
      throw error
    }
    finally {
      isGenerating.value = false
    }
  }

  function clearHistory() {
    generatedImages.value = []
  }

  function removeImage(id: string) {
    const index = generatedImages.value.findIndex(item => item.id === id)
    if (index !== -1) {
      generatedImages.value.splice(index, 1)
    }
  }

  function downloadImage(imageUrl: string, filename?: string) {
    const link = document.createElement('a')
    link.href = imageUrl
    link.download = filename || `airi-generated-${Date.now()}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return {
    // Settings
    activeProvider,
    activeModel,
    defaultOptions,
    selectedProvider,
    availableModels,

    // State
    isGenerating,
    generationError,
    generatedImages,

    // Actions
    generateImage,
    clearHistory,
    removeImage,
    downloadImage,
  }
})

export type ImageGenerationStore = ReturnType<typeof useImageGenerationStore>
