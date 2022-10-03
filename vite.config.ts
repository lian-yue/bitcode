import { defineConfig } from 'vite'
import path from 'path'
import vue from '@vitejs/plugin-vue'


import vitePluginFaviconsInject from 'vite-plugin-favicons-inject';


// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '~bootstrap': path.resolve(__dirname, 'node_modules/bootstrap'),
    }
  },
  plugins: [
    vue(),
    vitePluginFaviconsInject(
      "src/assets/logo.png",
        {
          preferRelatedApplications:true,
          icons:{
            appleStartup: false,
          },
        },
      )
  ],

})
