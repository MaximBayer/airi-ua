import type { ProviderMetadata } from '../providers'

export interface ImageGenerationProvider {
  generateImage: (prompt: string, options?: ImageGenerationOptions) => Promise<ImageGenerationResult>
}

export interface ImageGenerationOptions {
  model?: string
  size?: '256x256' | '512x512' | '1024x1024' | '1792x1024' | '1024x1792'
  quality?: 'standard' | 'hd'
  style?: 'vivid' | 'natural'
  n?: number
}

export interface ImageGenerationResult {
  images: GeneratedImage[]
  created: number
}

export interface GeneratedImage {
  url?: string
  b64_json?: string
  revised_prompt?: string
}

// OpenAI DALL-E Provider
export function createOpenAIImageProvider(apiKey: string, baseUrl = 'https://api.openai.com/v1'): ImageGenerationProvider {
  return {
    async generateImage(prompt: string, options: ImageGenerationOptions = {}): Promise<ImageGenerationResult> {
      const response = await fetch(`${baseUrl}/images/generations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: options.model || 'dall-e-3',
          prompt,
          size: options.size || '1024x1024',
          quality: options.quality || 'standard',
          style: options.style || 'vivid',
          n: options.n || 1,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(`DALL-E API Error: ${error.error?.message || response.statusText}`)
      }

      const data = await response.json()
      return {
        images: data.data,
        created: data.created,
      }
    },
  }
}

// Stability AI Provider (для Stable Diffusion)
export function createStabilityAIProvider(apiKey: string): ImageGenerationProvider {
  return {
    async generateImage(prompt: string, options: ImageGenerationOptions = {}): Promise<ImageGenerationResult> {
      const response = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          text_prompts: [{ text: prompt }],
          cfg_scale: 7,
          height: 1024,
          width: 1024,
          steps: 30,
          samples: options.n || 1,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(`Stability AI Error: ${error.message || response.statusText}`)
      }

      const data = await response.json()
      return {
        images: data.artifacts.map((artifact: any) => ({
          b64_json: artifact.base64,
        })),
        created: Date.now(),
      }
    },
  }
}

// Metadata для провайдерів генерації зображень
export const imageGenerationProviders: Record<string, ProviderMetadata> = {
  'openai-dall-e': {
    id: 'openai-dall-e',
    category: 'image-generation' as any,
    tasks: ['image-generation'],
    nameKey: 'settings.pages.providers.provider.openai-dalle.title',
    name: 'OpenAI DALL-E',
    descriptionKey: 'settings.pages.providers.provider.openai-dalle.description',
    description: 'Generate images with DALL-E 3',
    icon: 'i-lobe-icons:openai',
    defaultOptions: () => ({
      baseUrl: 'https://api.openai.com/v1',
      model: 'dall-e-3',
      size: '1024x1024',
      quality: 'standard',
      style: 'vivid',
    }),
    createProvider: config => createOpenAIImageProvider(
      config.apiKey as string,
      config.baseUrl as string,
    ) as any,
    capabilities: {},
    validators: {
      validateProviderConfig: async (config) => {
        const errors = [
          !config.apiKey && new Error('API key is required'),
          !config.baseUrl && new Error('Base URL is required'),
        ].filter(Boolean)

        return {
          errors,
          reason: errors.filter(e => e).map(e => String(e)).join(', ') || '',
          valid: !!config.apiKey && !!config.baseUrl,
        }
      },
    },
  },
  'stability-ai': {
    id: 'stability-ai',
    category: 'image-generation' as any,
    tasks: ['image-generation'],
    nameKey: 'settings.pages.providers.provider.stability-ai.title',
    name: 'Stability AI',
    descriptionKey: 'settings.pages.providers.provider.stability-ai.description',
    description: 'Generate images with Stable Diffusion XL',
    icon: 'i-simple-icons:stability',
    iconColor: '#000000',
    defaultOptions: () => ({}),
    createProvider: config => createStabilityAIProvider(config.apiKey as string) as any,
    capabilities: {},
    validators: {
      validateProviderConfig: async (config) => {
        const errors = [
          !config.apiKey && new Error('API key is required'),
        ].filter(Boolean)

        return {
          errors,
          reason: errors.filter(e => e).map(e => String(e)).join(', ') || '',
          valid: !!config.apiKey,
        }
      },
    },
  },
}
