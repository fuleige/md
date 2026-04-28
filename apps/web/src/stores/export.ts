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

export interface AvoidRange {
  start: number
  end: number
}

export interface SliceRange {
  start: number
  end: number
}

export type PagedImageExportQuality = `low` | `medium` | `high`
export type PagedImageExportProgressPhase = `rendering` | `zipping` | `done`

export interface PagedImageExportProgress {
  phase: PagedImageExportProgressPhase
  current: number
  total: number
  percent: number
}

export type PagedImageExportProgressHandler = (progress: PagedImageExportProgress) => void

export interface PagedImageExportDraft {
  canvas: HTMLCanvasElement
  imageUrl: string
  totalHeight: number
  width: number
  pageHeight: number
  maxSliceHeight: number
  avoidRanges: AvoidRange[]
  algorithmSlices: SliceRange[]
  slices: SliceRange[]
  safeTitle: string
}

interface PagedImageSnapshot {
  canvas: HTMLCanvasElement
  totalHeight: number
  width: number
  pageHeight: number
  maxSliceHeight: number
  avoidRanges: AvoidRange[]
  slices: SliceRange[]
  safeTitle: string
}

const EXPORT_READY_DELAY = 100
const MIN_PAGE_HEIGHT = 600
const MAX_PAGE_HEIGHT = 1400
export const PAGED_IMAGE_MIN_SLICE_HEIGHT = 120
const MIN_CONTENT_HEIGHT = 80
export const PAGED_IMAGE_EXPORT_PIXEL_RATIO = 3
const PAGED_IMAGE_EXPORT_MIME_TYPE = `image/jpeg`
const CANVAS_DIMENSION_LIMIT = 16384
const RANGE_PADDING = 2
const DEFAULT_PAGED_IMAGE_FILE_TITLE = `文章图片集`
export const DEFAULT_PAGED_IMAGE_EXPORT_QUALITY: PagedImageExportQuality = `high`
export const PAGED_IMAGE_QUALITY_OPTIONS: Array<{ value: PagedImageExportQuality, label: string }> = [
  { value: `low`, label: `低` },
  { value: `medium`, label: `中` },
  { value: `high`, label: `高` },
]
const PAGED_IMAGE_QUALITY_VALUES: Record<PagedImageExportQuality, number> = {
  low: 0.68,
  medium: 0.82,
  high: 0.95,
}
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

function calculateMaxSliceHeight(width: number) {
  return Math.min(MAX_PAGE_HEIGHT, Math.max(MIN_PAGE_HEIGHT, Math.round(width * 16 / 9)))
}

function findRangeAtPosition(ranges: AvoidRange[], position: number) {
  return ranges.find(range => range.start < position && range.end > position)
}

function resolveSliceEnd(start: number, totalHeight: number, targetSliceHeight: number, avoidRanges: AvoidRange[]) {
  const targetEnd = Math.min(start + targetSliceHeight, totalHeight)

  if (targetEnd >= totalHeight) {
    return totalHeight
  }

  const blockingRange = findRangeAtPosition(avoidRanges, targetEnd)
  if (!blockingRange) {
    return targetEnd
  }

  if (blockingRange.start > start) {
    return blockingRange.start
  }

  return targetEnd
}

function mergeTrailingSliceIfShort(slices: SliceRange[], maxSliceHeight: number) {
  if (slices.length < 2) {
    return slices
  }

  const last = slices[slices.length - 1]
  const previous = slices[slices.length - 2]
  const lastHeight = last.end - last.start
  const mergedHeight = last.end - previous.start

  if (lastHeight < MIN_CONTENT_HEIGHT && mergedHeight <= maxSliceHeight) {
    previous.end = last.end
    slices.pop()
  }

  return slices
}

function createSliceRanges(totalHeight: number, maxSliceHeight: number, avoidRanges: AvoidRange[]): SliceRange[] {
  const slices: SliceRange[] = []
  let start = 0

  while (start < totalHeight - 1) {
    let end = resolveSliceEnd(start, totalHeight, maxSliceHeight, avoidRanges)

    if (end <= start) {
      end = Math.min(start + maxSliceHeight, totalHeight)
    }

    slices.push({ start, end })
    start = end
  }

  return mergeTrailingSliceIfShort(slices, maxSliceHeight)
}

interface CanvasBlobOptions {
  type?: string
  quality?: number
}

interface CanvasBlobResult {
  blob: Blob
  extension: string
}

function getMimeTypeExtension(mimeType: string) {
  switch (mimeType) {
    case `image/jpeg`:
      return `jpg`
    case `image/png`:
    default:
      return `png`
  }
}

function getPagedImageBlobOptions(quality: PagedImageExportQuality): CanvasBlobOptions {
  return {
    type: PAGED_IMAGE_EXPORT_MIME_TYPE,
    quality: PAGED_IMAGE_QUALITY_VALUES[quality],
  }
}

