import type * as Hast from 'hast'
import type { PluggableList } from 'unified'
import type { InjectionKey, MaybeRefOrGetter, Ref } from 'vue'
import { computed, inject, provide, ref, toValue } from 'vue'
import type { HastVueRenderFunction } from '../components/markdown/HastRenderer'

export function useExtensibleContext<T>(key: InjectionKey<Ref<T>>, {
  default: defaultFactory,
  merge,
}: {
  default: () => T,
  merge: (value: T, parent: T) => T,
}) {
  return function (source?: MaybeRefOrGetter<T>) {
    const parentSource = inject<Ref<T>>(key, ref(defaultFactory()) as Ref<T>)
    if (source) {
      const merged: Ref<T> = computed(() => merge(toValue(source), toValue(parentSource)))
      provide(key, merged)
      return merged
    } else {
      return parentSource
    }
  }
}

export interface MarkdownRendererCustomization<T extends Hast.Nodes = Hast.Nodes> {
  test: (node: Hast.Nodes) => node is T,
  render: HastVueRenderFunction<T>,
}

export interface MarkdownRendererConfig {
  plugins?: PluggableList,
  customizations?: MarkdownRendererCustomization[],
}

export function defineMarkdownRendererCustomization<
  T extends Hast.Nodes,
>(customization: MarkdownRendererCustomization<T>) {
  return customization
}

const markdownRendererConfig: InjectionKey<Ref<MarkdownRendererConfig>> = Symbol('markdownRendererConfig')

export const useMarkdownRendererConfig = useExtensibleContext(markdownRendererConfig, {
  default: () => ({
    customizations: [],
  }),
  merge: (value, parent) => ({
    ...parent,
    ...value,
    customizations: [
      ...(parent.customizations ?? []),
      ...(value.customizations ?? []),
    ],
  }),
})
