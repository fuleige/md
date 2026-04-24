import { toCanvas, toPng } from 'html-to-image'
import {
  downloadFile,
  downloadMD,
  exportHTML,
  exportPDF,
  exportPureHTML,
  getHtmlContent,
  sanitizeTitle,
} from '@/utils'
import { usePostStore } from './post'
import { useRenderStore } from './render'
import { useUIStore } from './ui'

interface AvoidRange {
  start: number
  end: number
}

interface SliceRange {
  start: number
  end: number
}

const EXPORT_READY_DELAY = 100
const MIN_PAGE_HEIGHT = 600
const MAX_PAGE_HEIGHT = 1400
const MIN_SLICE_HEIGHT = 120
const MIN_CONTENT_HEIGHT = 80
const IMAGE_EXPORT_PIXEL_RATIO = 2
const MAX_PAGE_OVERSHOOT_RATIO = 1.3
const RANGE_PADDING = 2
const BLOCK_AVOID_SELECTOR = [
  `h1`,
  `h2`,
  `h3`,
  `h4`,
  `h5`,
  `h6`,
  `p`,
  `li`,
  `blockquote`,
  `pre`,
  `figure`,
  `img`,
  `svg`,
  `canvas`,
  `hr`,
  `details`,
  `.table-wrapper`,
  `.mermaid-diagram`,
  `.infographic-diagram`,
  `.plantuml-diagram`,
  `.katex-display`,
].join(`,`)

function delay(ms: number) {
  return new Promise(resolve => window.setTimeout(resolve, ms))
}

function createCodeBlockExportStyle() {
  const style = document.createElement(`style`)
  style.textContent = `
    .preview pre.code__pre,
    .preview .hljs.code__pre,
    .preview pre.code__pre > code,
    .preview .hljs.code__pre > code,
    .preview .code-scroll,
    .preview pre section,
    .preview code section {
      overflow: visible !important;
    }
    .preview pre.code__pre > code,
    .preview .code-scroll,
    .preview .code-scroll > div {
      white-space: pre-wrap !important;
      word-break: break-all !important;
      min-width: auto !important;
    }
  `
  return style
}

function getPreviewElement() {
  return document.querySelector<HTMLElement>(`#output-wrapper>.preview`)
}

function shouldExportNode(node: HTMLElement) {
  if (!(node instanceof Element)) {
    return true
  }

  return !node.matches(`.loading-mask, .loading-mask *`)
}

async function waitForPreviewImages(root: HTMLElement) {
  const images = Array.from(root.querySelectorAll(`img`))
  await Promise.all(images.map(async (image) => {
    if (image.complete && image.naturalWidth > 0)
      return

    try {
      await image.decode()
    }
    catch {
      await new Promise<void>((resolve) => {
        image.addEventListener(`load`, () => resolve(), { once: true })
        image.addEventListener(`error`, () => resolve(), { once: true })
      })
    }
  }))
}

async function waitForDocumentFonts() {
  try {
    await document.fonts?.ready
  }
  catch {
    // 字体加载失败不阻断导出，后续截图仍使用浏览器回退字体。
  }
}

function waitForNextFrame() {
  return new Promise<void>(resolve => window.requestAnimationFrame(() => resolve()))
}

async function waitForExportReady(root: HTMLElement) {
  await waitForPreviewImages(root)
  await waitForDocumentFonts()
  await delay(EXPORT_READY_DELAY)
  await waitForNextFrame()
}

function getMeasuredHeight(element: HTMLElement) {
  return Math.ceil(Math.max(element.getBoundingClientRect().height, element.scrollHeight))
}

function mergeRanges(ranges: AvoidRange[]) {
  return ranges.reduce<AvoidRange[]>((merged, range) => {
    const previous = merged[merged.length - 1]
    if (previous && range.start <= previous.end) {
      previous.end = Math.max(previous.end, range.end)
    }
    else {
      merged.push({ ...range })
    }
    return merged
  }, [])
}

