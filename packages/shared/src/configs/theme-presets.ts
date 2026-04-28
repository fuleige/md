import type { IConfigOption } from '../types'

export const THEME_COMPOSITION_VERSION = 1

export const themeSlots = [
  `h1`,
  `h2`,
  `h3`,
  `paragraph`,
  `blockquote`,
  `codeBlock`,
  `inlineCode`,
  `list`,
  `table`,
  `image`,
  `divider`,
  `emphasis`,
  `alert`,
  `katex`,
] as const

export type ThemeSlot = typeof themeSlots[number]

export interface StylePreset {
  id: string
  slot: ThemeSlot
  label: string
  desc: string
  css: string
  preview: string
}

export type ThemeSlotPresetMap = Record<ThemeSlot, string>

export interface ThemeComposition {
  version: typeof THEME_COMPOSITION_VERSION
  slots: ThemeSlotPresetMap
}

function preset(
  slot: ThemeSlot,
  id: string,
  label: string,
  desc: string,
  preview: string,
  css: string,
): StylePreset {
  return { id, slot, label, desc, preview, css: css.trim() }
}

export const themeSlotOptions: IConfigOption<ThemeSlot>[] = [
  { label: `一级标题`, value: `h1`, desc: `文章主标题` },
  { label: `二级标题`, value: `h2`, desc: `章节标题` },
  { label: `三级标题`, value: `h3`, desc: `小节标题` },
  { label: `正文段落`, value: `paragraph`, desc: `文本密度` },
  { label: `引用块`, value: `blockquote`, desc: `说明与引语` },
  { label: `代码块`, value: `codeBlock`, desc: `代码容器` },
  { label: `行内代码`, value: `inlineCode`, desc: `短代码` },
  { label: `列表`, value: `list`, desc: `项目组织` },
  { label: `表格`, value: `table`, desc: `结构数据` },
  { label: `图片`, value: `image`, desc: `图片呈现` },
  { label: `分割线`, value: `divider`, desc: `段落分隔` },
  { label: `强调文本`, value: `emphasis`, desc: `重点文字` },
  { label: `提示块`, value: `alert`, desc: `Alert/Callout` },
  { label: `公式`, value: `katex`, desc: `数学内容` },
]

