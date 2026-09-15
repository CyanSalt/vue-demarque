import { computedAsync, useDark } from '@vueuse/core'
import { bundledThemes } from 'shiki'
import { computed } from 'vue'

export function useHighlighterThemes() {
  const themes = computed(() => {
    return {
      light: 'material-theme-lighter',
      dark: 'material-theme-palenight',
    }
  })
  return themes
}

// const highlighterThemes: InjectionKey<Ref<{
//   light: string,
//   dark: string,
// }>> = Symbol('highlighterThemes')

// export const useHighlighterThemes = useExtensibleContext(highlighterThemes, {
//   default: () => ({
//     light: 'material-theme-lighter',
//     dark: 'material-theme-palenight',
//   }),
//   merge: (value, parent) => ({
//     ...parent,
//     ...value,
//   }),
// })

export function useHighlighterTheme() {
  const themes = useHighlighterThemes()
  const isDark = useDark()
  const theme = computed(() => {
    return isDark.value ? themes.value.dark : themes.value.light
  })
  return theme
}

export function useHighlighterThemeRegistration() {
  const theme = useHighlighterTheme()
  const themeRegistration = computedAsync(async () => {
    const bundled = bundledThemes[theme.value]
    const { default: registration } = await bundled()
    return registration
  })
  return themeRegistration
}
