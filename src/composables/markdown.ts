import type * as Hast from 'hast'
import type { Ref, WatchSource } from 'vue'
import { ref, watch } from 'vue'

export function useHastTemplateRefs<T extends HTMLElement = HTMLElement>(
  hast: WatchSource<Hast.Nodes | undefined>,
  filter?: (el: HTMLElement) => boolean,
) {
  const elements = ref<T[]>([]) as Ref<T[]>
  watch(hast, () => {
    elements.value = []
  })
  function templateRef(el: HTMLElement) {
    if (!filter || filter(el)) {
      elements.value.push(el as T)
    }
  }
  return {
    elements,
    templateRef,
  }
}
