import { buildThemeMap } from '../theme-presets'
import baseCSS from './base.css?raw'

/**
 * 基础样式 CSS
 */
export const baseCSSContent = baseCSS

/**
 * CSS 主题映射表
 * 主题 CSS 由可组合 preset 生成，保留原主题名作为稳定对外接口。
 */
export const themeMap = buildThemeMap()

export type ThemeName = keyof typeof themeMap