export const stylePresetsBySlot: Record<ThemeSlot, StylePreset[]> = {
  h1: [
    preset(`h1`, `h1-cover-sheet`, `柔光题名`, `无符号主视觉标题`, `现代出版`, `
h1 {
  position: relative;
  display: block;
  padding: 0.88em 1em 0.92em;
  border: 0;
  border-radius: 14px;
  margin: 1.45em 8px 1.05em;
  color: #0f172a;
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.1) 0%, #ffffff 46%, rgba(219, 39, 119, 0.06) 100%);
  font-size: calc(var(--md-font-size) * 1.52);
  font-weight: 850;
  line-height: 1.24;
  text-align: left;
  box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.28), 0 10px 26px rgba(15, 23, 42, 0.06);
}
    `),
    preset(`h1`, `h1-classic-frame`, `经典横线`, `居中标题和主题色横线`, `一级标题`, `
h1 {
  display: table;
  padding: 0 1em 0.35em;
  border-bottom: 2px solid var(--md-primary-color);
  margin: 2em auto 1.15em;
  color: #111827;
  background: transparent;
  font-size: calc(var(--md-font-size) * 1.38);
  font-weight: 800;
  line-height: 1.35;
  text-align: center;
}
    `),
    preset(`h1`, `h1-editorial-rule`, `专栏大标题`, `左对齐粗底线`, `深度观点`, `
h1 {
  display: block;
  padding: 0.2em 0 0.65em;
  border-bottom: 4px solid #111827;
  margin: 1.45em 8px 1em;
  color: #111827;
  background: transparent;
  font-size: calc(var(--md-font-size) * 1.6);
  font-weight: 800;
  line-height: 1.25;
  text-align: left;
}
    `),
    preset(`h1`, `h1-left-rail`, `左轨标题`, `技术文档式左边框`, `技术方案`, `
h1 {
  display: block;
  padding: 0.68em 0.9em;
  border-left: 6px solid var(--md-primary-color);
  margin: 1.55em 8px 1em;
  color: #172033;
  background: #f3f7fb;
  font-size: calc(var(--md-font-size) * 1.45);
  font-weight: 800;
  line-height: 1.35;
  text-align: left;
}
    `),
    preset(`h1`, `h1-card`, `卡片标题`, `轻阴影白底卡片`, `知识卡片`, `
h1 {
  display: block;
  padding: 0.85em 1em;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  margin: 1.4em 8px 1em;
  color: #0f172a;
  background: #fff;
  font-size: calc(var(--md-font-size) * 1.34);
  font-weight: 800;
  line-height: 1.35;
  text-align: left;
  box-shadow: 0 4px 14px rgba(15, 23, 42, 0.06);
}
    `),
    preset(`h1`, `h1-terminal`, `终端标题`, `深色命令行风格`, `$ runbook`, `
h1 {
  display: block;
  padding: 0.8em 0.9em;
  border: 1px solid #24445c;
  border-left: 6px solid #22c55e;
  margin: 1.4em 8px 1em;
  color: #d7f3e3;
  background: #101a2d;
  font-size: calc(var(--md-font-size) * 1.34);
  font-weight: 800;
  line-height: 1.35;
  text-align: left;
}
    `),
    preset(`h1`, `h1-paper`, `论文标题`, `白皮书式细线标题`, `Research Note`, `
h1 {
  display: block;
  padding: 0 0 0.75em;
  border-bottom: 1px solid #111827;
  margin: 1.8em 8px 1.1em;
  color: #111827;
  background: transparent;
  font-size: calc(var(--md-font-size) * 1.5);
  font-weight: 800;
  line-height: 1.35;
  text-align: left;
}
    `),
  ],

  h2: [
    preset(`h2`, `h2-section-plate`, `圆角章节牌`, `柔和圆角章节容器`, `章节标题`, `
h2 {
  position: relative;
  display: block;
  padding: 0.68em 0.95em 0.7em 1em;
  border: 0;
  border-radius: 14px;
  margin: 2.35em 8px 1.05em;
  color: #111827;
  background: linear-gradient(90deg, rgba(37, 99, 235, 0.1) 0%, #ffffff 58%, #ffffff 100%);
  font-size: calc(var(--md-font-size) * 1.24);
  font-weight: 850;
  line-height: 1.36;
  text-align: left;
  box-shadow: inset 4px 0 0 var(--md-primary-color), inset 0 0 0 1px rgba(148, 163, 184, 0.32);
}
    `),
    preset(`h2`, `h2-solid-center`, `圆角色标`, `胶囊式居中标签`, `二级标题`, `
h2 {
  display: table;
  padding: 0.34em 0.92em;
  border: 0;
  border-radius: 999px;
  margin: 3em auto 1.4em;
  color: #fff;
  background: var(--md-primary-color);
  font-size: calc(var(--md-font-size) * 1.22);
  font-weight: 800;
  line-height: 1.35;
  text-align: center;
  box-shadow: 0 6px 16px rgba(15, 23, 42, 0.12);
}
    `),
    preset(`h2`, `h2-left-panel`, `左轨面板`, `浅底章节条`, `章节标题`, `
h2 {
  display: block;
  padding: 0.55em 0.8em;
  border-left: 5px solid var(--md-primary-color);
  margin: 2.5em 8px 1.1em;
  color: #14213d;
  background: #f2f6fb;
  font-size: calc(var(--md-font-size) * 1.22);
  font-weight: 800;
  line-height: 1.35;
  text-align: left;
}
    `),
    preset(`h2`, `h2-underline`, `短下划线`, `专栏式短横线`, `核心观点`, `
h2 {
  display: block;
  padding: 0.35em 0;
  border: 0;
  margin: 2.35em 8px 1em;
  color: #111827;
  background: transparent;
  font-size: calc(var(--md-font-size) * 1.28);
  font-weight: 800;
  line-height: 1.35;
  text-align: left;
}

h2::after {
  content: '';
  display: block;
  width: 42px;
  height: 3px;
  margin-top: 0.45em;
  background: var(--md-primary-color);
}
    `),
    preset(`h2`, `h2-card`, `章节卡片`, `白底圆角章节卡`, `模块标题`, `
h2 {
  display: block;
  padding: 0.65em 0.85em;
  border: 1px solid #e2e8f0;
  border-left: 5px solid var(--md-primary-color);
  border-radius: 6px;
  margin: 2em 8px 1em;
  color: #0f172a;
  background: #fff;
  font-size: calc(var(--md-font-size) * 1.17);
  font-weight: 800;
  line-height: 1.35;
  text-align: left;
}
    `),
    preset(`h2`, `h2-terminal`, `终端区块`, `深色边框章节`, `## deploy`, `
h2 {
  display: block;
  padding: 0.55em 0.8em;
  border: 1px solid #24445c;
  margin: 2em 8px 1em;
  color: #86efac;
  background: #111827;
  font-size: calc(var(--md-font-size) * 1.18);
  font-weight: 800;
  line-height: 1.35;
  text-align: left;
}
    `),
    preset(`h2`, `h2-paper`, `论文分节`, `细线分节标题`, `2. Method`, `
h2 {
  display: block;
  padding: 0 0 0.4em;
  border: 0;
  border-bottom: 1px solid #d1d5db;
  margin: 2.4em 8px 1em;
  color: #111827;
  background: transparent;
  font-size: calc(var(--md-font-size) * 1.24);
  font-weight: 800;
  line-height: 1.4;
  text-align: left;
}
    `),
  ],

  h3: [
    preset(`h3`, `h3-smart-label`, `眉题胶囊`, `柔和胶囊式小节标题`, `关键细节`, `
h3 {
  display: table;
  padding: 0.28em 0.76em;
  border: 0;
  border-radius: 999px;
  margin: 1.75em 8px 0.72em;
  color: var(--md-primary-color);
  background: linear-gradient(90deg, rgba(37, 99, 235, 0.1) 0%, rgba(37, 99, 235, 0.04) 100%);
  font-size: calc(var(--md-font-size) * 1.08);
  font-weight: 850;
  line-height: 1.42;
  box-shadow: inset 0 0 0 1px rgba(37, 99, 235, 0.12);
}
    `),
    preset(`h3`, `h3-left-rail`, `左边框`, `清晰的小节边线`, `三级标题`, `
h3 {
  padding-left: 8px;
  border-left: 3px solid var(--md-primary-color);
  margin: 2em 8px 0.75em 0;
  color: #111827;
  background: transparent;
  font-size: calc(var(--md-font-size) * 1.1);
  font-weight: 800;
  line-height: 1.35;
}
    `),
    preset(`h3`, `h3-bottom-line`, `底部分隔`, `小节标题下划线`, `小节说明`, `
h3 {
  padding: 0 0 0.35em;
  border-left: 0;
  border-bottom: 1px solid #d7dee8;
  margin: 2em 8px 0.8em;
  color: var(--md-primary-color);
  background: transparent;
  font-size: calc(var(--md-font-size) * 1.12);
  font-weight: 800;
  line-height: 1.45;
}
    `),
    preset(`h3`, `h3-accent-dot`, `圆点前缀`, `柔和标记符号`, `关键细节`, `
h3 {
  position: relative;
  padding-left: 1em;
  border: 0;
  margin: 1.85em 8px 0.75em;
  color: #1f2937;
  background: transparent;
  font-size: calc(var(--md-font-size) * 1.12);
  font-weight: 800;
  line-height: 1.45;
}

h3::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.62em;
  width: 0.42em;
  height: 0.42em;
  border-radius: 999px;
  background: var(--md-primary-color);
}
    `),
    preset(`h3`, `h3-soft-card`, `浅底小卡`, `适合卡片内容`, `小节标题`, `
h3 {
  padding: 0.45em 0.7em;
  border-left: 4px solid #94a3b8;
  border-radius: 4px;
  margin: 1.6em 8px 0.7em;
  color: #1e293b;
  background: #f1f5f9;
  font-size: calc(var(--md-font-size) * 1.08);
  font-weight: 800;
  line-height: 1.45;
}
    `),
    preset(`h3`, `h3-terminal`, `终端提示`, `深色左轨小节`, `> step`, `
h3 {
  padding-left: 0.8em;
  border-left: 4px solid #38bdf8;
  margin: 1.7em 8px 0.7em;
  color: #7dd3fc;
  background: transparent;
  font-size: calc(var(--md-font-size) * 1.08);
  font-weight: 800;
  line-height: 1.45;
}
    `),
    preset(`h3`, `h3-plain`, `朴素正文`, `轻量无装饰`, `三级标题`, `
h3 {
  padding-left: 0;
  border-left: 0;
  margin: 1.8em 8px 0.7em;
  color: #374151;
  background: transparent;
  font-size: calc(var(--md-font-size) * 1.1);
  font-weight: 800;
  line-height: 1.45;
}
    `),
  ],

  paragraph: [
    preset(`paragraph`, `paragraph-premium`, `现代正文`, `克制留白和高可读性`, `正文内容`, `
p {
  margin: 1.12em 8px;
  color: #243044;
  letter-spacing: 0;
  line-height: 1.88;
}
    `),
    preset(`paragraph`, `paragraph-classic`, `经典排版`, `略带字距的微信风格`, `正文内容`, `
p {
  margin: 1.45em 8px;
  color: #1f2937;
  letter-spacing: 0.06em;
  line-height: 1.82;
}
    `),
    preset(`paragraph`, `paragraph-clean`, `清爽紧凑`, `文档阅读密度`, `正文内容`, `
p {
  margin: 1.05em 8px;
  color: #243044;
  letter-spacing: 0;
  line-height: 1.85;
}
    `),
    preset(`paragraph`, `paragraph-literary`, `专栏舒展`, `更高行距和留白`, `正文内容`, `
p {
  margin: 1.15em 8px;
  color: #2f3747;
  letter-spacing: 0;
  line-height: 1.95;
}
    `),
    preset(`paragraph`, `paragraph-terminal`, `暗色正文`, `适配终端主题`, `log output`, `
section.container,
.md-container {
  padding: 0.1em 0;
  color: #cbd5e1;
  background: #0b1220;
}

p {
  margin: 1.05em 8px;
  color: #cbd5e1;
  letter-spacing: 0;
  line-height: 1.9;
}
    `),
  ],

  blockquote: [
    preset(`blockquote`, `blockquote-lifted`, `浮层提示`, `现代信息卡提示`, `提示说明`, `
blockquote {
  position: relative;
  padding: 1em 1.05em;
  border: 1px solid #e2e8f0;
  border-left: 5px solid var(--md-primary-color);
  border-radius: 8px;
  margin: 1.25em 8px;
  color: #334155;
  background: #ffffff;
  box-shadow: 0 8px 22px rgba(15, 23, 42, 0.06);
}

blockquote > p {
  margin: 0.28em 0;
  color: inherit;
  letter-spacing: 0;
}
    `),
    preset(`blockquote`, `blockquote-note`, `说明块`, `主题色左边框`, `提示说明`, `
blockquote {
  padding: 1em;
  border-left: 4px solid var(--md-primary-color);
  border-radius: 6px;
  margin: 1.2em 8px;
  color: #334155;
  background: #f8fafc;
}

blockquote > p {
  margin: 0.3em 0;
  color: inherit;
  letter-spacing: 0;
}
    `),
    preset(`blockquote`, `blockquote-minimal`, `简洁引用`, `无圆角灰色引用`, `引用内容`, `
blockquote {
  padding: 0.9em 1em;
  border-left: 3px solid #9ca3af;
  border-radius: 0;
  margin: 1.2em 8px;
  color: #374151;
  background: #f9fafb;
}

blockquote > p {
  margin: 0.25em 0;
  color: inherit;
  letter-spacing: 0;
}
    `),
    preset(`blockquote`, `blockquote-quote`, `专栏引语`, `厚左线灰底`, `“引语内容”`, `
blockquote {
  padding: 1.05em 1.1em;
  border: 0;
  border-left: 6px solid #111827;
  border-radius: 0;
  margin: 1.3em 8px;
  color: #111827;
  background: #f3f4f6;
}

blockquote > p {
  margin: 0.25em 0;
  color: inherit;
  letter-spacing: 0;
}
    `),
    preset(`blockquote`, `blockquote-terminal`, `终端提示`, `深色提示块`, `runtime note`, `
blockquote {
  padding: 1em;
  border-left: 4px solid #22c55e;
  border-radius: 4px;
  margin: 1.2em 8px;
  color: #d1fae5;
  background: #122033;
}

blockquote > p {
  margin: 0.25em 0;
  color: inherit;
  letter-spacing: 0;
}
    `),
  ],

  codeBlock: [
    preset(`codeBlock`, `codeBlock-modern`, `现代代码`, `编辑器式代码容器`, `const value = 1`, `
pre.code__pre,
.hljs.code__pre {
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  margin: 1.25em 8px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);
}

pre.code__pre > code,
.hljs.code__pre > code {
  font-family: Menlo, Monaco, Consolas, 'Courier New', monospace;
  font-size: 0.92em;
  line-height: 1.74;
}
    `),
    preset(`codeBlock`, `codeBlock-card`, `卡片代码`, `圆角边框容器`, `const ok = true`, `
pre.code__pre,
.hljs.code__pre {
  border: 1px solid #d7dee8;
  border-radius: 8px;
  margin: 1.2em 8px;
  box-shadow: 0 4px 14px rgba(15, 23, 42, 0.05);
}

pre.code__pre > code,
.hljs.code__pre > code {
  font-family: Menlo, Monaco, Consolas, 'Courier New', monospace;
  font-size: 0.92em;
  line-height: 1.72;
}
    `),
    preset(`codeBlock`, `codeBlock-minimal`, `极简代码`, `细边框无阴影`, `pnpm build`, `
pre.code__pre,
.hljs.code__pre {
  border: 1px solid #e5e7eb;
  border-radius: 3px;
  margin: 1.2em 8px;
  box-shadow: none;
}

pre.code__pre > code,
.hljs.code__pre > code {
  font-family: Menlo, Monaco, Consolas, 'Courier New', monospace;
  font-size: 0.92em;
  line-height: 1.75;
}
    `),
    preset(`codeBlock`, `codeBlock-soft`, `浅色实验室`, `柔和边框和背景`, `function demo()`, `
pre.code__pre,
.hljs.code__pre {
  border: 1px solid #dbeafe;
  border-radius: 6px;
  margin: 1.2em 8px;
  background: #f8fbff;
  box-shadow: none;
}

pre.code__pre > code,
.hljs.code__pre > code {
  font-family: Menlo, Monaco, Consolas, 'Courier New', monospace;
  font-size: 0.92em;
  line-height: 1.75;
}
    `),
    preset(`codeBlock`, `codeBlock-terminal`, `暗色终端`, `深色边框代码框`, `$ curl /api`, `
pre.code__pre,
.hljs.code__pre {
  border: 1px solid #334155;
  border-radius: 6px;
  margin: 1.2em 8px;
  box-shadow: none;
}

pre.code__pre > code,
.hljs.code__pre > code {
  font-family: Menlo, Monaco, Consolas, 'Courier New', monospace;
  font-size: 0.92em;
  line-height: 1.75;
}
    `),
  ],

  inlineCode: [
    preset(`inlineCode`, `inlineCode-soft`, `柔和标签`, `浅蓝行内代码`, `inline`, `
code {
  padding: 0.15em 0.36em;
  color: #0f4c81;
  background: #eaf2fb;
  border: 1px solid #d7e6f5;
  border-radius: 4px;
  font-family: Menlo, Monaco, Consolas, 'Courier New', monospace;
  font-size: 0.9em;
}
    `),
    preset(`inlineCode`, `inlineCode-minimal`, `极简标签`, `灰底细边框`, `inline`, `
code {
  padding: 0.12em 0.32em;
  color: #991b1b;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 3px;
  font-family: Menlo, Monaco, Consolas, 'Courier New', monospace;
  font-size: 0.9em;
}
    `),
    preset(`inlineCode`, `inlineCode-warm`, `暖色标签`, `适合教程重点`, `inline`, `
code {
  padding: 0.14em 0.34em;
  color: #b42318;
  background: #fff7ed;
  border: 1px solid #fed7aa;
  border-radius: 4px;
  font-family: Menlo, Monaco, Consolas, 'Courier New', monospace;
  font-size: 0.9em;
}
    `),
    preset(`inlineCode`, `inlineCode-terminal`, `终端标签`, `暗色行内代码`, `--flag`, `
code {
  padding: 0.13em 0.34em;
  color: #86efac;
  background: #111827;
  border: 1px solid #334155;
  border-radius: 4px;
  font-family: Menlo, Monaco, Consolas, 'Courier New', monospace;
  font-size: 0.9em;
}
    `),
  ],

  list: [
    preset(`list`, `list-clean`, `清单列表`, `标准缩进和间距`, `- item`, `
ol,
ul {
  padding-left: 1.45em;
  margin: 1em 8px;
}

li {
  margin: 0.45em 0;
  color: #243044;
  line-height: 1.78;
}
    `),
    preset(`list`, `list-dense`, `紧凑列表`, `适合规格说明`, `1. item`, `
ol,
ul {
  padding-left: 1.35em;
  margin: 0.8em 8px;
}

li {
  margin: 0.28em 0;
  color: #1f2937;
  line-height: 1.68;
}
    `),
    preset(`list`, `list-dot`, `专栏列表`, `更舒展的项目列表`, `• item`, `
ol,
ul {
  padding-left: 1.5em;
  margin: 1.1em 8px;
}

li {
  margin: 0.52em 0;
  color: #2f3747;
  line-height: 1.85;
}
    `),
    preset(`list`, `list-terminal`, `终端列表`, `深色正文列表`, `- log`, `
ol,
ul {
  padding-left: 1.45em;
  margin: 1em 8px;
  color: #cbd5e1;
}

li {
  margin: 0.42em 0;
  color: #cbd5e1;
  line-height: 1.78;
}
    `),
  ],

  table: [
    preset(`table`, `table-modern`, `现代数据表`, `清晰层次和斑马纹`, `A | B`, `
table {
  width: auto;
  border-collapse: separate;
  border-spacing: 0;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  color: #243044;
  font-size: 0.95em;
}

th {
  color: #111827;
  background: #eef4ff;
  font-weight: 800;
}

th,
td {
  border: 0;
  border-bottom: 1px solid #e2e8f0;
  padding: 0.62em 0.82em;
}

tbody tr:nth-child(even) {
  background: #f8fafc;
}
    `),
    preset(`table`, `table-classic`, `经典表格`, `边框清晰`, `A | B`, `
table {
  width: auto;
  border-collapse: collapse;
  margin: 1.2em 8px;
  color: #243044;
  font-size: 0.95em;
}

th {
  color: #111827;
  background: #edf2f7;
  font-weight: 700;
}

th,
td {
  border: 1px solid #d7dee8;
  padding: 0.55em 0.75em;
}
    `),
    preset(`table`, `table-minimal`, `极简表格`, `细线白底`, `A | B`, `
table {
  width: auto;
  border-collapse: collapse;
  margin: 1.3em 8px;
  color: #1f2937;
  font-size: 0.95em;
}

th {
  color: #111827;
  background: #f9fafb;
  font-weight: 700;
}

th,
td {
  border: 1px solid #e5e7eb;
  padding: 0.56em 0.78em;
}
    `),
    preset(`table`, `table-soft`, `圆角表格`, `浅底卡片表格`, `A | B`, `
table {
  width: auto;
  border-collapse: separate;
  border-spacing: 0;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  margin: 1.2em 8px;
  color: #334155;
  font-size: 0.95em;
}

th {
  color: #0f172a;
  background: #f1f5f9;
  font-weight: 700;
}

th,
td {
  border: 0;
  border-bottom: 1px solid #e2e8f0;
  padding: 0.58em 0.8em;
}
    `),
    preset(`table`, `table-terminal`, `终端表格`, `深色网格`, `KEY | VAL`, `
table {
  width: auto;
  border-collapse: collapse;
  margin: 1.2em 8px;
  color: #cbd5e1;
  font-size: 0.95em;
}

th {
  color: #d7f3e3;
  background: #132033;
  font-weight: 700;
}

th,
td {
  border: 1px solid #334155;
  padding: 0.55em 0.8em;
  color: #cbd5e1;
}
    `),
  ],

  image: [
    preset(`image`, `image-gallery`, `画廊图片`, `精致边框和留白`, `image`, `
img {
  max-width: 100%;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 10px 26px rgba(15, 23, 42, 0.1);
}

figcaption,
.md-figcaption {
  margin-top: 0.65em;
  color: #64748b;
  letter-spacing: 0;
  text-align: center;
}
    `),
    preset(`image`, `image-rounded`, `圆角图片`, `轻圆角无边框`, `image`, `
img {
  max-width: 100%;
  border-radius: 8px;
}

figcaption,
.md-figcaption {
  margin-top: 0.55em;
  color: #64748b;
  letter-spacing: 0;
  text-align: center;
}
    `),
    preset(`image`, `image-simple`, `简洁图片`, `无装饰图片`, `image`, `
img {
  max-width: 100%;
  border-radius: 0;
  box-shadow: none;
}

figcaption,
.md-figcaption {
  margin-top: 0.5em;
  color: #6b7280;
  letter-spacing: 0;
  text-align: center;
}
    `),
    preset(`image`, `image-polaroid`, `相纸图片`, `白底轻阴影`, `image`, `
img {
  max-width: 100%;
  border: 8px solid #fff;
  border-radius: 3px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.12);
}

figcaption,
.md-figcaption {
  margin-top: 0.65em;
  color: #6b7280;
  letter-spacing: 0;
  text-align: center;
}
    `),
    preset(`image`, `image-bordered`, `边框图片`, `技术文档边框`, `image`, `
img {
  max-width: 100%;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  box-shadow: none;
}

figcaption,
.md-figcaption {
  margin-top: 0.55em;
  color: #64748b;
  letter-spacing: 0;
  text-align: center;
}
    `),
  ],

  divider: [
    preset(`divider`, `divider-short`, `渐隐分割`, `轻量渐隐分隔线`, `---`, `
hr {
  height: 1px;
  border: 0;
  margin: 2.15em 8px;
  background: linear-gradient(90deg, transparent 0%, rgba(148, 163, 184, 0.42) 18%, rgba(148, 163, 184, 0.42) 82%, transparent 100%);
}
    `),
    preset(`divider`, `divider-hairline`, `细分割线`, `全宽浅色细线`, `---`, `
hr {
  height: 1px;
  border: 0;
  margin: 2em 8px;
  background: #e5e7eb;
}
    `),
    preset(`divider`, `divider-dashed`, `虚线分割`, `适合步骤内容`, `- - -`, `
hr {
  border: 0;
  border-top: 1px dashed #cbd5e1;
  margin: 2em 8px;
  background: transparent;
}
    `),
    preset(`divider`, `divider-terminal`, `终端细线`, `深色细线`, `-----`, `
hr {
  height: 1px;
  border: 0;
  margin: 2em 8px;
  background: #334155;
}
    `),
  ],

  emphasis: [
    preset(`emphasis`, `emphasis-modern`, `现代重点`, `低调高亮和清晰链接`, `重点`, `
strong {
  color: #111827;
  font-weight: 850;
  background: linear-gradient(to top, rgba(96, 165, 250, 0.22) 42%, transparent 42%);
}

em {
  color: var(--md-primary-color);
  font-style: normal;
  font-weight: 600;
}

a {
  color: var(--md-primary-color);
  font-weight: 650;
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 3px;
}

.markup-highlight {
  color: #111827;
  background: #dbeafe;
}

.markup-underline {
  border-bottom: 2px solid var(--md-primary-color);
}

.markup-wavyline {
  text-decoration: underline wavy #ef4444;
  text-underline-offset: 4px;
}
    `),
    preset(`emphasis`, `emphasis-marker`, `荧光重点`, `strong 带底色`, `重点`, `
strong {
  color: #111827;
  font-weight: 800;
  background: linear-gradient(to top, rgba(250, 204, 21, 0.35) 45%, transparent 45%);
}

em {
  color: var(--md-primary-color);
  font-style: normal;
}

a {
  color: var(--md-primary-color);
  border-bottom: 1px solid rgba(15, 76, 129, 0.28);
  text-decoration: none;
}

.markup-highlight {
  color: #111827;
  background: #fde68a;
}

.markup-underline {
  border-bottom: 2px solid var(--md-primary-color);
}

.markup-wavyline {
  text-decoration: underline wavy #ef4444;
  text-underline-offset: 4px;
}
    `),
    preset(`emphasis`, `emphasis-bold`, `纯文字强调`, `无底色高对比`, `重点`, `
strong {
  color: #101828;
  font-weight: 800;
}

em {
  color: #4b5563;
}

a {
  color: var(--md-primary-color);
  text-decoration: underline;
  text-underline-offset: 3px;
}

.markup-highlight {
  color: #111827;
  background: #fef3c7;
}

.markup-underline {
  border-bottom: 1px solid #111827;
}

.markup-wavyline {
  text-decoration: underline wavy #6b7280;
  text-underline-offset: 4px;
}
    `),
    preset(`emphasis`, `emphasis-elegant`, `优雅强调`, `柔和主题色强调`, `重点`, `
strong {
  color: #111827;
  font-weight: 800;
}

em {
  color: var(--md-primary-color);
}

a {
  color: var(--md-primary-color);
  font-weight: 600;
  text-decoration: none;
}

.markup-highlight {
  color: #111827;
  background: #fce7f3;
}

.markup-underline {
  border-bottom: 2px solid rgba(146, 97, 126, 0.55);
}

.markup-wavyline {
  text-decoration: underline wavy var(--md-primary-color);
  text-underline-offset: 4px;
}
    `),
    preset(`emphasis`, `emphasis-terminal`, `终端强调`, `适配深色正文`, `IMPORTANT`, `
strong {
  color: #f8fafc;
  font-weight: 800;
}

em {
  color: #a7f3d0;
}

a {
  color: #67e8f9;
  border-bottom: 1px solid rgba(103, 232, 249, 0.45);
  text-decoration: none;
}

.markup-highlight {
  color: #f8fafc;
  background: #365314;
}

.markup-underline {
  border-bottom: 2px solid #22c55e;
}

.markup-wavyline {
  text-decoration: underline wavy #f59e0b;
  text-underline-offset: 4px;
}
    `),
  ],

  alert: [
    preset(`alert`, `alert-color`, `彩色提示`, `保留类型颜色`, `NOTE`, `
.markdown-alert {
  border-radius: 6px;
}

.markdown-alert-title,
.alert-title-note,
.alert-title-tip,
.alert-title-info,
.alert-title-important,
.alert-title-warning,
.alert-title-caution,
.alert-title-abstract,
.alert-title-summary,
.alert-title-tldr,
.alert-title-todo,
.alert-title-success,
.alert-title-done,
.alert-title-question,
.alert-title-help,
.alert-title-faq,
.alert-title-failure,
.alert-title-fail,
.alert-title-missing,
.alert-title-danger,
.alert-title-error,
.alert-title-bug,
.alert-title-example,
.alert-title-quote,
.alert-title-cite {
  display: flex;
  align-items: center;
  gap: 0.5em;
  margin-bottom: 0.5em;
  font-weight: 800;
}

.alert-title-note,
.alert-icon-note,
.alert-title-info,
.alert-icon-info,
.alert-title-todo,
.alert-icon-todo {
  color: #478be6;
  fill: #478be6;
}

.alert-title-tip,
.alert-icon-tip,
.alert-title-success,
.alert-icon-success,
.alert-title-done,
.alert-icon-done {
  color: #57ab5a;
  fill: #57ab5a;
}

.alert-title-important,
.alert-icon-important,
.alert-title-example,
.alert-icon-example {
  color: #986ee2;
  fill: #986ee2;
}

.alert-title-warning,
.alert-icon-warning,
.alert-title-question,
.alert-icon-question,
.alert-title-help,
.alert-icon-help,
.alert-title-faq,
.alert-icon-faq {
  color: #c69026;
  fill: #c69026;
}

.alert-title-caution,
.alert-icon-caution,
.alert-title-failure,
.alert-icon-failure,
.alert-title-fail,
.alert-icon-fail,
.alert-title-missing,
.alert-icon-missing,
.alert-title-danger,
.alert-icon-danger,
.alert-title-error,
.alert-icon-error,
.alert-title-bug,
.alert-icon-bug {
  color: #e5534b;
  fill: #e5534b;
}

.alert-title-abstract,
.alert-icon-abstract,
.alert-title-summary,
.alert-icon-summary,
.alert-title-tldr,
.alert-icon-tldr {
  color: #00bfff;
  fill: #00bfff;
}

.alert-title-quote,
.alert-icon-quote,
.alert-title-cite,
.alert-icon-cite {
  color: #9ca3af;
  fill: #9ca3af;
}
    `),
    preset(`alert`, `alert-minimal`, `极简提示`, `单色提示块`, `NOTE`, `
.markdown-alert {
  border-left-color: #9ca3af;
  background: #f9fafb;
}

.markdown-alert-title,
[class^='alert-title-'],
[class*=' alert-title-'] {
  display: flex;
  align-items: center;
  gap: 0.5em;
  margin-bottom: 0.5em;
  color: #374151;
  font-weight: 800;
}

[class^='alert-icon-'],
[class*=' alert-icon-'] {
  fill: #6b7280;
}
    `),
    preset(`alert`, `alert-pastel`, `柔和彩色`, `浅色背景提示`, `TIP`, `
.markdown-alert {
  border-left-color: var(--md-primary-color);
  background: #f8fafc;
  box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.18);
}

.markdown-alert-title,
[class^='alert-title-'],
[class*=' alert-title-'] {
  display: flex;
  align-items: center;
  gap: 0.5em;
  margin-bottom: 0.5em;
  color: var(--md-primary-color);
  font-weight: 800;
}

[class^='alert-icon-'],
[class*=' alert-icon-'] {
  fill: var(--md-primary-color);
}
    `),
    preset(`alert`, `alert-terminal`, `终端提示`, `深色提示类型`, `WARN`, `
.markdown-alert {
  border-left-color: #22c55e;
  color: #d1fae5;
  background: #122033;
}

.markdown-alert-title,
[class^='alert-title-'],
[class*=' alert-title-'] {
  display: flex;
  align-items: center;
  gap: 0.5em;
  margin-bottom: 0.5em;
  color: #86efac;
  font-weight: 800;
}

[class^='alert-icon-'],
[class*=' alert-icon-'] {
  fill: #86efac;
}
    `),
  ],

  katex: [
    preset(`katex`, `katex-paper`, `论文公式`, `浅底细边框`, `E = mc²`, `
.katex-block {
  padding: 0.85em 1em;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  margin: 1.2em 8px;
  background: #f8fafc;
}

.katex-inline {
  color: #111827;
}
    `),
    preset(`katex`, `katex-minimal`, `极简公式`, `无边框公式`, `f(x)`, `
.katex-block {
  padding: 0.5em 0;
  border: 0;
  margin: 1.2em 8px;
  background: transparent;
}

.katex-inline {
  color: inherit;
}
    `),
    preset(`katex`, `katex-accent`, `强调公式`, `主题色左边框`, `Σ`, `
.katex-block {
  padding: 0.85em 1em;
  border: 0;
  border-left: 4px solid var(--md-primary-color);
  margin: 1.2em 8px;
  background: #f9fafb;
}

.katex-inline {
  color: var(--md-primary-color);
}
    `),
    preset(`katex`, `katex-terminal`, `终端公式`, `深色公式块`, `λ`, `
.katex-block {
  padding: 0.85em 1em;
  border: 1px solid #334155;
  border-radius: 4px;
  margin: 1.2em 8px;
  color: #d1fae5;
  background: #0f172a;
}

.katex-inline {
  color: #a7f3d0;
}
    `),
  ],
}

