/**
 * CSS 主题导出
 * 将 CSS 文件作为字符串导出供 JavaScript 使用
 */

import apiSpecCSS from './api-spec.css?raw'
import architectureCSS from './architecture.css?raw'
import baseCSS from './base.css?raw'
import blueprintCSS from './blueprint.css?raw'
import briefingCSS from './briefing.css?raw'
import cardCSS from './card.css?raw'
import codeLabCSS from './code-lab.css?raw'
import defaultCSS from './default.css?raw'
import engineeringCSS from './engineering.css?raw'
import graceCSS from './grace.css?raw'
import magazineCSS from './magazine.css?raw'
import notebookCSS from './notebook.css?raw'
import researchCSS from './research.css?raw'
import runbookCSS from './runbook.css?raw'
import simpleCSS from './simple.css?raw'
import stepGuideCSS from './step-guide.css?raw'
import terminalCSS from './terminal.css?raw'

/**
 * 基础样式 CSS
 */
export const baseCSSContent = baseCSS

/**
 * CSS 主题映射表
 */
export const themeMap = {
  default: defaultCSS,
  grace: graceCSS,
  simple: simpleCSS,
  engineering: engineeringCSS,
  blueprint: blueprintCSS,
  terminal: terminalCSS,
  research: researchCSS,
  notebook: notebookCSS,
  magazine: magazineCSS,
  card: cardCSS,
  apiSpec: apiSpecCSS,
  stepGuide: stepGuideCSS,
  codeLab: codeLabCSS,
  runbook: runbookCSS,
  architecture: architectureCSS,
  briefing: briefingCSS,
} as const

export type ThemeName = keyof typeof themeMap
