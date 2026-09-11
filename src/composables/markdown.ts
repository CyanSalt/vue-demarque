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
  function templateRef(el: HTMLElement | null) {
    if (el && (!filter || filter(el))) {
      const current = el as T
      const oldIndex = elements.value.indexOf(current)
      const nextElements = oldIndex !== -1
        ? elements.value.filter(item => item !== current)
        : elements.value.slice()
      let targetIndex = nextElements.findIndex(item => {
        // eslint-disable-next-line no-bitwise
        return current.compareDocumentPosition(item)
          & Node.DOCUMENT_POSITION_FOLLOWING
      })
      if (targetIndex === -1) {
        targetIndex = nextElements.length
      }
      if (oldIndex !== targetIndex) {
        nextElements.splice(targetIndex, 0, current)
        elements.value = nextElements
      }
    }
  }
  return {
    elements,
    templateRef,
  }
}
