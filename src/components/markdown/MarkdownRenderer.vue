<script lang="ts" setup>
import { computedAsync, useTransition } from '@vueuse/core';
import type * as Hast from 'hast';
import rehypeExternalLinks from 'rehype-external-links';
import rehypeRaw from 'rehype-raw';
import { remark } from 'remark';
import remarkCustomHeaderId from 'remark-custom-header-id';
import { defListHastHandlers, remarkDefinitionList } from 'remark-definition-list';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkRehype from 'remark-rehype';
import { visit } from 'unist-util-visit';
import { defineAsyncComponent, h, nextTick, ref, Suspense, watch } from 'vue';
import type { MarkdownRendererCustomization } from '../../composables/context';
import { useMarkdownRendererConfig } from '../../composables/context';
import { createVueElement, defineHastVueRenderFunction, HastRenderer } from './HastRenderer';

const CodeBlock = defineAsyncComponent(() => import('../code/CodeBlock.vue'));
const MermaidRenderer = defineAsyncComponent(() => import('./MermaidRenderer.vue'));
const KatexRenderer = defineAsyncComponent(() => import('./KatexRenderer.vue'));

const {
  content,
  streaming,
  html,
  templateRef,
} = defineProps<{
  content: string;
  streaming?: boolean;
  html?: boolean;
  templateRef?: (ref: HTMLElement | null, refs: Record<string, any>) => void;
}>();

type VueElementProperties = {
  type: 'code';
  value: string;
  lang?: string;
} | {
  type: 'inlineMath';
  value: string;
} | {
  type: 'math';
  value: string;
};

function rehypeIntegrations() {
  return function (root: Hast.Root) {
    visit(
      root,
      (node: Hast.Nodes): node is Hast.Element => node.type === 'element' && node.tagName === 'vue-element',
      node => {
        const properties = node.properties as VueElementProperties;
        switch (properties.type) {
          case 'code':
            defineHastVueRenderFunction(
              node,
              properties.lang === 'mermaid'
                ? (self, { key, ref }) => {
                  return h(Suspense, null, {
                    default: () => h(MermaidRenderer, { key, ref, content: properties.value }),
                    fallback: () => h(CodeBlock, { key, ref, content: properties.value, lang: 'mermaid' }),
                  });
                }
                : (self, props) => h(CodeBlock, {
                  ...props,
                  content: properties.value,
                  lang: properties.lang ?? undefined,
                }),
            );
            break;
          case 'inlineMath':
            defineHastVueRenderFunction(node, (self, { key, ref }) => h(Suspense, null, {
              default: () => h(KatexRenderer, { key, ref, content: properties.value, inline: true }),
              fallback: () => h('code', { key, ref }, properties.value),
            }));
            break;
          case 'math':
            defineHastVueRenderFunction(node, (self, { key, ref }) => h(Suspense, null, {
              default: () => h(KatexRenderer, { key, ref, content: properties.value }),
              fallback: () => h(CodeBlock, { key, ref, content: properties.value, lang: 'tex' }),
            }));
            break;
        }
      },
    );
  };
}

const config = useMarkdownRendererConfig();

function rehypeCustomize(customizations: MarkdownRendererCustomization[]) {
  return function (root: Hast.Root) {
    for (const customization of customizations) {
      visit(root, customization.test, node => {
        defineHastVueRenderFunction(node, customization.render);
      });
    }
  };
}

let transitionDisabled = ref(true);
let originalLength = ref(content.length);

watch(() => content.length, async value => {
  if (streaming) {
    transitionDisabled.value = true;
    await nextTick();
    transitionDisabled.value = false;
  }
  originalLength.value = value;
});

const transitionLength = useTransition(originalLength, {
  duration: 200,
  disabled: transitionDisabled,
});

const hast = computedAsync(async () => {
  const mdast = remark()
    .use(remarkGfm)
    .use(remarkDefinitionList)
    .use(remarkMath)
    .parse(content.slice(0, Math.round(transitionLength.value)));
  return remark()
    .use(config.value.plugins ?? [])
    .use(remarkCustomHeaderId, Boolean(html))
    .use(remarkRehype, {
      allowDangerousHtml: html,
      handlers: {
        ...defListHastHandlers,
        code: (state, node, parent) => {
          return createVueElement({
            type: 'code',
            lang: node.lang,
            value: node.value,
          } satisfies VueElementProperties);
        },
        inlineMath: (state, node, parent) => {
          return createVueElement({
            type: 'inlineMath',
            value: node.value,
          } satisfies VueElementProperties);
        },
        math: (state, node, parent) => {
          return createVueElement({
            type: 'math',
            value: node.value,
          } satisfies VueElementProperties);
        },
      },
    })
    .use(rehypeRaw, Boolean(html))
    .use(rehypeExternalLinks, {
      target: '_blank',
      rel: ['nofollow noopener noreferrer'],
    })
    .use(rehypeIntegrations)
    .use(rehypeCustomize, config.value.customizations ?? [])
    .run(mdast);
});

defineExpose({
  hast,
});
</script>

<template>
  <section class="prose">
    <HastRenderer v-if="hast" :hast="hast" :template-ref="templateRef" />
  </section>
</template>
