<script setup lang="ts">
import type {
  PagedImageExportDraft,
  PagedImageExportProgress,
  PagedImageExportQuality,
  SliceRange,
} from '@/stores/export'
import { Download, Loader2, RotateCcw } from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import { computed, nextTick, onBeforeUnmount, ref, shallowRef, watch } from 'vue'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DEFAULT_PAGED_IMAGE_EXPORT_QUALITY,
  PAGED_IMAGE_MIN_SLICE_HEIGHT,
  PAGED_IMAGE_QUALITY_OPTIONS,
  useExportStore,
} from '@/stores/export'
import { useUIStore } from '@/stores/ui'
import { toast } from '@/utils/toast'

const uiStore = useUIStore()
const exportStore = useExportStore()
const { isShowPagedImageExportDialog } = storeToRefs(uiStore)

const draft = shallowRef<PagedImageExportDraft | null>(null)
const boundaries = ref<number[]>([])
const activeBoundaryIndex = ref<number | null>(null)
const draggingBoundaryIndex = ref<number | null>(null)
const isPreparing = ref(false)
const isExporting = ref(false)
const errorMessage = ref(``)
const previewStackRef = ref<HTMLElement | null>(null)
const hoverInsertPosition = ref<number | null>(null)
const hoverBoundaryIndex = ref<number | null>(null)
const imageQuality = ref<PagedImageExportQuality>(DEFAULT_PAGED_IMAGE_EXPORT_QUALITY)
const exportProgress = ref<PagedImageExportProgress | null>(null)

let prepareRequestId = 0
let dragStartClientY = 0
let dragStartBoundaryPosition = 0
let hasDraggedBoundary = false
let suppressNextBoundaryClick = false

const slices = computed<SliceRange[]>(() => {
  const current = draft.value
  if (!current) {
    return []
  }

  const points = [0, ...boundaries.value, current.totalHeight]
  return points.slice(0, -1).map((start, index) => ({
    start,
    end: points[index + 1],
  }))
})

const pageCount = computed(() => slices.value.length)
const selectedBoundary = computed(() => {
  const index = activeBoundaryIndex.value
  return index === null ? null : boundaries.value[index] ?? null
})
const maxSliceHeight = computed(() => {
  const current = draft.value
  return current?.maxSliceHeight ?? current?.pageHeight ?? 0
})
const oversizedSliceCount = computed(() => {
  const limit = maxSliceHeight.value
  if (limit <= 0) {
    return 0
  }

  return slices.value.filter(slice => isSliceOversized(slice)).length
})
const undersizedSliceCount = computed(() => {
  return slices.value.filter(slice => isSliceUndersized(slice)).length
})
const exportProgressPercent = computed(() => exportProgress.value?.percent ?? 0)
const exportProgressLabel = computed(() => {
  const progress = exportProgress.value
  if (!progress) {
    return ``
  }

  if (progress.phase === `zipping`) {
    return `正在打包 ZIP`
  }

  if (progress.phase === `done`) {
    return `导出完成`
  }

  return progress.total > 0
    ? `正在裁剪压缩 ${progress.current}/${progress.total}`
    : `正在准备导出`
})

function slicesToBoundaries(sliceRanges: SliceRange[], totalHeight: number) {
  return sliceRanges
    .map(slice => Math.round(slice.end))
    .filter(position => position > 0 && position < totalHeight)
    .sort((a, b) => a - b)
}

function getBoundaryPercent(position: number) {
  const current = draft.value
  if (!current || current.totalHeight <= 0) {
    return `0%`
  }

  return `${(position / current.totalHeight) * 100}%`
}

function getPositionPercent(position: number | null) {
  return position === null ? `0%` : getBoundaryPercent(position)
}

function getSliceStyle(slice: SliceRange, index: number) {
  const current = draft.value
  if (!current || current.totalHeight <= 0) {
    return {}
  }

  return {
    top: `${(slice.start / current.totalHeight) * 100}%`,
    height: `${((slice.end - slice.start) / current.totalHeight) * 100}%`,
    backgroundColor: index % 2 === 0 ? `rgb(14 165 233 / 0.04)` : `rgb(16 185 129 / 0.04)`,
  }
}

function formatPx(value: number) {
  return `${Math.round(value)} px`
}

function isSliceOversized(slice: SliceRange) {
  const limit = maxSliceHeight.value
  return limit > 0 && slice.end - slice.start > limit
}

function isSliceUndersized(slice: SliceRange) {
  return slice.end - slice.start < PAGED_IMAGE_MIN_SLICE_HEIGHT
}