function getPagedImageBackgroundColor(isDark: boolean) {
  return isDark ? `#0f172a` : `#fff`
}

function getPagedImageTitle(root: HTMLElement) {
  const contentRoot = root.querySelector<HTMLElement>(`#output`) ?? root
  const heading = contentRoot.querySelector<HTMLElement>(`h1`)
    ?? contentRoot.querySelector<HTMLElement>(`h2, h3, h4, h5, h6`)

  return heading?.textContent?.trim() || DEFAULT_PAGED_IMAGE_FILE_TITLE
}

function sanitizePagedImageFileTitle(title: string) {
  const MAX_FILENAME_LENGTH = 80
  const safe = title
    .normalize(`NFKC`)
    .replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}\uFE0F\u200D]/gu, ``)
    .replace(/[\\/:*?"<>|]/g, ` `)
    .replace(/\p{Cc}/gu, ` `)
    .replace(/[^\p{L}\p{N}\s_-]+/gu, ` `)
    .replace(/\s+/g, ` `)
    .trim()

  const clipped = Array.from(safe).slice(0, MAX_FILENAME_LENGTH).join(``).trim()
  return sanitizeTitle(clipped || DEFAULT_PAGED_IMAGE_FILE_TITLE)
}

function canvasToBlob(canvas: HTMLCanvasElement, options: CanvasBlobOptions = {}): Promise<CanvasBlobResult> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve({
          blob,
          extension: getMimeTypeExtension(blob.type || options.type || `image/png`),
        })
      }
      else {
        reject(new Error(`图片生成失败。`))
      }
    }, options.type ?? `image/png`, options.quality)
  })
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

function cloneSlices(slices: SliceRange[]) {
  return slices.map(slice => ({ ...slice }))
}

function createSliceRenderHost(
  source: HTMLElement,
  slice: SliceRange,
  width: number,
  totalHeight: number,
  backgroundColor: string,
) {
  const sliceHeight = Math.max(1, Math.round(slice.end - slice.start))
  const host = document.createElement(`div`)
  host.style.position = `absolute`
  host.style.left = `0`
  host.style.top = `0`
  host.style.width = `${width}px`
  host.style.height = `${sliceHeight}px`
  host.style.overflow = `hidden`
  host.style.background = backgroundColor
  host.style.pointerEvents = `none`
  host.style.zIndex = `-1`

  const content = source.cloneNode(true) as HTMLElement
  content.style.position = `relative`
  content.style.top = `-${Math.round(slice.start)}px`
  content.style.width = `${width}px`
  content.style.minHeight = `${Math.max(totalHeight, sliceHeight)}px`
  content.style.margin = `0`
  content.style.background = backgroundColor

  host.appendChild(content)
  document.body.appendChild(host)
  return host
}

function assertSliceExportSize(width: number, sliceHeight: number, index: number) {
  const canvasWidth = Math.ceil(width * PAGED_IMAGE_EXPORT_PIXEL_RATIO)
  const canvasHeight = Math.ceil(sliceHeight * PAGED_IMAGE_EXPORT_PIXEL_RATIO)
  if (canvasWidth > CANVAS_DIMENSION_LIMIT || canvasHeight > CANVAS_DIMENSION_LIMIT) {
    throw new Error(`第 ${index + 1} 张图片尺寸过大，浏览器无法按 3 倍导出 JPEG，请增加切分线后重试。`)
  }
}

async function renderSliceToBlob(
  source: HTMLElement,
  slice: SliceRange,
  totalHeight: number,
  width: number,
  backgroundColor: string,
  blobOptions: CanvasBlobOptions,
  index: number,
) {
  const sliceHeight = Math.max(1, Math.round(slice.end - slice.start))
  assertSliceExportSize(width, sliceHeight, index)

  const host = createSliceRenderHost(source, slice, width, totalHeight, backgroundColor)
  try {
    const canvas = await toCanvas(host, {
      backgroundColor,
      filter: shouldExportNode,
      skipFonts: true,
      pixelRatio: PAGED_IMAGE_EXPORT_PIXEL_RATIO,
      width,
      height: sliceHeight,
      canvasWidth: width,
      canvasHeight: sliceHeight,
      skipAutoScale: true,
      style: { margin: `0` },
    })

    return await canvasToBlob(canvas, blobOptions)
  }
  finally {
    host.remove()
  }
}

async function createPagedImageSnapshot(isDark: boolean): Promise<PagedImageSnapshot> {
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
    const maxSliceHeight = calculateMaxSliceHeight(updatedRect.width)
    const avoidRanges = collectAvoidRanges(el, totalHeight)
    const slices = createSliceRanges(totalHeight, maxSliceHeight, avoidRanges)

    const canvas = await toCanvas(el, {
      backgroundColor: getPagedImageBackgroundColor(isDark),
      filter: shouldExportNode,
      skipFonts: true,
      pixelRatio: PAGED_IMAGE_EXPORT_PIXEL_RATIO,
      style: { margin: `0` },
    })

    return {
      canvas,
      totalHeight,
      width: Math.ceil(updatedRect.width),
      pageHeight: maxSliceHeight,
      maxSliceHeight,
      avoidRanges,
      slices,
      safeTitle: sanitizePagedImageFileTitle(getPagedImageTitle(el)),
    }
  }
  finally {
    style.remove()
  }
}

