<script lang="ts" setup>
import { capitalize, computed } from 'vue'

const { type: inputType } = defineProps<{
  type?: 'note' | 'tip' | 'important' | 'warning' | 'caution' | (string & {}),
}>()

const type = computed(() => {
  switch (inputType) {
    case 'note':
    case 'tip':
    case 'important':
    case 'warning':
    case 'caution':
      return inputType
    default:
      return 'note'
  }
})

const icon = computed(() => {
  switch (type.value) {
    case 'tip':
      return 'i-lucide:lightbulb'
    case 'important':
      return 'i-lucide:message-square-warning'
    case 'warning':
      return 'i-lucide:triangle-alert'
    case 'caution':
      return 'i-lucide:octagon-alert'
    case 'note':
    default:
      return 'i-lucide:info'
  }
})

const title = computed(() => {
  return capitalize(type.value)
})
</script>

<template>
  <blockquote
    :class="[
      'prose-off my-4 border-s-4 mt-2 ps-4 [&_p]:my-0!',
      { 'border-info': type === 'note' },
      { 'border-success': type === 'tip' },
      { 'border-primary': type === 'important' },
      { 'border-warning': type === 'warning' },
      { 'border-error': type === 'caution' },
    ]"
  >
    <div
      :class="[
        'flex items-center gap-2 mb-2 font-medium',
        { 'text-info': type === 'note' },
        { 'text-success': type === 'tip' },
        { 'text-primary': type === 'important' },
        { 'text-warning': type === 'warning' },
        { 'text-error': type === 'caution' },
      ]"
    >
      <UIcon :name="icon" />
      {{ title }}
    </div>
    <slot></slot>
  </blockquote>
</template>
