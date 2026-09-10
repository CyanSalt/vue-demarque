<script lang="ts" setup>
import { computedAsync } from '@vueuse/core';
import type { BundledLanguage } from 'shiki';
import { bundledLanguages, codeToHast } from 'shiki';
import { HastRenderer } from '../markdown/HastRenderer';
import PlainCodeBlock from './PlainCodeBlock.vue';

export interface CodeContext {
  filePath?: string;
}

const {
  content,
  lang,
} = defineProps<{
  content: string;
  lang?: string;
}>();

const specialLanguages = ['ansi'];

const hast = computedAsync(async () => {
  const bundledLanguageName = lang && (lang in bundledLanguages || specialLanguages.includes(lang))
    ? lang as BundledLanguage
    : undefined;
  if (!bundledLanguageName) return undefined;
  const root = await codeToHast(content, {
    lang: bundledLanguageName,
    themes: {
      light: 'material-theme-lighter',
      dark: 'material-theme-palenight',
    },
    defaultColor: 'light-dark()',
  });
  // Omit root fragment to inherit attrs
  return root.children[0];
});
</script>

<template>
  <!-- eslint-disable-next-line vue/max-len -->
  <HastRenderer
    v-if="hast"
    :hast="hast"
    class="code-block"
  ></HastRenderer>
  <PlainCodeBlock v-else :content="content" />
</template>
