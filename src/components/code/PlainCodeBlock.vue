<script lang="ts" setup>
import { computedAsync, useDark } from '@vueuse/core'
import { bundledThemes } from 'shiki'
import { computed } from 'vue'

const {
  content,
} = defineProps<{
  content: string,
}>()

const isDark = useDark()

const themeName = computed(() => {
  return isDark.value ? 'material-theme-palenight' : 'material-theme-lighter'
})

const themeRegistration = computedAsync(async () => {
  const bundled = bundledThemes[themeName.value]
  const { default: registration } = await bundled()
  return registration
})

const fallbackStyle = computed(() => {
  const registration = themeRegistration.value
  if (!registration) return undefined
  const bg = registration.bg || registration.colors?.['editor.background']
  const fg = registration.fg ?? registration.colors?.foreground
  return [
    bg ? `background-color: ${bg};` : '',
    fg ? `color: ${fg};` : '',
  ].join(' ')
})
</script>

<template>
  <pre
    class="code-block"
    :style="fallbackStyle"
  ><code>{{ content }}</code></pre>
</template>
