/**
 * CSS 变量生成工具
 * 根据配置动态生成 CSS 变量样式
 */

import type { HeadingLevel, HeadingStyles, HeadingStyleType } from '@md/shared/configs'

export interface CSSVariableConfig {
  primaryColor: string
  fontFamily: string
  fontSize: string
  isUseIndent?: boolean
  isUseJustify?: boolean
  headingStyles?: HeadingStyles
}

/**
 * 生成 CSS 变量样式
 * @param config - 配置对象
 * @returns CSS 变量字符串
 */
export function generateCSSVariables(config: CSSVariableConfig): string {
  return `
:root {
  /* 动态配置变量 */
  --md-primary-color: ${config.primaryColor};
  --md-font-family: ${config.fontFamily};
  --md-font-size: ${config.fontSize};
}

/* 段落缩进和对齐 */
#output p {
  ${config.isUseIndent ? 'text-indent: 2em;' : ''}
  ${config.isUseJustify ? 'text-align: justify;' : ''}
}
  `.trim()
}

/**
 * 生成标题样式 CSS（单独导出，用于在主题 CSS 之后应用）
 */
export function generateHeadingStyles(config: CSSVariableConfig): string {
  return generateHeadingStylesCSS(config.headingStyles)
}

/**
 * 代码块兼容样式：让语法高亮主题负责代码块前景/背景色，
 * 避免文章主题里的行内 code 样式污染代码块。
 */
export function generateCodeBlockCompatibilityStyles(): string {
  return `
#output pre.code__pre > code,
#output .hljs.code__pre > code {
  display: -webkit-box;
  padding: 0.5em 1em 1em;
  overflow-x: auto;
  text-indent: 0;
  color: inherit;
  background: transparent;
  border: 0;
  border-radius: 0;
  box-shadow: none;
  white-space: nowrap;
  margin: 0;
}

#output pre.code__pre .line-numbers,
#output .hljs.code__pre .line-numbers {
  color: var(--md-code-line-number-color, rgba(148, 163, 184, 0.95));
  border-right-color: var(--md-code-line-number-border, rgba(148, 163, 184, 0.28)) !important;
  background: var(--md-code-line-number-bg, transparent) !important;
}
  `.trim()
}

/**
 * 固定扩展组件样式。
 * 这些控件不进入组合式主题槽位，避免用户组合时破坏交互或第三方 SVG 渲染。
 */
export function generateLockedComponentStyles(): string {
  return `
#output .mermaid-diagram,
#output .plantuml-diagram,
#output .infographic-diagram {
  max-width: 100%;
  overflow-x: auto;
  margin: 1.2em 8px;
  text-align: center;
}

#output .mermaid-diagram svg,
#output .plantuml-diagram svg,
#output .infographic-diagram svg {
  max-width: 100%;
  height: auto;
}

#output .markdown-toc {
  margin: 1.2em 8px;
}

#output .table-wrapper {
  max-width: 100%;
  margin: 1.2em 8px;
  overflow: auto;
  -webkit-overflow-scrolling: touch;
}

#output .table-wrapper table {
  margin: 0;
}
  `.trim()
}

/**
 * 生成标题样式 CSS
 */
function generateHeadingStylesCSS(headingStyles?: HeadingStyles): string {
  if (!headingStyles)
    return ``

  const levels: HeadingLevel[] = [`h1`, `h2`, `h3`, `h4`, `h5`, `h6`]
  const cssRules: string[] = []

  for (const level of levels) {
    const style = headingStyles[level]
    // 自定义样式由用户在 CSS 编辑器中直接编辑，这里只处理预设样式
    if (style && style !== `default` && style !== `custom`) {
      cssRules.push(generateHeadingCSS(level, style))
    }
  }

  return cssRules.join(`\n\n`)
}

/**
 * 生成单个标题级别的样式 CSS
 */
function generateHeadingCSS(level: HeadingLevel, style: HeadingStyleType): string {
  const baseStyles = `
  display: block;
  text-align: left;
  background: transparent;`

  switch (style) {
    case `color-only`:
      return `#output ${level} {
  color: var(--md-primary-color);
  background: transparent;
}`

    case `border-bottom`:
      return `#output ${level} {${baseStyles}
  padding-bottom: 0.3em;
  border-bottom: 2px solid var(--md-primary-color);
  color: var(--md-primary-color);
}`

    case `border-left`:
      return `#output ${level} {${baseStyles}
  margin-left: 0;
  padding-left: 10px;
  border-left: 4px solid var(--md-primary-color);
  color: var(--md-primary-color);
}`

    default:
      return ``
  }
}
