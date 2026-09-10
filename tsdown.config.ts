import { defineConfig } from 'tsdown'
import vue from 'unplugin-vue/rolldown'

export default defineConfig({
  entry: ['src/index.ts'],
  platform: 'neutral',
  tsconfig: 'tsconfig.lib.json',
  plugins: [
    vue({ isProduction: true }),
  ],
  dts: {
    vue: true,
  },
  unbundle: true,
})
