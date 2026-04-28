import type { HeadingLevel, HeadingStyles, HeadingStyleType, ThemeComposition, ThemeName, ThemeSlot } from '@md/shared/configs'
import { applyTheme } from '@md/core'
import {
  defaultStyleConfig,
  getThemeComposition,
  normalizeThemeComposition,
  stylePresetMap,
  themeCodeBlockThemeMap,
  themePrimaryColorMap,
  widthOptions,
} from '@md/shared/configs'
import { useCssEditorStore } from '@/stores/cssEditor'
import { addPrefix } from '@/utils'
import { store } from '@/utils/storage'

type CustomizableHeadingLevel = Extract<HeadingLevel, ThemeSlot>

/**
 * 主题和样式配置 Store
 * 负责管理所有与主题、字体、颜色相关的配置
 */
export const useThemeStore = defineStore(`theme`, () => {
  // 文本主题
  const theme = store.reactive<ThemeName>(addPrefix(`theme`), defaultStyleConfig.theme)

  // 文本字体
  const fontFamily = store.reactive(`fonts`, defaultStyleConfig.fontFamily)

  // 文本大小
  const fontSize = store.reactive(`size`, defaultStyleConfig.fontSize)

  // 主色
  const primaryColor = store.reactive(`color`, defaultStyleConfig.primaryColor)

  // 是否使用了用户手动选择的主题色。false 时切换主题会跟随该主题的推荐色。
  const isPrimaryColorCustom = store.reactive(addPrefix(`primary_color_custom`), false)

  // 代码块主题
  const codeBlockTheme = store.reactive(`codeBlockTheme`, defaultStyleConfig.codeBlockTheme)

  // 是否使用了用户手动选择的代码块主题。false 时切换文章主题会跟随推荐代码配色。
  const isCodeBlockThemeCustom = store.reactive(addPrefix(`code_block_theme_custom`), false)

  // 图注格式
  const legend = store.reactive(`legend`, defaultStyleConfig.legend)

  // 是否开启 Mac 代码块
  const isMacCodeBlock = store.reactive(addPrefix(`mac_code_block`), defaultStyleConfig.isMacCodeBlock)

  // 是否开启标题自动编号
  const isShowHeadingNumber = store.reactive(addPrefix(`show_heading_number`), defaultStyleConfig.isShowHeadingNumber)

  // 是否开启代码块行号显示
  const isShowLineNumber = store.reactive(`isShowLineNumber`, defaultStyleConfig.isShowLineNumber)

  // 是否开启文本类代码块自动换行
  const isTextCodeBlockWrapped = store.reactive(addPrefix(`text_code_block_wrap`), defaultStyleConfig.isTextCodeBlockWrapped)

  // 是否开启微信外链接底部引用
  const isCiteStatus = store.reactive(`isCiteStatus`, defaultStyleConfig.isCiteStatus)

  // 是否统计字数和阅读时间
  const isCountStatus = store.reactive(`isCountStatus`, defaultStyleConfig.isCountStatus)

  // 是否开启段落首行缩进
  const isUseIndent = store.reactive(addPrefix(`use_indent`), false)

  // 是否开启两端对齐
  const isUseJustify = store.reactive(addPrefix(`use_justify`), false)

  // 预览宽度
  const previewWidth = store.reactive(`previewWidth`, widthOptions[0].value)

  // 标题样式
  const headingStyles = store.reactive<HeadingStyles>(`headingStyles`, defaultStyleConfig.headingStyles)

  // 组合式主题配置：主题本身是一组组件样式 preset 的组合。
  const themeComposition = store.reactive<ThemeComposition>(
    addPrefix(`theme_composition`),
    defaultStyleConfig.themeComposition,
  )

  const isThemeCompositionCustom = store.reactive(addPrefix(`theme_composition_custom`), false)

  const isCustomizableHeadingLevel = (level: HeadingLevel): level is CustomizableHeadingLevel => {
    return level === `h1` || level === `h2` || level === `h3`
  }

  const legacyHeadingPresetMap: Record<HeadingLevel, Partial<Record<HeadingStyleType, string>>> = {
    h1: {
      'color-only': `h1-paper`,
      'border-bottom': `h1-editorial-rule`,
      'border-left': `h1-left-rail`,
    },
    h2: {
      'color-only': `h2-underline`,
      'border-bottom': `h2-paper`,
      'border-left': `h2-left-panel`,
    },
    h3: {
      'color-only': `h3-bottom-line`,
      'border-bottom': `h3-bottom-line`,
      'border-left': `h3-left-rail`,
    },
    h4: {},
    h5: {},
    h6: {},
  }

  const normalizeCurrentThemeComposition = () => {
    themeComposition.value = normalizeThemeComposition(themeComposition.value)
  }

  const migrateLegacyHeadingStyles = () => {
    const entries = Object.entries(headingStyles.value) as [HeadingLevel, HeadingStyleType][]
    const meaningfulEntries = entries.filter(([, style]) => style && style !== `default` && style !== `custom`)

    if (!meaningfulEntries.length) {
      normalizeCurrentThemeComposition()
      return
    }

    const next = normalizeThemeComposition(themeComposition.value)
    let changed = false

    for (const [level, style] of meaningfulEntries) {
      const presetId = legacyHeadingPresetMap[level]?.[style]
      if (isCustomizableHeadingLevel(level) && presetId && stylePresetMap[presetId]?.slot === level) {
        next.slots[level] = presetId
        changed = true
      }
    }

    if (changed) {
      themeComposition.value = next
      isThemeCompositionCustom.value = true
    }
    else {
      normalizeCurrentThemeComposition()
    }

    headingStyles.value = {}
  }

  migrateLegacyHeadingStyles()

  // 计算属性
  const fontSizeNumber = computed(() => Number(fontSize.value.replace(`px`, ``)))

  // Toggle 方法
  const toggleMacCodeBlock = useToggle(isMacCodeBlock)
  const toggleShowHeadingNumber = useToggle(isShowHeadingNumber)
  const toggleShowLineNumber = useToggle(isShowLineNumber)
  const toggleTextCodeBlockWrapped = useToggle(isTextCodeBlockWrapped)
  const toggleCiteStatus = useToggle(isCiteStatus)
  const toggleCountStatus = useToggle(isCountStatus)
  const toggleUseIndent = useToggle(isUseIndent)
  const toggleUseJustify = useToggle(isUseJustify)

  // 重置样式
  const resetStyle = () => {
    isCiteStatus.value = defaultStyleConfig.isCiteStatus
    isMacCodeBlock.value = defaultStyleConfig.isMacCodeBlock
    isShowHeadingNumber.value = defaultStyleConfig.isShowHeadingNumber
    isShowLineNumber.value = defaultStyleConfig.isShowLineNumber
    isTextCodeBlockWrapped.value = defaultStyleConfig.isTextCodeBlockWrapped
    isCountStatus.value = defaultStyleConfig.isCountStatus

    theme.value = defaultStyleConfig.theme
    fontFamily.value = defaultStyleConfig.fontFamily
    fontSize.value = defaultStyleConfig.fontSize
    primaryColor.value = defaultStyleConfig.primaryColor
    isPrimaryColorCustom.value = false
    codeBlockTheme.value = defaultStyleConfig.codeBlockTheme
    isCodeBlockThemeCustom.value = false
    legend.value = defaultStyleConfig.legend
    headingStyles.value = { ...defaultStyleConfig.headingStyles }
    themeComposition.value = getThemeComposition(defaultStyleConfig.theme)
    isThemeCompositionCustom.value = false

    isUseIndent.value = false
    isUseJustify.value = false
  }

  const setThemeSlot = (slot: ThemeSlot, presetId: string) => {
    const preset = stylePresetMap[presetId]
    if (!preset || preset.slot !== slot) {
      return
    }

    themeComposition.value = normalizeThemeComposition({
      ...themeComposition.value,
      slots: {
        ...themeComposition.value.slots,
        [slot]: presetId,
      },
    })
    headingStyles.value = {}
    isThemeCompositionCustom.value = true
  }

  // 设置标题样式
  const setHeadingStyle = (level: HeadingLevel, style: HeadingStyleType) => {
    const presetId = isCustomizableHeadingLevel(level)
      ? style === `default`
        ? getThemeComposition(theme.value).slots[level]
        : legacyHeadingPresetMap[level]?.[style]
      : undefined

    if (presetId && isCustomizableHeadingLevel(level)) {
      setThemeSlot(level, presetId)
    }

    headingStyles.value = {
      ...headingStyles.value,
      [level]: style === `default` ? undefined : style,
    }
  }

  // 获取标题样式
  const getHeadingStyle = (level: HeadingLevel): HeadingStyleType => {
    if (!isCustomizableHeadingLevel(level)) {
      return headingStyles.value[level] || `default`
    }

    const currentPreset = themeComposition.value.slots[level]
    const currentThemeDefault = getThemeComposition(theme.value).slots[level]

    if (currentPreset === currentThemeDefault)
      return `default`

    const matched = Object.entries(legacyHeadingPresetMap[level]).find(([, presetId]) => presetId === currentPreset)
    return matched?.[0] as HeadingStyleType | undefined || `custom`
  }

  const getThemeSlot = (slot: ThemeSlot) => {
    return normalizeThemeComposition(themeComposition.value).slots[slot]
  }

  const useThemeComposition = (newTheme: ThemeName = theme.value) => {
    themeComposition.value = getThemeComposition(newTheme)
    headingStyles.value = {}
    isThemeCompositionCustom.value = false
  }

  const resetThemeComposition = () => {
    useThemeComposition(theme.value)
  }

  const setTheme = (newTheme: ThemeName) => {
    theme.value = newTheme
    useThemeComposition(newTheme)
    if (!isPrimaryColorCustom.value) {
      primaryColor.value = themePrimaryColorMap[newTheme]
    }
    if (!isCodeBlockThemeCustom.value) {
      codeBlockTheme.value = themeCodeBlockThemeMap[newTheme]
    }
  }

  const setPrimaryColor = (newColor: string) => {
    primaryColor.value = newColor
    isPrimaryColorCustom.value = true
  }

  const useThemePrimaryColor = () => {
    primaryColor.value = themePrimaryColorMap[theme.value]
    isPrimaryColorCustom.value = false
  }

  const setCodeBlockTheme = (newTheme: string) => {
    codeBlockTheme.value = newTheme
    isCodeBlockThemeCustom.value = true
  }

  const useThemeCodeBlockTheme = () => {
    codeBlockTheme.value = themeCodeBlockThemeMap[theme.value]
    isCodeBlockThemeCustom.value = false
  }

  // 切换 highlight.js 代码主题
  const updateCodeTheme = () => {
    const cssUrl = codeBlockTheme.value
    const el = document.querySelector(`#hljs`)

    if (el) {
      el.setAttribute(`href`, cssUrl)
    }
    else {
      const link = document.createElement(`link`)
      link.setAttribute(`type`, `text/css`)
      link.setAttribute(`rel`, `stylesheet`)
      link.setAttribute(`href`, cssUrl)
      link.setAttribute(`id`, `hljs`)
      document.head.appendChild(link)
    }
  }

  /**
   * 应用当前主题配置（新主题系统）
   * 使用 CSS 注入而非内联样式
   */
  const applyCurrentTheme = async () => {
    try {
      const cssEditorStore = useCssEditorStore()
      const customCSS = cssEditorStore.getCurrentTabContent()

      await applyTheme({
        themeName: theme.value,
        themeComposition: normalizeThemeComposition(themeComposition.value),
        customCSS,
        variables: {
          primaryColor: primaryColor.value,
          fontFamily: fontFamily.value,
          fontSize: fontSize.value,
          isUseIndent: isUseIndent.value,
          isUseJustify: isUseJustify.value,
        },
      })
    }
    catch (error) {
      console.error(`[applyCurrentTheme] 主题应用失败:`, error)
    }
  }

  return {
    // State
    theme,
    fontFamily,
    fontSize,
    fontSizeNumber,
    primaryColor,
    isPrimaryColorCustom,
    codeBlockTheme,
    isCodeBlockThemeCustom,
    legend,
    isMacCodeBlock,
    isShowHeadingNumber,
    isShowLineNumber,
    isTextCodeBlockWrapped,
    isCiteStatus,
    isCountStatus,
    isUseIndent,
    isUseJustify,
    previewWidth,
    headingStyles,
    themeComposition,
    isThemeCompositionCustom,

    // Actions
    toggleMacCodeBlock,
    toggleShowHeadingNumber,
    toggleShowLineNumber,
    toggleTextCodeBlockWrapped,
    toggleCiteStatus,
    toggleCountStatus,
    toggleUseIndent,
    toggleUseJustify,
    resetStyle,
    setTheme,
    setPrimaryColor,
    useThemePrimaryColor,
    setCodeBlockTheme,
    useThemeCodeBlockTheme,
    updateCodeTheme,
    applyCurrentTheme,
    setHeadingStyle,
    getHeadingStyle,
    setThemeSlot,
    getThemeSlot,
    useThemeComposition,
    resetThemeComposition,
  }
})
