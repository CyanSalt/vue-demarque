<script lang="ts" setup>
import katex from 'katex';
import { computed, useTemplateRef, watchEffect } from 'vue';

const {
  content,
  inline,
} = defineProps<{
  content: string;
  inline?: boolean;
}>();

const as = computed(() => (inline ? 'span' : 'div'));

const container = useTemplateRef<HTMLElement>('container');

watchEffect(async () => {
  const element = container.value;
  if (element) {
    katex.render(content, element, {
      displayMode: !inline,
      output: 'mathml',
    });
  }
});
</script>

<template>
  <component :is="as" ref="container" class="math"></component>
</template>
