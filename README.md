# vue-demarque

[![npm](https://img.shields.io/npm/v/vue-demarque.svg)](https://www.npmjs.com/package/vue-demarque)

Content renderer for Vue.

## Installation

```bash
pnpm add vue-demarque
```

## Usage

```vue
<script setup lang="ts">
import { MarkdownRenderer } from 'vue-demarque'
</script>

<template>
  <MarkdownRenderer :content="content" />
</template>
```

### `MarkdownRenderer`

Render markdown content to HTML. Features such as GFM, definition lists, and external links are built-in.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| content | `string` | **Required** | Markdown content |
| streaming | `boolean` | `false` | Whether to enable streaming text transition |
| html | `boolean` | `false` | Whether to enable HTML syntax in markdown |
| templateRef | | | See [`useHastTemplateRef`](#usehasttemplateref). |

### `CodeBlock`

Render code block to HTML.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| content | `string` | **Required** | Code content |
| lang | `string` | `-` | Language of code |

### `PlainCodeBlock`

Render code block to HTML without syntax highlighting.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| content | `string` | **Required** | Code content |

### `KatexRenderer`

Render Katex math to HTML.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| content | `string` | **Required** | Katex math content |
| inline | `boolean` | `-` | Whether to render as a inline element |

### `MermaidRenderer`

Render Mermaid diagram to HTML.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| content | `string` | **Required** | Mermaid diagram content |
| as | `string` | `-` | Element tag name to render as. |

### `useHastTemplateRefs`

```ts
function useHastTemplateRefs<T extends HTMLElement = HTMLElement>(hast: WatchSource<Hast.Nodes | undefined>, filter?: (el: HTMLElement) => boolean): {
    elements: Ref<T[], T[]>;
    templateRef: (el: HTMLElement) => void;
}
```

Create a template ref function to get all elements that match the filter.

```vue
<script setup lang="ts">
import { MarkdownRenderer, useHastTemplateRefs } from 'vue-demarque'

const renderer = useTemplateRef<InstanceType<typeof MarkdownRenderer>>('renderer');
const { elements, templateRef } = useHastTemplateRefs(hast)

// Do anything with `elements`
</script>

<template>
  <MarkdownRenderer ref="renderer" :template-ref="templateRef" :content="content" />
</template>
```

## Styles

`vue-demarque` does not include any styling code. The markdown content is always wrapped within a `.prose` block. You can use this selector to define styles.

```css
.prose {
  /* Your styles here */
}
.prose a {
  /* Your styles here */
}
```

Similarly, elements rendered by `CodeBlock` and `PlainCodeBlock` both have the `.code-block` selector, while elements rendered by `KatexRenderer` have the `.math` selector and elements rendered by `MermaidRenderer` have the `.mermaid` selector.

## Customization

You can use `defineMarkdownRendererCustomization` if you want to customize how specific hast nodes are rendered.

```ts
import {
  defineMarkdownRendererCustomization,
  getHastVueProps,
  renderHastChildren,
  useMarkdownRendererConfig,
} from 'vue-demarque'

useMarkdownRendererConfig({
  customizations: [
    defineMarkdownRendererCustomization({
      test: (node: Hast.Nodes): node is Hast.Element => {
        return node.type === 'element'
          && node.tagName === 'h2';
      },
      render: (node, ctx) => {
        return h(
          MyHeadingElement,
          getHastVueProps(node, ctx),
          () => renderHastChildren(node, ctx),
        );
      },
    }),
  ],
});
```

You can also add custom remark plugins to the config.

```ts
import remarkFrontmatter from 'remark-frontmatter'
import remarkToc from 'remark-toc'
import { useMarkdownRendererConfig } from 'vue-demarque'

useMarkdownRendererConfig({
  plugins: [
    [remarkFrontmatter, ['yaml']],
    remarkToc,
  ],
});
```