function isBoundaryHovered(index: number) {
  return hoverBoundaryIndex.value === index && activeBoundaryIndex.value !== index
}

function getBoundaryButtonClass(index: number) {
  if (activeBoundaryIndex.value === index) {
    return `text-primary`
  }

  if (isBoundaryHovered(index)) {
    return `text-primary/80`
  }

  return `text-sky-600 dark:text-sky-400`
}

function getBoundaryLineClass(index: number) {
  if (activeBoundaryIndex.value === index) {
    return `h-1 bg-primary shadow-sm`
  }

  if (isBoundaryHovered(index)) {
    return `h-1 bg-primary/70`
  }

  return `h-0.5 bg-sky-500`
}

function getBoundaryLabelClass(index: number) {
  if (activeBoundaryIndex.value === index) {
    return `border-primary text-primary`
  }

  if (isBoundaryHovered(index)) {
    return `border-primary/70 text-primary`
  }

  return `border-border`
}

function getQualityButtonVariant(quality: PagedImageExportQuality) {
  return imageQuality.value === quality ? `default` : `outline`
}

function updateExportProgress(progress: PagedImageExportProgress) {
  exportProgress.value = { ...progress }
}

function getContentY(event: Pick<MouseEvent | PointerEvent, 'clientY'>) {
  const current = draft.value
  const stack = previewStackRef.value
  if (!current || !stack) {
    return null
  }

  const rect = stack.getBoundingClientRect()
  if (rect.height <= 0) {
    return null
  }

  const displayY = event.clientY - rect.top
  return Math.round((displayY / rect.height) * current.totalHeight)
}

function getContentPixelsPerDisplayPixel() {
  const current = draft.value
  const stack = previewStackRef.value
  if (!current || !stack) {
    return null
  }

  const rect = stack.getBoundingClientRect()
  if (rect.height <= 0) {
    return null
  }

  return current.totalHeight / rect.height
}

function moveBoundary(index: number, nextPosition: number) {
  const current = draft.value
  if (!current) {
    return
  }

  const nextBoundaries = [...boundaries.value]
  const prev = index === 0 ? 0 : nextBoundaries[index - 1]
  const next = index === nextBoundaries.length - 1 ? current.totalHeight : nextBoundaries[index + 1]

  nextBoundaries[index] = Math.min(next - 1, Math.max(prev + 1, Math.round(nextPosition)))
  boundaries.value = nextBoundaries
}

function stopBoundaryDrag() {
  if (draggingBoundaryIndex.value === null) {
    return
  }

  window.removeEventListener(`pointermove`, handleBoundaryDrag)
  window.removeEventListener(`pointerup`, stopBoundaryDrag)
  window.removeEventListener(`pointercancel`, stopBoundaryDrag)
  draggingBoundaryIndex.value = null
  suppressNextBoundaryClick = hasDraggedBoundary
  window.setTimeout(() => {
    suppressNextBoundaryClick = false
  })
}

function handleBoundaryDrag(event: PointerEvent) {
  const index = draggingBoundaryIndex.value
  const scale = getContentPixelsPerDisplayPixel()
  if (index === null || scale === null) {
    return
  }

  const delta = Math.round((event.clientY - dragStartClientY) * scale)
  if (delta !== 0) {
    hasDraggedBoundary = true
  }

  moveBoundary(index, dragStartBoundaryPosition + delta)
}

function startBoundaryDrag(index: number, event: PointerEvent) {
  event.stopPropagation()
  stopBoundaryDrag()
  dragStartClientY = event.clientY
  dragStartBoundaryPosition = boundaries.value[index] ?? 0
  hasDraggedBoundary = false
  draggingBoundaryIndex.value = index
  if (event.currentTarget instanceof HTMLElement) {
    event.currentTarget.setPointerCapture(event.pointerId)
  }
  window.addEventListener(`pointermove`, handleBoundaryDrag)
  window.addEventListener(`pointerup`, stopBoundaryDrag)
  window.addEventListener(`pointercancel`, stopBoundaryDrag)
}

function handleBoundaryHitAreaPointerMove(event: PointerEvent) {
  clearHoverInsertPosition()
  if (draggingBoundaryIndex.value !== null) {
    handleBoundaryDrag(event)
  }
}

function handleBoundaryPointerEnter(index: number) {
  hoverBoundaryIndex.value = index
  clearHoverInsertPosition()
}

