/**
 * 主题应用工具
 * 负责将主题样式应用到页面
 */

import type { ThemeComposition, ThemeName } from '@md/shared/configs'
import type { CSSVariableConfig } from './cssVariables'
import { baseCSSContent, generateThemeCompositionCSS, themeMap } from '@md/shared/configs'
import { processCSS } from './cssProcessor'
import { wrapCSSWithScope } from './cssScopeWrapper'
import { generateCodeBlockCompatibilityStyles, generateCSSVariables, generateHeadingStyles, generateLockedComponentStyles } from './cssVariables'
import { getThemeInjector } from './themeInjector'

export interface ThemeConfig {
  themeName: string // 主题名称
  themeComposition?: ThemeComposition // 当前组合式主题配置
  customCSS?: string // 用户自定义 CSS
  variables: CSSVariableConfig
}

/**
 * 应用主题
 * @param config - 主题配置
 */
export async function applyTheme(config: ThemeConfig): Promise<void> {
  // 1. 生成 CSS 变量
  const variablesCSS = generateCSSVariables(config.variables)

  // 2. 构建主题 CSS。新主题系统中每个主题本身就是一组完整 preset 组合。
  const themeCSS = config.themeComposition
    ? generateThemeCompositionCSS(config.themeComposition)
    : themeMap[config.themeName as ThemeName] || themeMap.default

  // 3. 给主题 CSS 添加作用域（只影响 #output 预览区域）
  const scopedThemeCSS = wrapCSSWithScope(themeCSS, `#output`)

  // 4. 生成标题样式 CSS（兼容旧 headingStyles，组合式主题正常不会传入）
  const headingStylesCSS = generateHeadingStyles(config.variables)

  // 5. 生成代码块兼容 CSS（在主题 CSS 之后应用，避免行内 code 样式覆盖 highlight.js）
  const codeBlockCompatibilityCSS = generateCodeBlockCompatibilityStyles()

  // 6. 生成固定扩展组件样式（不暴露为组合槽位）
  const lockedComponentCSS = generateLockedComponentStyles()

  // 7. 处理用户自定义 CSS（添加作用域）
  const scopedCustomCSS = config.customCSS
    ? wrapCSSWithScope(config.customCSS, `#output`)
    : ``

  // 8. 拼接完整 CSS（用户自定义 CSS 在最后，优先级最高）
  let mergedCSS = [
    variablesCSS, // CSS 变量（全局）
    baseCSSContent, // 基础样式（全局）
    scopedThemeCSS, // 主题样式（限制在 #output）
    headingStylesCSS, // 标题样式
    codeBlockCompatibilityCSS, // 代码块兼容样式
    lockedComponentCSS, // 固定扩展组件样式
    scopedCustomCSS, // 用户自定义 CSS（最后应用，可覆盖预设样式）
  ].filter(Boolean).join(`\n\n`)

  // 9. 解析 CSS 变量（将 var(--xxx) 替换为实际值，供导出/复制内联样式使用）
  mergedCSS = processCSS(mergedCSS)

  // 10. 注入到页面
  const injector = getThemeInjector()
  injector.inject(mergedCSS)
}
