import type { IConfigOption } from '../types'
import type { ThemeName } from './theme-css'

// 导出 CSS 主题（新主题系统）
export { baseCSSContent, themeMap, type ThemeName } from './theme-css'

export const themeOptionsMap = {
  default: {
    label: `经典`,
    value: `default`,
    desc: ``,
  },
  grace: {
    label: `优雅`,
    value: `grace`,
    desc: `@brzhang`,
  },
  simple: {
    label: `简洁`,
    value: `simple`,
    desc: `@okooo5km`,
  },
  engineering: {
    label: `工程手册`,
    value: `engineering`,
    desc: `技术文档`,
  },
  blueprint: {
    label: `技术蓝图`,
    value: `blueprint`,
    desc: `架构设计`,
  },
  terminal: {
    label: `终端极客`,
    value: `terminal`,
    desc: `代码实战`,
  },
  research: {
    label: `论文白皮书`,
    value: `research`,
    desc: `算法分析`,
  },
  notebook: {
    label: `研发笔记`,
    value: `notebook`,
    desc: `步骤教程`,
  },
  magazine: {
    label: `技术专栏`,
    value: `magazine`,
    desc: `深度分享`,
  },
  card: {
    label: `知识卡片`,
    value: `card`,
    desc: `清单总结`,
  },
  apiSpec: {
    label: `接口规格`,
    value: `apiSpec`,
    desc: `API 文档`,
  },
  stepGuide: {
    label: `分步教程`,
    value: `stepGuide`,
    desc: `流程教学`,
  },
  codeLab: {
    label: `代码实验室`,
    value: `codeLab`,
    desc: `实战调试`,
  },
  runbook: {
    label: `运行手册`,
    value: `runbook`,
    desc: `运维排障`,
  },
  architecture: {
    label: `架构评审`,
    value: `architecture`,
    desc: `方案权衡`,
  },
  briefing: {
    label: `演讲简报`,
    value: `briefing`,
    desc: `观点表达`,
  },
}

export const themePrimaryColorMap: Record<ThemeName, string> = {
  default: `#0F4C81`,
  grace: `#92617E`,
  simple: `#333333`,
  engineering: `#2563EB`,
  blueprint: `#0B6BCB`,
  terminal: `#22C55E`,
  research: `#5B4B8A`,
  notebook: `#D97706`,
  magazine: `#C2410C`,
  card: `#7C3AED`,
  apiSpec: `#0969DA`,
  stepGuide: `#2563EB`,
  codeLab: `#16A34A`,
  runbook: `#0F766E`,
  architecture: `#175CD3`,
  briefing: `#7C3AED`,
}

export const themeOptions: IConfigOption<ThemeName>[] = [
  {
    label: `经典`,
    value: `default`,
    desc: ``,
  },
  {
    label: `优雅`,
    value: `grace`,
    desc: `@brzhang`,
  },
  {
    label: `简洁`,
    value: `simple`,
    desc: `@okooo5km`,
  },
  {
    label: `工程手册`,
    value: `engineering`,
    desc: `技术文档`,
  },
  {
    label: `技术蓝图`,
    value: `blueprint`,
    desc: `架构设计`,
  },
  {
    label: `终端极客`,
    value: `terminal`,
    desc: `代码实战`,
  },
  {
    label: `论文白皮书`,
    value: `research`,
    desc: `算法分析`,
  },
  {
    label: `研发笔记`,
    value: `notebook`,
    desc: `步骤教程`,
  },
  {
    label: `技术专栏`,
    value: `magazine`,
    desc: `深度分享`,
  },
  {
    label: `知识卡片`,
    value: `card`,
    desc: `清单总结`,
  },
  {
    label: `接口规格`,
    value: `apiSpec`,
    desc: `API 文档`,
  },
  {
    label: `分步教程`,
    value: `stepGuide`,
    desc: `流程教学`,
  },
  {
    label: `代码实验室`,
    value: `codeLab`,
    desc: `实战调试`,
  },
  {
    label: `运行手册`,
    value: `runbook`,
    desc: `运维排障`,
  },
  {
    label: `架构评审`,
    value: `architecture`,
    desc: `方案权衡`,
  },
  {
    label: `演讲简报`,
    value: `briefing`,
    desc: `观点表达`,
  },
]
