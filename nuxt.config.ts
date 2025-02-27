// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: ['@nuxt/ui', '@nuxt/eslint'],
  ssr: true,
  app: {
    baseURL: '/letimaticaView/', // Убедитесь, что это соответствует вашей конфигурации
    // buildAssetsDir: '/_nuxt/' // Это значение по умолчанию, но убедитесь, что оно установлено
  },
  nitro: {
    esbuild: {
      options: {
        target: 'esnext'
      }
    }
  },
  runtimeConfig: {
    public: {
      apiBase: 'https://26.194.150.188:3000'
    },
    MONGODB_URL: process.env.MONGODB_URL,
  }
})