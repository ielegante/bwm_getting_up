// https://nuxt.com/docs/api/configuration/nuxt-config
export default {
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
  ],

  app: {
    head: {
      title: 'DocAnalyzer',
      meta: [
        { name: 'description', content: 'Document analysis and relationship visualization tool' }
      ],
    }
  },

  imports: {
    dirs: ['stores', 'composables'],
  },

  tailwindcss: {
    cssPath: '~/assets/css/tailwind.css',
    configPath: 'tailwind.config.js',
  },

  typescript: {
    strict: false,
    typeCheck: false,
  },

  build: {
    transpile: ['types']
  },

  vite: {
    optimizeDeps: {
      include: ['types']
    },
    // Ensure we always prefer .ts files over .js files
    resolve: {
      extensions: ['.ts', '.tsx', '.vue', '.js', '.jsx', '.json']
    }
  },

  // Disable server-side rendering to simplify debugging
  ssr: false,

  compatibilityDate: '2025-04-13'
};