<script setup lang="ts">
import { ImageGenerationPanel } from '@proj-airi/stage-ui/components'
import { Button } from '@proj-airi/stage-ui/components/Misc'
import { useImageGenerationStore } from '@proj-airi/stage-ui/stores/modules/image-generation'
import { useProvidersStore } from '@proj-airi/stage-ui/stores/providers'
import { Select } from '@proj-airi/ui'
import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const providersStore = useProvidersStore()
const imageStore = useImageGenerationStore()

const { allImageGenerationProvidersMetadata, configuredImageGenerationProvidersMetadata } = storeToRefs(providersStore)
const { selectedProvider, activeModel, availableModels } = storeToRefs(imageStore)

const showConfigureDialog = ref(false)
const selectedProviderToConfig = ref('')

const modelOptions = computed(() =>
  availableModels.value.map(model => ({
    value: model.id,
    label: model.name,
  })),
)

function configureProvider(providerId: string) {
  selectedProviderToConfig.value = providerId
  showConfigureDialog.value = true
}
</script>

<template>
  <div class="image-generation-settings" mx-auto max-w-4xl px-4 py-6>
    <!-- Header -->
    <div class="header" mb-8>
      <h2 mb-2 text-2xl font-bold>
        {{ t('settings.imageGeneration.title', 'Image Generation') }}
      </h2>
      <p text-neutral-600 dark:text-neutral-400>
        {{ t('settings.imageGeneration.description', 'Configure AI image generation providers and settings') }}
      </p>
    </div>

    <!-- Provider Configuration -->
    <div class="providers-section" mb-8>
      <h3 mb-4 text-lg font-semibold>
        {{ t('settings.imageGeneration.providers', 'Providers') }}
      </h3>

      <div class="providers-grid" grid grid-cols-1 mb-6 gap-4>
        <div
          v-for="provider in allImageGenerationProvidersMetadata"
          :key="provider.id"
          class="provider-card"
          border border-neutral-200 rounded-lg p-4 transition-colors hover:border-neutral-300
        >
          <div flex items-center justify-between>
            <div flex items-center gap-3>
              <div class="provider-icon">
                <div v-if="provider.icon" :class="provider.icon" size-6 />
                <div v-else class="h-6 w-6 rounded bg-neutral-300" />
              </div>

              <div>
                <h4 font-semibold>
                  {{ provider.name }}
                </h4>
                <p text-sm text-neutral-600 dark:text-neutral-400>
                  {{ provider.description }}
                </p>
              </div>
            </div>

            <div flex items-center gap-2>
              <div
                class="status-indicator"
                :class="{
                  'bg-green-500': provider.configured,
                  'bg-neutral-300': !provider.configured,
                }"
                h-2 w-2 rounded-full
              />

              <Button
                size="sm"
                :variant="provider.configured ? 'secondary' : 'primary'"
                @click="configureProvider(provider.id)"
              >
                {{ provider.configured ? t('settings.reconfigure', 'Reconfigure') : t('settings.configure', 'Configure') }}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <!-- Active Provider Selection -->
      <div v-if="configuredImageGenerationProvidersMetadata.length > 0" class="active-provider">
        <h4 mb-3 font-medium>
          {{ t('settings.imageGeneration.activeProvider', 'Active Provider') }}
        </h4>

        <div grid grid-cols-2 gap-4>
          <div>
            <label mb-2 block text-sm font-medium>
              {{ t('settings.imageGeneration.provider', 'Provider') }}
            </label>
            <Select
              v-model="selectedProvider"
              :options="configuredImageGenerationProvidersMetadata.map(p => ({ value: p.id, label: p.name }))"
              placeholder="Select provider"
            />
          </div>

          <div>
            <label mb-2 block text-sm font-medium>
              {{ t('settings.imageGeneration.model', 'Model') }}
            </label>
            <Select
              v-model="activeModel"
              :options="modelOptions"
              placeholder="Select model"
              :disabled="!selectedProvider"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Image Generation Panel -->
    <div v-if="configuredImageGenerationProvidersMetadata.length > 0" class="generation-panel">
      <h3 mb-4 text-lg font-semibold>
        {{ t('settings.imageGeneration.testGeneration', 'Test Generation') }}
      </h3>

      <div

        border border-neutral-200 rounded-lg bg-neutral-50 p-4 dark:bg-neutral-900
      >
        <ImageGenerationPanel />
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state" py-12 text-center>
      <div class="icon" mb-4>
        <div i-solar:gallery-add-outline mx-auto size-12 text-neutral-400 />
      </div>
      <h3 mb-2 text-lg text-neutral-900 font-medium dark:text-neutral-100>
        {{ t('settings.imageGeneration.noProviders', 'No Image Generation Providers') }}
      </h3>
      <p mb-6 text-neutral-600 dark:text-neutral-400>
        {{ t('settings.imageGeneration.configureFirst', 'Configure a provider to start generating images') }}
      </p>

      <Button
        v-if="allImageGenerationProvidersMetadata.length > 0"
        variant="primary"
        @click="configureProvider(allImageGenerationProvidersMetadata[0].id)"
      >
        {{ t('settings.imageGeneration.configureProvider', 'Configure Provider') }}
      </Button>
    </div>
  </div>
</template>

<style scoped>
.provider-card {
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(8px);
}

.dark .provider-card {
  background: rgba(17, 24, 39, 0.5);
}
</style>