async function downloadPagedImageSlicesZip(
  totalHeight: number,
  width: number,
  slices: SliceRange[],
  safeTitle: string,
  isDark: boolean,
  quality: PagedImageExportQuality = DEFAULT_PAGED_IMAGE_EXPORT_QUALITY,
  onProgress?: PagedImageExportProgressHandler,
) {
  const exportSlices = slices.filter(slice => slice.end > slice.start)
  if (exportSlices.length === 0) {
    throw new Error(`没有可导出的分页图片。`)
  }

  const source = getPreviewElement()
  if (!source) {
    throw new Error(`未找到预览区域，请刷新页面后重试。`)
  }

  const backgroundColor = getPagedImageBackgroundColor(isDark)
  const style = createCodeBlockExportStyle()
  document.head.appendChild(style)

  try {
    await waitForExportReady(source)

    const { default: JSZip } = await import(`jszip`)
    const zip = new JSZip()
    const fileNameLength = Math.max(2, String(exportSlices.length).length)
    const blobOptions = getPagedImageBlobOptions(quality)

    onProgress?.({
      phase: `rendering`,
      current: 0,
      total: exportSlices.length,
      percent: 0,
    })

    for (let i = 0; i < exportSlices.length; i++) {
      const { blob, extension } = await renderSliceToBlob(
        source,
        exportSlices[i],
        totalHeight,
        width,
        backgroundColor,
        blobOptions,
        i,
      )
      const index = String(i + 1).padStart(fileNameLength, `0`)
      zip.file(`${safeTitle}-${index}.${extension}`, blob)
      onProgress?.({
        phase: `rendering`,
        current: i + 1,
        total: exportSlices.length,
        percent: Math.round(((i + 1) / exportSlices.length) * 90),
      })
    }

    onProgress?.({
      phase: `zipping`,
      current: exportSlices.length,
      total: exportSlices.length,
      percent: 90,
    })

    const zipBlob = await zip.generateAsync({ type: `blob` }, (metadata) => {
      onProgress?.({
        phase: `zipping`,
        current: exportSlices.length,
        total: exportSlices.length,
        percent: Math.min(99, 90 + Math.round(metadata.percent / 10)),
      })
    })

    onProgress?.({
      phase: `done`,
      current: exportSlices.length,
      total: exportSlices.length,
      percent: 100,
    })

    downloadBlob(zipBlob, `${safeTitle}-images.zip`)
    return exportSlices.length
  }
  finally {
    style.remove()
  }
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

  // 分页导出渲染内容为多张图片，并打包为 ZIP
  const downloadAsPagedImagesZip = async () => {
    const currentPost = postStore.currentPost
    if (!currentPost) {
      throw new Error(`没有可导出的文章。`)
    }

    const snapshot = await createPagedImageSnapshot(uiStore.isDark)
    return await downloadPagedImageSlicesZip(
      snapshot.totalHeight,
      snapshot.width,
      snapshot.slices,
      snapshot.safeTitle,
      uiStore.isDark,
    )
  }

  const preparePagedImageExportDraft = async (): Promise<PagedImageExportDraft> => {
    const currentPost = postStore.currentPost
    if (!currentPost) {
      throw new Error(`没有可导出的文章。`)
    }

    const snapshot = await createPagedImageSnapshot(uiStore.isDark)
    const { blob: imageBlob } = await canvasToBlob(snapshot.canvas)

    return {
      ...snapshot,
      imageUrl: URL.createObjectURL(imageBlob),
      algorithmSlices: cloneSlices(snapshot.slices),
      slices: cloneSlices(snapshot.slices),
    }
  }

  const downloadPagedImagesZipFromDraft = async (
    draft: PagedImageExportDraft,
    slices: SliceRange[],
    quality: PagedImageExportQuality = DEFAULT_PAGED_IMAGE_EXPORT_QUALITY,
    onProgress?: PagedImageExportProgressHandler,
  ) => {
    return await downloadPagedImageSlicesZip(
      draft.totalHeight,
      draft.width,
      slices,
      draft.safeTitle,
      uiStore.isDark,
      quality,
      onProgress,
    )
  }

  const disposePagedImageExportDraft = (draft: PagedImageExportDraft | null) => {
    if (draft?.imageUrl) {
      URL.revokeObjectURL(draft.imageUrl)
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
    preparePagedImageExportDraft,
    downloadPagedImagesZipFromDraft,
    disposePagedImageExportDraft,
    exportEditorContent2PDF,
    exportEditorContent2MD,
  }
})
