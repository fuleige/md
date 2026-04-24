/**
 * 主题应用工具
 * 负责将主题样式应用到页面
 */

import type { ThemeName } from '@md/shared/configs'
import type { CSSVariableConfig } from './cssVariables'
import { baseCSSContent, themeMap } from '@md/shared/configs'
import { processCSS } from './cssProcessor'
import { wrapCSSWithScope } from './cssScopeWrapper'
import { generateCodeBlockCompatibilityStyles, generateCSSVariables, generateHeadingStyles } from './cssVariables'
import { getThemeInjector } from './themeInjector'

export interface ThemeConfig {
  themeName: string // 主题名称
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

  // 2. 构建主题 CSS（模拟旧系统的合并行为）
  let themeCSS = themeMap.default // 默认主题作为基础

  // 3. 如果不是 default 主题，叠加主题特定样式
  if (config.themeName !== `default`) {
    const specificThemeCSS = themeMap[config.themeName as ThemeName]
    if (specificThemeCSS) {
      themeCSS = `${themeCSS}\n\n${specificThemeCSS}`
    }
  }

  // 4. 给主题 CSS 添加作用域（只影响 #output 预览区域）
  const scopedThemeCSS = wrapCSSWithScope(themeCSS, `#output`)

  // 5. 生成标题样式 CSS（在主题 CSS 之后应用，确保覆盖主题默认样式）
  const headingStylesCSS = generateHeadingStyles(config.variables)

  // 6. 生成代码块兼容 CSS（在主题 CSS 之后应用，避免行内 code 样式覆盖 highlight.js）
  const codeBlockCompatibilityCSS = generateCodeBlockCompatibilityStyles()

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
    scopedCustomCSS, // 用户自定义 CSS（最后应用，可覆盖预设样式）
  ].filter(Boolean).join(`\n\n`)

  // 9. 解析 CSS 变量（将 var(--xxx) 替换为实际值，供导出/复制内联样式使用）
  mergedCSS = processCSS(mergedCSS)

  // 10. 注入到页面
  const injector = getThemeInjector()
  injector.inject(mergedCSS)
}
