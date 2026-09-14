import { computedAsync, useDark } from '@vueuse/core'
import { bundledThemes } from 'shiki'
import { computed } from 'vue'

export function useShikiThemes() {
  const themes = computed(() => {
    return {
      light: 'material-theme-lighter',
      dark: 'material-theme-palenight',
    }
  })
  return themes
}

export function useShikiTheme() {
  const themes = useShikiThemes()
  const isDark = useDark()
  const theme = computed(() => {
    return isDark.value ? themes.value.dark : themes.value.light
  })
  return theme
}

export function useShikiThemeRegistration() {
  const theme = useShikiTheme()
  const themeRegistration = computedAsync(async () => {
    const bundled = bundledThemes[theme.value]
    const { default: registration } = await bundled()
    return registration
  })
  return themeRegistration
}