export const stylePresetMap: Record<string, StylePreset> = Object.fromEntries(
  Object.values(stylePresetsBySlot).flat().map(item => [item.id, item]),
)

const hiddenStylePresetIds = new Set([
  `h1-classic-frame`,
  `h1-terminal`,
  `h2-solid-center`,
  `h2-underline`,
  `h2-terminal`,
  `h3-accent-dot`,
  `h3-soft-card`,
  `h3-terminal`,
  `paragraph-classic`,
  `paragraph-terminal`,
  `blockquote-terminal`,
  `codeBlock-terminal`,
  `inlineCode-terminal`,
  `list-terminal`,
  `table-classic`,
  `table-terminal`,
  `image-polaroid`,
  `divider-dashed`,
  `divider-terminal`,
  `emphasis-marker`,
  `emphasis-terminal`,
  `alert-terminal`,
  `katex-terminal`,
])

export const visibleStylePresetsBySlot: Record<ThemeSlot, StylePreset[]> = Object.fromEntries(
  themeSlots.map(slot => [
    slot,
    stylePresetsBySlot[slot].filter(item => !hiddenStylePresetIds.has(item.id)),
  ]),
) as Record<ThemeSlot, StylePreset[]>

export const stylePresetOptionsBySlot: Record<ThemeSlot, IConfigOption[]> = Object.fromEntries(
  themeSlots.map(slot => [
    slot,
    visibleStylePresetsBySlot[slot].map(({ label, id, desc }) => ({ label, value: id, desc })),
  ]),
) as Record<ThemeSlot, IConfigOption[]>

