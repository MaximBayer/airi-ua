<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

interface Emits {
  (e: 'upload', images: File[]): void
  (e: 'clear'): void
}

const emit = defineEmits<Emits>()
const { t } = useI18n()

const files = ref<File[]>([])
const dragOver = ref(false)
const fileInput = ref<HTMLInputElement>()

const imageUrls = computed(() =>
  files.value.map(file => URL.createObjectURL(file)),
)

function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files) {
    const newFiles = Array.from(target.files).filter(file =>
      file.type.startsWith('image/'),
    )
    addFiles(newFiles)
  }
}

function handleDrop(event: DragEvent) {
  event.preventDefault()
  dragOver.value = false

  if (event.dataTransfer?.files) {
    const newFiles = Array.from(event.dataTransfer.files).filter(file =>
      file.type.startsWith('image/'),
    )
    addFiles(newFiles)
  }
}

function handleDragOver(event: DragEvent) {
  event.preventDefault()
  dragOver.value = true
}

function handleDragLeave() {
  dragOver.value = false
}

function addFiles(newFiles: File[]) {
  files.value.push(...newFiles)
  emit('upload', files.value)
}

function removeFile(index: number) {
  URL.revokeObjectURL(imageUrls.value[index])
  files.value.splice(index, 1)

  if (files.value.length === 0) {
    emit('clear')
  }
  else {
    emit('upload', files.value)
  }
}

function clearAll() {
  imageUrls.value.forEach(url => URL.revokeObjectURL(url))
  files.value = []
  emit('clear')
}

function openFileDialog() {
  fileInput.value?.click()
}

defineExpose({
  clearAll,
  openFileDialog,
})
</script>

<template>
  <div class="image-upload">
    <!-- Hidden file input -->
    <input
      ref="fileInput"
      type="file"
      multiple
      accept="image/*"
      style="display: none"
      @change="handleFileSelect"
    >

    <!-- Upload area -->
    <div
      v-if="files.length === 0"
      class="upload-area"
      :class="{ 'drag-over': dragOver }"
      @drop="handleDrop"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
      @click="openFileDialog"
    >
      <div class="upload-content" px-4 py-6 text-center>
        <div class="icon" mb-2>
          <div i-solar:gallery-add-outline size-8 opacity-60 />
        </div>
        <p mb-2 text-sm opacity-80>
          {{ t('chat.imageUpload.dropOrClick', 'Drop images here or click to select') }}
        </p>
        <p text-xs opacity-60>
          {{ t('chat.imageUpload.supportedFormats', 'Supports: PNG, JPG, GIF, WebP') }}
        </p>
      </div>
    </div>

    <!-- Uploaded images preview -->
    <div v-if="files.length > 0" class="images-preview">
      <div class="images-grid" mb-2 flex flex-wrap gap-2>
        <div
          v-for="(url, index) in imageUrls"
          :key="index"
          class="image-item relative"
        >
          <img
            :src="url"
            :alt="`Uploaded image ${index + 1}`"
            class="h-16 w-16 border border-neutral-200 rounded-lg object-cover"
          >
          <button
            class="remove-btn absolute h-5 w-5 flex items-center justify-center rounded-full bg-red-500 text-xs text-white transition-colors -right-1 -top-1 hover:bg-red-600"
            @click="removeFile(index)"
          >
            ×
          </button>
        </div>

        <!-- Add more button -->
        <button
          class="add-more-btn h-16 w-16 flex items-center justify-center border-2 border-neutral-300 rounded-lg border-dashed transition-colors hover:border-neutral-400"
          @click="openFileDialog"
        >
          <div i-solar:add-circle-outline size-6 opacity-60 />
        </button>
      </div>

      <div class="actions" flex items-center justify-between>
        <span text-xs opacity-60>
          {{ t('chat.imageUpload.imagesSelected', `${files.length} image(s) selected`) }}
        </span>
        <button
          class="clear-btn text-xs text-red-600 transition-colors hover:text-red-700"
          @click="clearAll"
        >
          {{ t('chat.imageUpload.clearAll', 'Clear all') }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.upload-area {
  border: 2px dashed rgb(209 213 219);
  border-radius: 0.75rem;
  background: rgb(249 250 251);
  cursor: pointer;
  transition: all 0.2s;
}

.upload-area:hover,
.upload-area.drag-over {
  border-color: rgb(59 130 246);
  background: rgb(239 246 255);
}

.dark .upload-area {
  border-color: rgb(55 65 81);
  background: rgb(17 24 39);
}

.dark .upload-area:hover,
.dark .upload-area.drag-over {
  border-color: rgb(59 130 246);
  background: rgb(30 58 138);
}

.remove-btn {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
</style>