function collectAvoidRanges(root: HTMLElement, totalHeight: number): AvoidRange[] {
  const rootRect = root.getBoundingClientRect()
  const contentRoot = root.querySelector<HTMLElement>(`#output`) ?? root
  const elements = Array.from(
    contentRoot.querySelectorAll<HTMLElement>(BLOCK_AVOID_SELECTOR),
  )

  const ranges = elements
    .filter((element) => {
      if (element.closest(`pre, code`) && !element.matches(`pre`)) {
        return false
      }
      const rect = element.getBoundingClientRect()
      return rect.width > 0 && rect.height > 8
    })
    .map((element) => {
      const rect = element.getBoundingClientRect()
      return {
        start: Math.max(0, Math.floor(rect.top - rootRect.top) - RANGE_PADDING),
        end: Math.min(totalHeight, Math.ceil(rect.bottom - rootRect.top) + RANGE_PADDING),
      }
    })
    .filter(range => range.end - range.start > 8)
    .sort((a, b) => a.start - b.start)

  return mergeRanges(ranges)
}

function calculatePageHeight(width: number) {
  return Math.min(MAX_PAGE_HEIGHT, Math.max(MIN_PAGE_HEIGHT, Math.round(width * 16 / 9)))
}

function findRangeAtPosition(ranges: AvoidRange[], position: number) {
  return ranges.find(range => range.start < position && range.end > position)
}

function resolveSliceEnd(start: number, totalHeight: number, pageHeight: number, avoidRanges: AvoidRange[]) {
  let end = Math.min(start + pageHeight, totalHeight)

  if (end >= totalHeight) {
    return totalHeight
  }

  const maxComfortableEnd = Math.min(totalHeight, start + Math.round(pageHeight * MAX_PAGE_OVERSHOOT_RATIO))

  for (let i = 0; i <= avoidRanges.length; i++) {
    const blockingRange = findRangeAtPosition(avoidRanges, end)
    if (!blockingRange) {
      break
    }

    const safeHeightBeforeRange = blockingRange.start - start
    const canKeepRangeInCurrentSlice = blockingRange.end <= maxComfortableEnd || safeHeightBeforeRange < MIN_SLICE_HEIGHT
    end = canKeepRangeInCurrentSlice
      ? Math.min(blockingRange.end, totalHeight)
      : Math.max(blockingRange.start, start)

    if (end >= totalHeight) {
      return totalHeight
    }
  }

  if (totalHeight - end < MIN_CONTENT_HEIGHT) {
    return totalHeight
  }

  if (end <= start) {
    const currentRange = avoidRanges.find(range => range.start <= start && range.end > start)
    return currentRange ? Math.min(currentRange.end, totalHeight) : Math.min(start + pageHeight, totalHeight)
  }

  return end
}

function createSliceRanges(totalHeight: number, pageHeight: number, avoidRanges: AvoidRange[]): SliceRange[] {
  const slices: SliceRange[] = []
  let start = 0

  while (start < totalHeight - 1) {
    const end = resolveSliceEnd(start, totalHeight, pageHeight, avoidRanges)

    slices.push({ start, end })
    start = end
  }

  return slices
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob)
      }
      else {
        reject(new Error(`图片生成失败。`))
      }
    }, `image/png`)
  })
}