const defaultThemeSlots: ThemeSlotPresetMap = {
  h1: `h1-cover-sheet`,
  h2: `h2-section-plate`,
  h3: `h3-smart-label`,
  paragraph: `paragraph-premium`,
  blockquote: `blockquote-lifted`,
  codeBlock: `codeBlock-modern`,
  inlineCode: `inlineCode-soft`,
  list: `list-clean`,
  table: `table-modern`,
  image: `image-gallery`,
  divider: `divider-short`,
  emphasis: `emphasis-modern`,
  alert: `alert-pastel`,
  katex: `katex-paper`,
}

function createComposition(overrides: Partial<ThemeSlotPresetMap> = {}): ThemeComposition {
  return {
    version: THEME_COMPOSITION_VERSION,
    slots: {
      ...defaultThemeSlots,
      ...overrides,
    },
  }
}

export const defaultThemeComposition = createComposition()

export const themeCompositions = {
  default: defaultThemeComposition,
  grace: createComposition({
    h1: `h1-cover-sheet`,
    h2: `h2-section-plate`,
    h3: `h3-smart-label`,
    paragraph: `paragraph-literary`,
    blockquote: `blockquote-lifted`,
    codeBlock: `codeBlock-modern`,
    inlineCode: `inlineCode-soft`,
    list: `list-dot`,
    table: `table-modern`,
    image: `image-gallery`,
    divider: `divider-short`,
    emphasis: `emphasis-modern`,
    alert: `alert-pastel`,
  }),
  simple: createComposition({
    h1: `h1-paper`,
    h2: `h2-paper`,
    h3: `h3-plain`,
    paragraph: `paragraph-clean`,
    blockquote: `blockquote-minimal`,
    codeBlock: `codeBlock-minimal`,
    inlineCode: `inlineCode-minimal`,
    list: `list-dense`,
    table: `table-minimal`,
    image: `image-simple`,
    divider: `divider-hairline`,
    emphasis: `emphasis-bold`,
    alert: `alert-minimal`,
    katex: `katex-minimal`,
  }),
  engineering: createComposition({
    h1: `h1-left-rail`,
    h2: `h2-section-plate`,
    h3: `h3-bottom-line`,
    paragraph: `paragraph-clean`,
    blockquote: `blockquote-lifted`,
    codeBlock: `codeBlock-modern`,
    inlineCode: `inlineCode-minimal`,
    list: `list-dense`,
    table: `table-modern`,
    image: `image-bordered`,
    divider: `divider-hairline`,
    emphasis: `emphasis-bold`,
    alert: `alert-minimal`,
  }),
  blueprint: createComposition({
    h1: `h1-left-rail`,
    h2: `h2-section-plate`,
    h3: `h3-bottom-line`,
    paragraph: `paragraph-clean`,
    blockquote: `blockquote-lifted`,
    codeBlock: `codeBlock-modern`,
    inlineCode: `inlineCode-soft`,
    list: `list-clean`,
    table: `table-modern`,
    image: `image-bordered`,
    divider: `divider-hairline`,
    emphasis: `emphasis-modern`,
    alert: `alert-pastel`,
  }),
  terminal: createComposition({
    h1: `h1-left-rail`,
    h2: `h2-left-panel`,
    h3: `h3-bottom-line`,
    paragraph: `paragraph-clean`,
    blockquote: `blockquote-note`,
    codeBlock: `codeBlock-modern`,
    inlineCode: `inlineCode-soft`,
    list: `list-dense`,
    table: `table-modern`,
    image: `image-bordered`,
    divider: `divider-hairline`,
    emphasis: `emphasis-bold`,
    alert: `alert-color`,
    katex: `katex-accent`,
  }),
  research: createComposition({
    h1: `h1-paper`,
    h2: `h2-paper`,
    h3: `h3-plain`,
    paragraph: `paragraph-literary`,
    blockquote: `blockquote-minimal`,
    codeBlock: `codeBlock-minimal`,
    inlineCode: `inlineCode-minimal`,
    list: `list-dense`,
    table: `table-minimal`,
    image: `image-simple`,
    divider: `divider-hairline`,
    emphasis: `emphasis-bold`,
    alert: `alert-minimal`,
    katex: `katex-paper`,
  }),
  notebook: createComposition({
    h1: `h1-card`,
    h2: `h2-card`,
    h3: `h3-smart-label`,
    paragraph: `paragraph-premium`,
    blockquote: `blockquote-lifted`,
    codeBlock: `codeBlock-modern`,
    inlineCode: `inlineCode-warm`,
    list: `list-clean`,
    table: `table-modern`,
    image: `image-gallery`,
    divider: `divider-short`,
    emphasis: `emphasis-modern`,
    alert: `alert-pastel`,
    katex: `katex-accent`,
  }),
  magazine: createComposition({
    h1: `h1-cover-sheet`,
    h2: `h2-section-plate`,
    h3: `h3-smart-label`,
    paragraph: `paragraph-literary`,
    blockquote: `blockquote-lifted`,
    codeBlock: `codeBlock-modern`,
    inlineCode: `inlineCode-warm`,
    list: `list-dot`,
    table: `table-modern`,
    image: `image-gallery`,
    divider: `divider-short`,
    emphasis: `emphasis-modern`,
    alert: `alert-pastel`,
    katex: `katex-accent`,
  }),
  card: createComposition({
    h1: `h1-card`,
    h2: `h2-card`,
    h3: `h3-smart-label`,
    paragraph: `paragraph-clean`,
    blockquote: `blockquote-lifted`,
    codeBlock: `codeBlock-modern`,
    inlineCode: `inlineCode-soft`,
    list: `list-clean`,
    table: `table-modern`,
    image: `image-gallery`,
    divider: `divider-short`,
    emphasis: `emphasis-modern`,
    alert: `alert-pastel`,
    katex: `katex-paper`,
  }),
  apiSpec: createComposition({
    h1: `h1-left-rail`,
    h2: `h2-section-plate`,
    h3: `h3-bottom-line`,
    paragraph: `paragraph-clean`,
    blockquote: `blockquote-lifted`,
    codeBlock: `codeBlock-modern`,
    inlineCode: `inlineCode-soft`,
    list: `list-dense`,
    table: `table-modern`,
    image: `image-bordered`,
    divider: `divider-hairline`,
    emphasis: `emphasis-bold`,
    alert: `alert-minimal`,
  }),
  stepGuide: createComposition({
    h1: `h1-card`,
    h2: `h2-card`,
    h3: `h3-smart-label`,
    paragraph: `paragraph-premium`,
    blockquote: `blockquote-lifted`,
    codeBlock: `codeBlock-modern`,
    inlineCode: `inlineCode-warm`,
    list: `list-clean`,
    table: `table-modern`,
    image: `image-gallery`,
    divider: `divider-short`,
    emphasis: `emphasis-modern`,
    alert: `alert-pastel`,
    katex: `katex-accent`,
  }),
  codeLab: createComposition({
    h1: `h1-left-rail`,
    h2: `h2-left-panel`,
    h3: `h3-bottom-line`,
    paragraph: `paragraph-clean`,
    blockquote: `blockquote-note`,
    codeBlock: `codeBlock-modern`,
    inlineCode: `inlineCode-soft`,
    list: `list-clean`,
    table: `table-modern`,
    image: `image-bordered`,
    divider: `divider-hairline`,
    emphasis: `emphasis-bold`,
    alert: `alert-color`,
    katex: `katex-accent`,
  }),
  runbook: createComposition({
    h1: `h1-left-rail`,
    h2: `h2-left-panel`,
    h3: `h3-bottom-line`,
    paragraph: `paragraph-clean`,
    blockquote: `blockquote-note`,
    codeBlock: `codeBlock-modern`,
    inlineCode: `inlineCode-warm`,
    list: `list-dense`,
    table: `table-modern`,
    image: `image-bordered`,
    divider: `divider-hairline`,
    emphasis: `emphasis-bold`,
    alert: `alert-color`,
  }),
  architecture: createComposition({
    h1: `h1-cover-sheet`,
    h2: `h2-section-plate`,
    h3: `h3-bottom-line`,
    paragraph: `paragraph-clean`,
    blockquote: `blockquote-lifted`,
    codeBlock: `codeBlock-modern`,
    inlineCode: `inlineCode-soft`,
    list: `list-clean`,
    table: `table-modern`,
    image: `image-bordered`,
    divider: `divider-short`,
    emphasis: `emphasis-modern`,
    alert: `alert-pastel`,
    katex: `katex-paper`,
  }),
  briefing: createComposition({
    h1: `h1-cover-sheet`,
    h2: `h2-section-plate`,
    h3: `h3-smart-label`,
    paragraph: `paragraph-premium`,
    blockquote: `blockquote-lifted`,
    codeBlock: `codeBlock-modern`,
    inlineCode: `inlineCode-soft`,
    list: `list-dot`,
    table: `table-modern`,
    image: `image-gallery`,
    divider: `divider-short`,
    emphasis: `emphasis-modern`,
    alert: `alert-pastel`,
    katex: `katex-accent`,
  }),
} as const