function handleBoundaryPointerLeave(index: number) {
  if (hoverBoundaryIndex.value === index) {
    hoverBoundaryIndex.value = null
  }
}

function selectBoundary(index: number) {
  if (suppressNextBoundaryClick) {
    suppressNextBoundaryClick = false
    return
  }

  activeBoundaryIndex.value = index
}

function insertBoundaryAt(position: number) {
  const current = draft.value
  if (!current) {
    return false
  }

  const nextBoundaries = [...boundaries.value]
  const insertIndex = nextBoundaries.findIndex(boundary => boundary > position)
  const index = insertIndex === -1 ? nextBoundaries.length : insertIndex
  const prev = index === 0 ? 0 : nextBoundaries[index - 1]
  const next = index === nextBoundaries.length ? current.totalHeight : nextBoundaries[index]

  if (next - prev < 2) {
    toast.error(`当前位置已经没有可新增切分线的空间`)
    return false
  }

  const nextPosition = Math.min(
    next - 1,
    Math.max(prev + 1, Math.round(position)),
  )

  nextBoundaries.splice(index, 0, nextPosition)
  boundaries.value = nextBoundaries
  activeBoundaryIndex.value = null
  return true
}

function addBoundaryFromPreview(event: MouseEvent) {
  activeBoundaryIndex.value = null
  hoverBoundaryIndex.value = null
  const position = getContentY(event)
  if (position === null) {
    return
  }

  insertBoundaryAt(position)
}

function updateHoverInsertPosition(event: PointerEvent) {
  hoverInsertPosition.value = getContentY(event)
}

function clearHoverInsertPosition() {
  hoverInsertPosition.value = null
}

function removeBoundaryAt(index: number) {
  const nextBoundaries = [...boundaries.value]
  if (index < 0 || index >= nextBoundaries.length) {
    return
  }

  nextBoundaries.splice(index, 1)
  boundaries.value = nextBoundaries
  activeBoundaryIndex.value = null
}

function removeActiveBoundary() {
  const index = activeBoundaryIndex.value
  if (index === null) {
    return
  }

  removeBoundaryAt(index)
}

function nudgeActiveBoundary(delta: number) {
  const index = activeBoundaryIndex.value
  const boundary = selectedBoundary.value
  if (index === null || boundary === null) {
    return
  }

  moveBoundary(index, boundary + delta)
}

function handleBoundaryKeyboardShortcut(event: KeyboardEvent) {
  if (!isShowPagedImageExportDialog.value || selectedBoundary.value === null) {
    return
  }

  if (event.key === `Backspace` || event.key === `Delete`) {
    event.preventDefault()
    removeActiveBoundary()
    return
  }

  if (event.key !== `ArrowUp` && event.key !== `ArrowDown`) {
    return
  }

  event.preventDefault()
  const step = event.shiftKey ? 10 : 1
  nudgeActiveBoundary(event.key === `ArrowUp` ? -step : step)
}

function resetBoundaries() {
  const current = draft.value
  if (!current) {
    return
  }

  boundaries.value = slicesToBoundaries(current.algorithmSlices, current.totalHeight)
  activeBoundaryIndex.value = null
}

function cleanupDraft() {
  prepareRequestId++
  stopBoundaryDrag()
  exportStore.disposePagedImageExportDraft(draft.value)
  draft.value = null
  boundaries.value = []
  activeBoundaryIndex.value = null
  hoverInsertPosition.value = null
  hoverBoundaryIndex.value = null
  exportProgress.value = null
  errorMessage.value = ``
}

async function prepareDraft() {
  const requestId = ++prepareRequestId
  isPreparing.value = true
  errorMessage.value = ``
  exportStore.disposePagedImageExportDraft(draft.value)
  draft.value = null
  boundaries.value = []
  activeBoundaryIndex.value = null
  hoverInsertPosition.value = null
  hoverBoundaryIndex.value = null
  exportProgress.value = null

  try {
    await nextTick()
    const nextDraft = await exportStore.preparePagedImageExportDraft()

    if (!isShowPagedImageExportDialog.value || requestId !== prepareRequestId) {
      exportStore.disposePagedImageExportDraft(nextDraft)
      return
    }

    draft.value = nextDraft
    boundaries.value = slicesToBoundaries(nextDraft.slices, nextDraft.totalHeight)
  }
  catch (error) {
    if (requestId === prepareRequestId) {
      errorMessage.value = error instanceof Error ? error.message : String(error)
    }
  }
  finally {
    if (requestId === prepareRequestId) {
      isPreparing.value = false
    }
  }
}

