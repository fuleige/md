# 微信 Markdown 编辑器

面向技术内容创作者的 Markdown 排版工具，可将文章即时渲染为适合微信公众号、知识社区和图片平台发布的图文内容。

## 核心能力

- Markdown 实时预览，支持标题、表格、列表、引用、任务列表等常用写作语法。
- 技术内容友好，支持代码高亮、数学公式、Mermaid 图表、PlantUML 和 GFM 警告块。
- 多主题排版，提供面向技术文章的多种主题、布局和代码配色，并支持主题色切换。
- 内容管理，支持本地草稿保存、文件导入、Markdown/HTML/PDF/PNG 导出。
- AI 辅助，集成 DeepSeek、OpenAI、通义千问、腾讯混元、火山方舟、302.AI 等模型。

## 导出能力

- 一键复制渲染结果到微信公众号编辑器。
- 导出 Markdown、HTML、纯 HTML、PDF 和单张 PNG 图片。
- 分页 PNG 图片导出：将渲染后的文章按顺序切分为多张图片并打包为 ZIP，适合只能上传图片的平台。
- 可视化分页编辑：在预览图中点击新增切分线，拖动调整位置，选中后可删除或用方向键微调；系统会按建议最大高度预切分，并对过高或过低的分页给出提示。

## 本地开发

```sh
pnpm i
pnpm web dev
```

默认访问：

```text
http://localhost:5173/md/
```

## 构建部署

```sh
# 部署在 /md 目录
pnpm web build

# 部署在根目录
pnpm web build:h5-netlify
```

也可以使用 Docker 快速运行：

```sh
docker run -d -p 8080:80 doocs/md:latest
```

访问：

```text
http://localhost:8080
```
