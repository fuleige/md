<script setup lang="ts">
import type { PagedImageExportDraft, SliceRange } from '@/stores/export'
import { Download, Loader2, Plus, RotateCcw, Trash2 } from 'lucide-vue-next'
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
import { PAGED_IMAGE_MIN_SLICE_HEIGHT, useExportStore } from '@/stores/export'
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

let prepareRequestId = 0

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

function slicesToBoundaries(sliceRanges: SliceRange[], totalHeight: number) {
  return sliceRanges
    .map(slice => Math.round(slice.end))
    .filter(position => position > 0 && position < totalHeight)
}

function getBoundaryPercent(position: number) {
  const current = draft.value
  if (!current || current.totalHeight <= 0) {
    return `0%`
  }

  return `${(position / current.totalHeight) * 100}%`
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

function formatHeight(slice: SliceRange) {
  return formatPx(slice.end - slice.start)
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

function getDragGap(prev: number, next: number) {
  return Math.min(PAGED_IMAGE_MIN_SLICE_HEIGHT, Math.max(1, Math.floor((next - prev) / 2)))
}

function moveBoundary(index: number, nextPosition: number) {
  const current = draft.value
  if (!current) {
    return
  }

  const nextBoundaries = [...boundaries.value]
  const prev = index === 0 ? 0 : nextBoundaries[index - 1]
  const next = index === nextBoundaries.length - 1 ? current.totalHeight : nextBoundaries[index + 1]
  const minGap = getDragGap(prev, next)

  nextBoundaries[index] = Math.min(next - minGap, Math.max(prev + minGap, Math.round(nextPosition)))
  boundaries.value = nextBoundaries
}

function stopBoundaryDrag() {
  if (draggingBoundaryIndex.value === null) {
    return
  }

  window.removeEventListener(`pointermove`, handleBoundaryDrag)
  window.removeEventListener(`pointerup`, stopBoundaryDrag)
  draggingBoundaryIndex.value = null
}

function handleBoundaryDrag(event: PointerEvent) {
  const index = draggingBoundaryIndex.value
  const position = getContentY(event)
  if (index === null || position === null) {
    return
  }

  moveBoundary(index, position)
}

function startBoundaryDrag(index: number, event: PointerEvent) {
  event.preventDefault()
  event.stopPropagation()
  stopBoundaryDrag()
  activeBoundaryIndex.value = index
  draggingBoundaryIndex.value = index
  window.addEventListener(`pointermove`, handleBoundaryDrag)
  window.addEventListener(`pointerup`, stopBoundaryDrag)
}

function insertBoundaryAt(position: number) {
  const current = draft.value
  if (!current) {
    return
  }

  const nextBoundaries = [...boundaries.value]
  const insertIndex = nextBoundaries.findIndex(boundary => boundary > position)
  const index = insertIndex === -1 ? nextBoundaries.length : insertIndex
  const prev = index === 0 ? 0 : nextBoundaries[index - 1]
  const next = index === nextBoundaries.length ? current.totalHeight : nextBoundaries[index]

  if (next - prev < PAGED_IMAGE_MIN_SLICE_HEIGHT * 2) {
    toast.error(`当前位置空间不足，无法新增切分线`)
    return
  }

  const nextPosition = Math.min(
    next - PAGED_IMAGE_MIN_SLICE_HEIGHT,
    Math.max(prev + PAGED_IMAGE_MIN_SLICE_HEIGHT, Math.round(position)),
  )

  nextBoundaries.splice(index, 0, nextPosition)
  boundaries.value = nextBoundaries
  activeBoundaryIndex.value = index
}

function addBoundaryFromPreview(event: MouseEvent) {
  const position = getContentY(event)
  if (position === null) {
    return
  }

  insertBoundaryAt(position)
}

function addBoundaryToLargestSlice() {
  if (!draft.value || slices.value.length === 0) {
    return
  }

  const largest = slices.value.reduce((result, slice) => {
    return slice.end - slice.start > result.end - result.start ? slice : result
  }, slices.value[0])

  insertBoundaryAt((largest.start + largest.end) / 2)
}

function removeActiveBoundary() {
  const index = activeBoundaryIndex.value
  if (index === null) {
    return
  }

  const nextBoundaries = [...boundaries.value]
  nextBoundaries.splice(index, 1)
  boundaries.value = nextBoundaries
  activeBoundaryIndex.value = nextBoundaries.length === 0 ? null : Math.min(index, nextBoundaries.length - 1)
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
  try {
    const count = await exportStore.downloadPagedImagesZipFromDraft(current, slices.value)
    toast.success(`已导出 ${count} 张分页图片。`)
    uiStore.isShowPagedImageExportDialog = false
  }
  catch (error) {
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
    prepareDraft()
  }
  else {
    cleanupDraft()
  }
})

onBeforeUnmount(() => {
  cleanupDraft()
})
</script>

<template>
  <Dialog :open="isShowPagedImageExportDialog" @update:open="handleOpenChange">
    <DialogContent
      class="!w-[min(1180px,95vw)] !max-w-[95vw] h-[88vh] max-h-[88vh] grid grid-rows-[auto_minmax(0,1fr)_auto] gap-0 overflow-hidden p-0"
    >
      <DialogHeader class="border-b px-5 py-4 pr-12">
        <DialogTitle>自定义分页 PNG 导出</DialogTitle>
        <DialogDescription>
          调整切分线后，导出的 ZIP 会按当前边界裁剪分页图片。
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
            class="relative mx-auto overflow-hidden border bg-background shadow-sm"
            :style="{ width: `${draft.width}px`, maxWidth: '100%' }"
            @dblclick="addBoundaryFromPreview"
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

            <button
              v-for="(boundary, index) in boundaries"
              :key="`${index}-${boundary}`"
              type="button"
              class="absolute left-0 z-10 h-6 w-full -translate-y-1/2 cursor-row-resize bg-transparent p-0 text-left focus:outline-none"
              :class="activeBoundaryIndex === index ? 'text-primary' : 'text-sky-600 dark:text-sky-400'"
              :style="{ top: getBoundaryPercent(boundary) }"
              @click.stop="activeBoundaryIndex = index"
              @dblclick.stop
              @pointerdown="startBoundaryDrag(index, $event)"
            >
              <span
                class="absolute left-0 right-0 top-1/2 h-0.5 -translate-y-1/2"
                :class="activeBoundaryIndex === index ? 'bg-primary' : 'bg-sky-500'"
              />
              <span class="absolute right-2 top-1/2 -translate-y-1/2 rounded border bg-background/95 px-2 py-0.5 text-xs shadow-sm">
                {{ index + 1 }} · {{ formatPx(boundary) }}
              </span>
            </button>
          </div>
        </div>

        <aside class="flex min-h-0 w-full shrink-0 flex-col border-t bg-background md:w-80 md:border-l md:border-t-0">
          <div class="space-y-3 border-b p-4">
            <div class="grid grid-cols-3 gap-2 text-center text-xs">
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
              <div class="rounded border px-2 py-2">
                <div class="font-medium text-foreground">
                  {{ formatPx(draft.width) }}
                </div>
                <div class="text-muted-foreground">
                  宽度
                </div>
              </div>
            </div>

            <div class="flex gap-2">
              <Button variant="outline" size="sm" class="flex-1" @click="addBoundaryToLargestSlice">
                <Plus class="mr-1 size-4" />
                新增
              </Button>
              <Button
                variant="outline"
                size="sm"
                class="flex-1"
                :disabled="selectedBoundary === null"
                @click="removeActiveBoundary"
              >
                <Trash2 class="mr-1 size-4" />
                删除
              </Button>
              <Button variant="outline" size="sm" class="flex-1" @click="resetBoundaries">
                <RotateCcw class="mr-1 size-4" />
                重置
              </Button>
            </div>

            <p class="text-xs leading-5 text-muted-foreground">
              拖动切分线调整位置；双击预览区域可在当前位置新增切分线。
            </p>
          </div>

          <div class="min-h-0 flex-1 overflow-y-auto p-3">
            <div v-if="boundaries.length === 0" class="rounded border border-dashed px-3 py-6 text-center text-sm text-muted-foreground">
              当前只会导出为 1 张图片
            </div>
            <div v-else class="space-y-2">
              <button
                v-for="(boundary, index) in boundaries"
                :key="`boundary-list-${index}-${boundary}`"
                type="button"
                class="w-full rounded border px-3 py-2 text-left text-sm transition-colors hover:bg-accent"
                :class="activeBoundaryIndex === index ? 'border-primary bg-accent' : ''"
                @click="activeBoundaryIndex = index"
              >
                <div class="flex items-center justify-between gap-2">
                  <span class="font-medium">切分线 {{ index + 1 }}</span>
                  <span class="text-xs text-muted-foreground">{{ formatPx(boundary) }}</span>
                </div>
                <div class="mt-1 text-xs text-muted-foreground">
                  第 {{ index + 1 }} 张图片结束位置
                </div>
              </button>
            </div>

            <div class="mt-4 space-y-2">
              <div
                v-for="(slice, index) in slices"
                :key="`slice-list-${index}-${slice.start}-${slice.end}`"
                class="rounded bg-muted/50 px-3 py-2 text-xs text-muted-foreground"
              >
                第 {{ index + 1 }} 张：{{ formatPx(slice.start) }} - {{ formatPx(slice.end) }}，高度 {{ formatHeight(slice) }}
              </div>
            </div>
          </div>
        </aside>
      </div>

      <DialogFooter class="border-t px-5 py-3 sm:justify-between">
        <div class="text-xs text-muted-foreground">
          <span v-if="draft">将导出 {{ pageCount }} 张 PNG 图片到 ZIP</span>
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
