export default defineNuxtConfig({
  compatibilityDate: '2024-07-30',
  future: { compatibilityVersion: 4 },
  modules: [
    '@nuxthub/core',
    '@nuxt/ui',
    'nuxt-auth-utils',
    '@nuxt/eslint',
    'nuxt-file-storage',
  ],
  hub: {
    database: true
  },
  // Development config
  eslint: {
    config: {
      stylistic: {
        quotes: 'single',
        commaDangle: 'never'
      }
    }
  },
  devtools: {
    enabled: true
  },
  runtimeConfig: {
    nocodbToken: process.env.NUXT_NOCODB_TOKEN, // can be overridden by NUXT_NOCODB_TOKEN env variable
  },

})