async function exportCurrentSlices() {
  const current = draft.value
  if (!current) {
    return
  }

  isExporting.value = true
  exportProgress.value = {
    phase: `rendering`,
    current: 0,
    total: pageCount.value,
    percent: 0,
  }
  try {
    const count = await exportStore.downloadPagedImagesZipFromDraft(
      current,
      slices.value,
      imageQuality.value,
      updateExportProgress,
    )
    toast.success(`已导出 ${count} 张分页图片。`)
    uiStore.isShowPagedImageExportDialog = false
  }
  catch (error) {
    exportProgress.value = null
    const message = error instanceof Error ? error.message : String(error)
    toast.error(`分页图片导出失败：${message}`)
  }
  finally {
    isExporting.value = false
  }
}

function handleOpenChange(open: boolean) {
  uiStore.isShowPagedImageExportDialog = open
}

watch(isShowPagedImageExportDialog, (open) => {
  if (open) {
    imageQuality.value = DEFAULT_PAGED_IMAGE_EXPORT_QUALITY
    prepareDraft()
    window.addEventListener(`keydown`, handleBoundaryKeyboardShortcut)
  }
  else {
    cleanupDraft()
    window.removeEventListener(`keydown`, handleBoundaryKeyboardShortcut)
  }
})

onBeforeUnmount(() => {
  cleanupDraft()
  window.removeEventListener(`keydown`, handleBoundaryKeyboardShortcut)
})
</script>