async function cropCanvasToBlob(canvas: HTMLCanvasElement, slice: SliceRange, scaleY: number) {
  const sourceY = Math.round(slice.start * scaleY)
  const sourceHeight = Math.max(1, Math.round((slice.end - slice.start) * scaleY))
  const pageCanvas = document.createElement(`canvas`)
  pageCanvas.width = canvas.width
  pageCanvas.height = Math.max(1, Math.min(sourceHeight, canvas.height - sourceY))

  const ctx = pageCanvas.getContext(`2d`)
  if (!ctx) {
    throw new Error(`当前浏览器不支持 Canvas 导出。`)
  }

  ctx.drawImage(
    canvas,
    0,
    sourceY,
    canvas.width,
    pageCanvas.height,
    0,
    0,
    canvas.width,
    pageCanvas.height,
  )

  return await canvasToBlob(pageCanvas)
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement(`a`)
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * 导出功能 Store
 * 负责处理各种导出功能：HTML、PDF、MD、图片等
 */
export const useExportStore = defineStore(`export`, () => {
  const postStore = usePostStore()
  const renderStore = useRenderStore()
  const uiStore = useUIStore()

  // 将编辑器内容转换为 HTML
  const editorContent2HTML = () => {
    const temp = getHtmlContent()
    document.querySelector(`#output`)!.innerHTML = renderStore.output
    return temp
  }

  // 导出编辑器内容为 HTML，并且下载到本地
  const exportEditorContent2HTML = async () => {
    const currentPost = postStore.currentPost
    if (!currentPost)
      return

    await exportHTML(currentPost.title)
    document.querySelector(`#output`)!.innerHTML = renderStore.output
  }

  // 导出编辑器内容为无样式 HTML
  const exportEditorContent2PureHTML = (content: string) => {
    const currentPost = postStore.currentPost
    if (!currentPost)
      return

    exportPureHTML(content, currentPost.title)
  }

  // 下载卡片图片
  const downloadAsCardImage = async () => {
    const currentPost = postStore.currentPost
    if (!currentPost)
      return

    const el = document.querySelector<HTMLElement>(`#output-wrapper>.preview`)
    if (!el)
      return

    const style = createCodeBlockExportStyle()
    document.head.appendChild(style)

    try {
      await waitForExportReady(el)
      const url = await toPng(el, {
        backgroundColor: uiStore.isDark ? `` : `#fff`,
        filter: shouldExportNode,
        skipFonts: true,
        pixelRatio: Math.max(window.devicePixelRatio || 1, 2),
        style: { margin: `0` },
      })
      downloadFile(url, `${sanitizeTitle(currentPost.title)}.png`, `image/png`)
    }
    finally {
      style.remove()
    }
  }

  // 分页导出渲染内容为多张 PNG，并打包为 ZIP
  const downloadAsPagedImagesZip = async () => {
    const currentPost = postStore.currentPost
    if (!currentPost) {
      throw new Error(`没有可导出的文章。`)
    }

    const el = getPreviewElement()
    if (!el) {
      throw new Error(`未找到预览区域，请刷新页面后重试。`)
    }

    const rect = el.getBoundingClientRect()
    if (rect.width <= 0 || rect.height <= 0) {
      throw new Error(`预览区域不可见，请切换到预览或分屏模式后再导出。`)
    }

    const style = createCodeBlockExportStyle()
    document.head.appendChild(style)

    try {
      await waitForExportReady(el)

      const updatedRect = el.getBoundingClientRect()
      const totalHeight = getMeasuredHeight(el)
      const pageHeight = calculatePageHeight(updatedRect.width)
      const avoidRanges = collectAvoidRanges(el, totalHeight)
      const slices = createSliceRanges(totalHeight, pageHeight, avoidRanges)

      const canvas = await toCanvas(el, {
        backgroundColor: uiStore.isDark ? `` : `#fff`,
        filter: shouldExportNode,
        skipFonts: true,
        pixelRatio: Math.max(window.devicePixelRatio || 1, IMAGE_EXPORT_PIXEL_RATIO),
        style: { margin: `0` },
      })

      const scaleY = canvas.height / totalHeight
      const { default: JSZip } = await import(`jszip`)
      const zip = new JSZip()
      const safeTitle = sanitizeTitle(currentPost.title)
      const fileNameLength = Math.max(2, String(slices.length).length)

      for (let i = 0; i < slices.length; i++) {
        const blob = await cropCanvasToBlob(canvas, slices[i], scaleY)
        const index = String(i + 1).padStart(fileNameLength, `0`)
        zip.file(`${safeTitle}-${index}.png`, blob)
      }

      const zipBlob = await zip.generateAsync({ type: `blob` })
      downloadBlob(zipBlob, `${safeTitle}-images.zip`)
      return slices.length
    }
    finally {
      style.remove()
    }
  }

  // 导出编辑器内容为 PDF
  const exportEditorContent2PDF = async () => {
    const currentPost = postStore.currentPost
    if (!currentPost)
      return

    await exportPDF(currentPost.title)
    document.querySelector(`#output`)!.innerHTML = renderStore.output
  }

  // 导出编辑器内容到本地（Markdown）
  const exportEditorContent2MD = (content: string) => {
    const currentPost = postStore.currentPost
    if (!currentPost)
      return

    downloadMD(content, currentPost.title)
  }

  return {
    editorContent2HTML,
    exportEditorContent2HTML,
    exportEditorContent2PureHTML,
    downloadAsCardImage,
    downloadAsPagedImagesZip,
    exportEditorContent2PDF,
    exportEditorContent2MD,
  }
})
