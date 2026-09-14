<script lang="ts" setup>
import { useDark } from '@vueuse/core'
import './mermaid'
import mermaid from 'mermaid'
import { computed, useId, useTemplateRef, watchEffect } from 'vue'

const {
  content,
  as = 'div',
} = defineProps<{
  content: string,
  as?: string,
}>()

const container = useTemplateRef<HTMLElement>('container')

const isDark = useDark()
const themeReference = computed(() => {
  const theme = isDark.value ? 'dark' : 'default'
  mermaid.initialize({
    theme,
  })
  return theme
})

const id = useId()

watchEffect(async () => {
  void themeReference.value
  const element = container.value
  if (element) {
    try {
      const { svg } = await mermaid.render(id, content)
      element.innerHTML = svg
    } catch {
      element.innerHTML = ''
    }
  }
})
</script>

<template>
  <component :is="as" ref="container" class="mermaid"></component>
</template>
