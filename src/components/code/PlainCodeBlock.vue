<script lang="ts" setup>
import { computed } from 'vue'
import { useHighlighterThemeRegistration } from '../../composables/highlighter'

const {
  content,
} = defineProps<{
  content: string,
}>()

const themeRegistration = useHighlighterThemeRegistration()

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
