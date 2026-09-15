<script lang="ts" setup>
import { remarkAlert } from 'remark-github-blockquote-alert'
import { h } from 'vue'
import { defineMarkdownRendererCustomization, getHastVueProps, MarkdownRenderer, renderHastChildren, useMarkdownRendererConfig } from 'vue-demarque'
import example from './assets/example.md?raw'
import MarkdownAlert from './components/MarkdownAlert.vue'

useMarkdownRendererConfig({
  plugins: [
    remarkAlert,
  ],
  customizations: [
    defineMarkdownRendererCustomization({
      test: (node): node is Extract<typeof node, { type: 'element' }> => {
        return Boolean(
          node.type === 'element'
          && node.properties.className?.includes('markdown-alert'),
        )
      },
      render: (node, ctx) => {
        const type = node.properties.className
          ?.find(item => item.startsWith('markdown-alert-'))
          ?.replace(/^markdown-alert-/, '')
        const children = node.children.filter(child => {
          return !(child.type === 'element' && child.properties.className?.includes('markdown-alert-title'))
        })
        return h(
          MarkdownAlert,
          { ...getHastVueProps(node, ctx), type },
          () => renderHastChildren({ ...node, children }, ctx),
        )
      },
    }),
  ],
})
</script>

<template>
  <UApp>
    <UPage>
      <UPageBody>
        <UContainer>
          <MarkdownRenderer :content="example" html />
        </UContainer>
      </UPageBody>
    </UPage>
  </UApp>
</template>
