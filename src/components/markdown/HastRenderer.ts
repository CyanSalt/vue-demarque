import type * as Hast from 'hast'
import type { PropType, VNodeChild, VNodeProps } from 'vue'
import { createCommentVNode, createTextVNode, defineComponent, h } from 'vue'

export type HastVueTemplateRef = (ref: HTMLElement | null, refs: Record<string, any>) => void

export interface HastVueRenderContext extends VNodeProps {
  key: PropertyKey | undefined,
  ref?: HastVueTemplateRef,
  render: (node: Hast.Nodes, options?: HastToVNodeOptions) => VNodeChild,
}

export type HastVueRenderFunction<T extends Hast.Nodes = Hast.Nodes> = (
  node: T,
  options: HastVueRenderContext,
) => VNodeChild

export interface HastToVNodeOptions {
  key?: PropertyKey,
  ref?: HastVueTemplateRef,
}

declare module 'hast' {
  export interface Data {
    vue?: HastVueRenderFunction,
  }
}

export function getHastVueProps(
  element: Hast.Element,
  ctx: HastVueRenderContext,
) {
  const { key, ref } = ctx
  const { className, ...props } = element.properties
  return { ...props, class: className, key, ref }
}

export function renderHastChildren(
  element: Hast.Root | Hast.Element,
  ctx: HastVueRenderContext,
) {
  const { render } = ctx
  return (element.children as (Hast.RootContent | Hast.ElementContent)[])
    .map((child, index) => render(child, { key: index }))
}

function hastToVNode(node: Hast.Nodes, options?: HastToVNodeOptions): VNodeChild {
  const renderChild = (child: Hast.Nodes, opts?: HastToVNodeOptions) => hastToVNode(child, { ...options, ...opts })
  const render = node.data?.vue
  if (render) {
    return render(node, { key: options?.key, ref: options?.ref, render: renderChild })
  }
  switch (node.type) {
    case 'root': {
      const ctx: HastVueRenderContext = { key: options?.key, ref: options?.ref, render: renderChild }
      return renderHastChildren(node, ctx)
    }
    case 'element': {
      const ctx: HastVueRenderContext = { key: options?.key, ref: options?.ref, render: renderChild }
      return h(
        node.tagName,
        getHastVueProps(node, ctx),
        () => renderHastChildren(node, ctx),
      )
    }
    case 'comment':
      return createCommentVNode(node.value)
    case 'text':
      return createTextVNode(node.value)
    default:
      return null
  }
}

export function createVueElement(properties: Hast.Properties): Hast.Element {
  return {
    type: 'element',
    tagName: 'vue-element',
    properties,
    children: [],
  }
}

export function defineHastVueRenderFunction<T extends Hast.Nodes>(
  element: T,
  render: HastVueRenderFunction<T>,
) {
  element.data ??= {}
  element.data.vue = render
}

export const HastRenderer = defineComponent({
  name: 'HastRenderer',
  props: {
    hast: {
      type: Object as PropType<Hast.Nodes>,
      required: true,
    },
    templateRef: {
      type: Function as PropType<HastVueTemplateRef>,
    },
  },
  setup(props) {
    return () => hastToVNode(props.hast, { ref: props.templateRef })
  },
})
