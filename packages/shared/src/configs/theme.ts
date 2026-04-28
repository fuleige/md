import type { IConfigOption } from '../types'
import type { ThemeName } from './theme-css'

// 导出 CSS 主题（新主题系统）
export { baseCSSContent, themeMap, type ThemeName } from './theme-css'

export const themeOptionsMap = {
  default: {
    label: `现代出版`,
    value: `default`,
    desc: `通用精排`,
  },
  grace: {
    label: `柔和专栏`,
    value: `grace`,
    desc: `兼容旧主题`,
  },
  simple: {
    label: `极简白纸`,
    value: `simple`,
    desc: `长文阅读`,
  },
  engineering: {
    label: `工程蓝`,
    value: `engineering`,
    desc: `文档/规格`,
  },
  blueprint: {
    label: `技术蓝图`,
    value: `blueprint`,
    desc: `兼容旧主题`,
  },
  terminal: {
    label: `代码文档`,
    value: `terminal`,
    desc: `兼容旧主题`,
  },
  research: {
    label: `学术白皮书`,
    value: `research`,
    desc: `研究分析`,
  },
  notebook: {
    label: `研发笔记`,
    value: `notebook`,
    desc: `兼容旧主题`,
  },
  magazine: {
    label: `编辑部`,
    value: `magazine`,
    desc: `观点/专栏`,
  },
  card: {
    label: `知识卡`,
    value: `card`,
    desc: `清单总结`,
  },
  apiSpec: {
    label: `接口规格`,
    value: `apiSpec`,
    desc: `兼容旧主题`,
  },
  stepGuide: {
    label: `分步教程`,
    value: `stepGuide`,
    desc: `兼容旧主题`,
  },
  codeLab: {
    label: `代码实验室`,
    value: `codeLab`,
    desc: `兼容旧主题`,
  },
  runbook: {
    label: `运行手册`,
    value: `runbook`,
    desc: `兼容旧主题`,
  },
  architecture: {
    label: `架构评审`,
    value: `architecture`,
    desc: `兼容旧主题`,
  },
  briefing: {
    label: `简报演示`,
    value: `briefing`,
    desc: `观点表达`,
  },
}

export const themePrimaryColorMap: Record<ThemeName, string> = {
  default: `#2563EB`,
  grace: `#DB2777`,
  simple: `#111827`,
  engineering: `#2563EB`,
  blueprint: `#0B6BCB`,
  terminal: `#0F766E`,
  research: `#475569`,
  notebook: `#D97706`,
  magazine: `#DB2777`,
  card: `#7C3AED`,
  apiSpec: `#0969DA`,
  stepGuide: `#2563EB`,
  codeLab: `#16A34A`,
  runbook: `#0F766E`,
  architecture: `#175CD3`,
  briefing: `#EA580C`,
}

export const themeOptions: IConfigOption<ThemeName>[] = [
  {
    label: `现代出版`,
    value: `default`,
    desc: `通用精排`,
  },
  {
    label: `极简白纸`,
    value: `simple`,
    desc: `长文阅读`,
  },
  {
    label: `工程蓝`,
    value: `engineering`,
    desc: `文档/规格`,
  },
  {
    label: `学术白皮书`,
    value: `research`,
    desc: `研究分析`,
  },
  {
    label: `编辑部`,
    value: `magazine`,
    desc: `观点/专栏`,
  },
  {
    label: `知识卡`,
    value: `card`,
    desc: `清单总结`,
  },
  {
    label: `简报演示`,
    value: `briefing`,
    desc: `观点表达`,
  },
]
