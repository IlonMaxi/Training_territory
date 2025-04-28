export default {
  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: 'TRAINING TERRITORY',
    htmlAttrs: {
      lang: 'en'
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' },
      { name: 'format-detection', content: 'telephone=no' }
    ],
    link: [
      { rel: 'stylesheet', href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css', integrity: 'sha512-z3gLpd7yknf1YoNbCzqRKc4qyor8gaKU1qmn+CShxbuBusANI9QpRohGBreCFkKxLhei6S9CQXFEbbKuqLg0DA==', crossorigin: 'anonymous', referrerpolicy: 'no-referrer' }
    ]
  },
  
  serverMiddleware: [
    { path: '/api', handler: '~/server/index.js' },
  ],

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [
    '@/assets/global.css'
  ],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
  ],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    ['@nuxtjs/tailwindcss', '@nuxtjs/framer-motion']
    
  ],

  tailwindcss: {
      
  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
  },

  // Server configuration for Nuxt
  server: {
    port: 3000, // Default Nuxt.js port
    host: '0.0.0.0' // Default host
  }
}