export type CompositionThemeName = keyof typeof themeCompositions

export function normalizeThemeComposition(composition?: Partial<ThemeComposition> | null): ThemeComposition {
  const slots = {} as ThemeSlotPresetMap
  const inputSlots = (composition?.slots ?? {}) as Partial<ThemeSlotPresetMap>

  for (const slot of themeSlots) {
    const candidate = inputSlots[slot]
    slots[slot] = candidate && stylePresetMap[candidate]?.slot === slot && !hiddenStylePresetIds.has(candidate)
      ? candidate
      : defaultThemeSlots[slot]
  }

  return {
    version: THEME_COMPOSITION_VERSION,
    slots,
  }
}

export function getThemeComposition(themeName: CompositionThemeName): ThemeComposition {
  return normalizeThemeComposition(themeCompositions[themeName])
}

const compositionBaseCSS = `
section.container,
.md-container {
  padding: 0.1em 0;
  background: transparent;
}

h4,
h5,
h6 {
  margin: 1.4em 8px 0.6em;
  color: #1f2937;
  background: transparent;
  font-size: var(--md-font-size);
  font-weight: 800;
  line-height: 1.45;
}

figure {
  margin: 1.2em 8px;
}
`.trim()

export function generateThemeCompositionCSS(composition?: Partial<ThemeComposition> | null): string {
  const normalized = normalizeThemeComposition(composition)
  const css = themeSlots.map((slot) => {
    const presetId = normalized.slots[slot]
    const item = stylePresetMap[presetId]
    return `/* ${slot}: ${item.label} */\n${item.css}`
  })

  return [
    `/* Theme composition v${THEME_COMPOSITION_VERSION} */`,
    compositionBaseCSS,
    ...css,
  ].join(`\n\n`)
}

export function generateThemeCSS(themeName: CompositionThemeName): string {
  return generateThemeCompositionCSS(themeCompositions[themeName])
}

export function buildThemeMap(): Record<CompositionThemeName, string> {
  return Object.fromEntries(
    Object.keys(themeCompositions).map(themeName => [
      themeName,
      generateThemeCSS(themeName as CompositionThemeName),
    ]),
  ) as Record<CompositionThemeName, string>
}