<template>
  <Dialog :open="isShowPagedImageExportDialog" @update:open="handleOpenChange">
    <DialogContent
      class="!w-[min(1180px,95vw)] !max-w-[95vw] h-[88vh] max-h-[88vh] grid grid-rows-[auto_minmax(0,1fr)_auto] gap-0 overflow-hidden p-0"
    >
      <DialogHeader class="border-b px-5 py-4 pr-12">
        <DialogTitle>自定义分页图片导出</DialogTitle>
        <DialogDescription>
          调整切分线和图片质量后，导出的 ZIP 会按当前设置裁剪分页图片。
        </DialogDescription>
      </DialogHeader>

      <div v-if="isPreparing" class="flex min-h-0 items-center justify-center text-sm text-muted-foreground">
        <Loader2 class="mr-2 size-4 animate-spin" />
        正在生成分页预览
      </div>

      <div v-else-if="errorMessage" class="flex min-h-0 flex-col items-center justify-center gap-4 px-6 text-center">
        <p class="max-w-md text-sm text-muted-foreground">
          {{ errorMessage }}
        </p>
        <Button variant="outline" @click="prepareDraft">
          重试
        </Button>
      </div>

      <div v-else-if="draft" class="flex min-h-0 flex-col md:flex-row">
        <div class="min-h-0 flex-1 overflow-auto bg-muted/30 p-4">
          <div
            ref="previewStackRef"
            class="relative mx-auto cursor-crosshair overflow-hidden border bg-background shadow-sm"
            :style="{ width: `${draft.width}px`, maxWidth: '100%' }"
            @click="addBoundaryFromPreview"
            @pointermove="updateHoverInsertPosition"
            @pointerleave="clearHoverInsertPosition"
          >
            <img
              :src="draft.imageUrl"
              alt="分页导出预览"
              class="block w-full select-none"
              draggable="false"
            >

            <div class="pointer-events-none absolute inset-0">
              <div
                v-for="(slice, index) in slices"
                :key="`${slice.start}-${slice.end}`"
                class="absolute left-0 right-0"
                :style="getSliceStyle(slice, index)"
              />
            </div>

            <div
              v-if="hoverInsertPosition !== null"
              class="pointer-events-none absolute left-0 right-0 z-10 -translate-y-1/2 border-t border-dashed border-emerald-500"
              :style="{ top: getPositionPercent(hoverInsertPosition) }"
            >
              <span class="absolute right-2 -translate-y-1/2 rounded border border-emerald-500/60 bg-background/95 px-2 py-0.5 text-xs text-emerald-600 shadow-sm dark:text-emerald-400">
                点击新增 · {{ formatPx(hoverInsertPosition) }}
              </span>
            </div>

            <button
              v-for="(boundary, index) in boundaries"
              :key="`${index}-${boundary}`"
              type="button"
              class="absolute left-0 z-20 h-12 w-full -translate-y-1/2 cursor-row-resize bg-transparent p-0 text-left focus:outline-none"
              :class="getBoundaryButtonClass(index)"
              :style="{ top: getBoundaryPercent(boundary) }"
              @click.stop="selectBoundary(index)"
              @dblclick.stop
              @pointerenter="handleBoundaryPointerEnter(index)"
              @pointerleave="handleBoundaryPointerLeave(index)"
              @pointermove.stop="handleBoundaryHitAreaPointerMove"
              @pointerdown="startBoundaryDrag(index, $event)"
            >
              <span
                class="absolute left-0 right-0 top-1/2 -translate-y-1/2"
                :class="getBoundaryLineClass(index)"
              />
              <span
                class="absolute right-2 top-1/2 -translate-y-1/2 rounded border bg-background/95 px-2 py-0.5 text-xs shadow-sm"
                :class="getBoundaryLabelClass(index)"
              >
                {{ index + 1 }} · {{ formatPx(boundary) }}
              </span>
            </button>
          </div>
        </div>

        <aside class="w-full shrink-0 border-t bg-background p-4 md:w-80 md:border-l md:border-t-0">
          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-2 text-center text-xs">
              <div class="rounded border px-2 py-2">
                <div class="font-medium text-foreground">
                  {{ pageCount }}
                </div>
                <div class="text-muted-foreground">
                  张图片
                </div>
              </div>
              <div class="rounded border px-2 py-2">
                <div class="font-medium text-foreground">
                  {{ formatPx(draft.totalHeight) }}
                </div>
                <div class="text-muted-foreground">
                  总高度
                </div>
              </div>
            </div>

            <div class="space-y-2">
              <div class="text-xs font-medium text-muted-foreground">
                导出质量
              </div>
              <div class="grid grid-cols-3 gap-2">
                <Button
                  v-for="option in PAGED_IMAGE_QUALITY_OPTIONS"
                  :key="option.value"
                  type="button"
                  size="sm"
                  :variant="getQualityButtonVariant(option.value)"
                  :disabled="isExporting"
                  @click="imageQuality = option.value"
                >
                  {{ option.label }}
                </Button>
              </div>
              <p class="text-xs leading-5 text-muted-foreground">
                默认高质量；降低质量可减少 ZIP 体积。
              </p>
            </div>

            <div v-if="exportProgress" class="space-y-2 rounded border p-3">
              <div class="flex items-center justify-between gap-2 text-xs">
                <span class="font-medium text-muted-foreground">{{ exportProgressLabel }}</span>
                <span class="text-muted-foreground">{{ exportProgressPercent }}%</span>
              </div>
              <div class="h-2 overflow-hidden rounded bg-muted">
                <div
                  class="h-full rounded bg-primary transition-[width] duration-200"
                  :style="{ width: `${exportProgressPercent}%` }"
                />
              </div>
            </div>

            <p class="text-xs leading-5 text-muted-foreground">
              单击空白处新增切分线；点击切分线选中后，可拖动、方向键微调，或按 Backspace / Delete 删除。
            </p>

            <div v-if="oversizedSliceCount > 0" class="rounded border border-amber-500/60 bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-300">
              {{ oversizedSliceCount }} 张图片高度过高，仍可继续导出。
            </div>
            <div v-if="undersizedSliceCount > 0" class="rounded border border-red-500/60 bg-red-500/10 px-3 py-2 text-xs text-red-700 dark:text-red-300">
              {{ undersizedSliceCount }} 张图片间隔过低，仍可继续导出。
            </div>

            <Button variant="outline" size="sm" class="w-full" :disabled="isExporting" @click="resetBoundaries">
              <RotateCcw class="mr-1 size-4" />
              重置
            </Button>
          </div>
        </aside>
      </div>

      <DialogFooter class="border-t px-5 py-3 sm:justify-between">
        <div class="text-xs text-muted-foreground">
          <span v-if="draft">
            将导出 {{ pageCount }} 张图片到 ZIP
            <span v-if="oversizedSliceCount > 0">，{{ oversizedSliceCount }} 张高度过高</span>
            <span v-if="undersizedSliceCount > 0">，{{ undersizedSliceCount }} 张间隔过低</span>
          </span>
        </div>
        <div class="flex gap-2">
          <Button variant="outline" :disabled="isExporting" @click="handleOpenChange(false)">
            取消
          </Button>
          <Button :disabled="!draft || isPreparing || isExporting" @click="exportCurrentSlices">
            <Loader2 v-if="isExporting" class="mr-2 size-4 animate-spin" />
            <Download v-else class="mr-2 size-4" />
            导出 ZIP
          </Button>
        </div>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
