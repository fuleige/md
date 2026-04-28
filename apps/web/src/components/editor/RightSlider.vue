<script setup lang="ts">
import type {
  ThemeName,
  ThemeSlot,
} from '@md/shared/configs'
import type { Format } from 'vue-pick-colors'
import {
  codeBlockThemeOptions,
  colorOptions,
  fontFamilyOptions,
  fontSizeOptions,
  legendOptions,
  themeCodeBlockThemeMap,
  themeOptions,
  themePrimaryColorMap,
  themeSlotOptions,
  visibleStylePresetsBySlot,
} from '@md/shared/configs'
import { X } from 'lucide-vue-next'
import PickColors from 'vue-pick-colors'
import { useEditorStore } from '@/stores/editor'
import { useRenderStore } from '@/stores/render'
import { useThemeStore } from '@/stores/theme'
import { useUIStore } from '@/stores/ui'

const uiStore = useUIStore()
const themeStore = useThemeStore()
const {
  theme,
  fontFamily,
  fontSize,
  primaryColor,
  isPrimaryColorCustom,
  codeBlockTheme,
  isCodeBlockThemeCustom,
  legend,
  isMacCodeBlock,
  isShowHeadingNumber,
  isShowLineNumber,
  isTextCodeBlockWrapped,
  isCiteStatus,
  isUseIndent,
  isUseJustify,
  isThemeCompositionCustom,
} = storeToRefs(themeStore)

const selectedThemeSlot = ref<ThemeSlot>(`h1`)
const currentSlotPresets = computed(() => visibleStylePresetsBySlot[selectedThemeSlot.value])
const currentSlotPreset = computed(() => themeStore.getThemeSlot(selectedThemeSlot.value))

const { isMobile, isOpenRightSlider, isDark } = storeToRefs(uiStore)

const editorStore = useEditorStore()
const renderStore = useRenderStore()

// Editor refresh function - triggers re-render with current theme settings
function editorRefresh() {
  themeStore.updateCodeTheme()

  const raw = editorStore.getContent()
  renderStore.render(raw)
}

// Theme change handlers
function themeChanged(newTheme: ThemeName) {
  themeStore.setTheme(newTheme)
  // 使用新主题系统
  themeStore.applyCurrentTheme()
  editorRefresh()
}

function themeSlotChanged(presetId: string) {
  themeStore.setThemeSlot(selectedThemeSlot.value, presetId)
  themeStore.applyCurrentTheme()
  editorRefresh()
}

function resetThemeComposition() {
  themeStore.resetThemeComposition()
  themeStore.applyCurrentTheme()
  editorRefresh()
}

function fontChanged(fonts: string) {
  themeStore.fontFamily = fonts
  // 使用新主题系统
  themeStore.applyCurrentTheme()
  editorRefresh()
}

function sizeChanged(size: string) {
  themeStore.fontSize = size
  // 使用新主题系统
  themeStore.applyCurrentTheme()
  editorRefresh()
}

function colorChanged(newColor: string) {
  themeStore.setPrimaryColor(newColor)
  // 使用新主题系统
  themeStore.applyCurrentTheme()
  editorRefresh()
}

function useThemePrimaryColor() {
  themeStore.useThemePrimaryColor()
  themeStore.applyCurrentTheme()
  editorRefresh()
}

const recommendedCodeBlockThemeLabel = computed(() => {
  const themeUrl = themeCodeBlockThemeMap[theme.value]
  return themeUrl.match(/\/([^/]+)\.min\.css$/)?.[1] || `推荐`
})

function codeBlockThemeChanged(newTheme: string) {
  themeStore.setCodeBlockTheme(newTheme)
  editorRefresh()
}

function useThemeCodeBlockTheme() {
  themeStore.useThemeCodeBlockTheme()
  editorRefresh()
}

function legendChanged(newVal: string) {
  themeStore.legend = newVal
  editorRefresh()
}

function macCodeBlockChanged() {
  themeStore.isMacCodeBlock = !themeStore.isMacCodeBlock
  editorRefresh()
}

function showHeadingNumberChanged() {
  themeStore.isShowHeadingNumber = !themeStore.isShowHeadingNumber
  editorRefresh()
}

function showLineNumberChanged() {
  themeStore.isShowLineNumber = !themeStore.isShowLineNumber
  editorRefresh()
}

function textCodeBlockWrappedChanged() {
  themeStore.isTextCodeBlockWrapped = !themeStore.isTextCodeBlockWrapped
  editorRefresh()
}

function citeStatusChanged() {
  themeStore.isCiteStatus = !themeStore.isCiteStatus
  editorRefresh()
}

function useIndentChanged() {
  themeStore.isUseIndent = !themeStore.isUseIndent
  // 使用新主题系统
  themeStore.applyCurrentTheme()
  editorRefresh()
}

function useJustifyChanged() {
  themeStore.isUseJustify = !themeStore.isUseJustify
  // 使用新主题系统
  themeStore.applyCurrentTheme()
  editorRefresh()
}

function resetStyleConfirm() {
  uiStore.isOpenConfirmDialog = true
}

// 控制是否启用动画
const enableAnimation = ref(false)

// 监听 RightSlider 开关状态变化
watch(isOpenRightSlider, () => {
  if (isMobile.value) {
    // 在移动端，用户操作时启用动画
    enableAnimation.value = true
  }
})

// 监听设备类型变化，重置动画状态
watch(isMobile, () => {
  enableAnimation.value = false
})

const isOpen = ref(false)

const addPostInputVal = ref(``)

watch(isOpen, () => {
  if (isOpen.value) {
    addPostInputVal.value = ``
  }
})

const pickColorsContainer = useTemplateRef<HTMLElement | undefined>(`pickColorsContainer`)
const format = ref<Format>(`rgb`)
const formatOptions = ref<Format[]>([`rgb`, `hex`, `hsl`, `hsv`])
</script>

<template>
  <!-- 移动端遮罩层 -->
  <div
    v-if="isMobile && isOpenRightSlider"
    class="fixed inset-0 bg-black/50 z-40"
    @click="isOpenRightSlider = false"
  />

  <div
    class="h-full overflow-hidden"
    :class="{
      'fixed top-0 right-0 w-full h-full z-55 bg-background border-l shadow-lg mobile-right-drawer': isMobile,
      'animate': isMobile && enableAnimation,
    }"
    :style="isMobile ? { transform: isOpenRightSlider ? 'translateX(0)' : 'translateX(100%)' } : undefined"
  >
    <div
      class="space-y-4 h-full overflow-auto p-4"
      :class="{ 'pt-0': isMobile }"
    >
      <!-- 移动端标题栏 -->
      <div v-if="isMobile" class="sticky top-0 z-10 flex items-center justify-between -mx-4 px-4 py-3 border-b mb-4 bg-background">
        <h2 class="text-lg font-semibold">
          样式设置
        </h2>
        <Button variant="ghost" size="sm" @click="isOpenRightSlider = false">
          <X class="h-4 w-4" />
        </Button>
      </div>
      <div class="space-y-2">
        <h2>主题</h2>
        <div class="grid grid-cols-3 justify-items-center gap-2">
          <Button
            v-for="{ label, value } in themeOptions" :key="value" class="w-full" variant="outline" :class="{
              'border-black dark:border-white border-2': theme === value,
            }" @click="themeChanged(value)"
          >
            <span
              class="mr-1.5 inline-block h-3 w-3 shrink-0 rounded-full border border-black/10 dark:border-white/20"
              :style="{ background: themePrimaryColorMap[value] }"
            />
            {{ label }}
          </Button>
        </div>
      </div>
      <div class="space-y-2">
        <h2>字体</h2>
        <div class="grid grid-cols-3 justify-items-center gap-2">
          <Button
            v-for="{ label, value } in fontFamilyOptions" :key="value" variant="outline" class="w-full"
            :class="{ 'border-black dark:border-white border-2': fontFamily === value }" @click="fontChanged(value)"
          >
            {{ label }}
          </Button>
        </div>
      </div>
      <div class="space-y-2">
        <h2>字号</h2>
        <div class="grid grid-cols-5 justify-items-center gap-2">
          <Button
            v-for="{ value, desc } in fontSizeOptions" :key="value" variant="outline" class="w-full" :class="{
              'border-black dark:border-white border-2': fontSize === value,
            }" @click="sizeChanged(value)"
          >
            {{ desc }}
          </Button>
        </div>
      </div>
      <div class="space-y-2">
        <h2>主题色</h2>
        <Button
          class="w-full justify-start" variant="outline" :class="{
            'border-black dark:border-white border-2': !isPrimaryColorCustom,
          }" @click="useThemePrimaryColor"
        >
          <span
            class="mr-2 inline-block h-4 w-4 rounded-full border border-black/10 dark:border-white/20"
            :style="{ background: themePrimaryColorMap[theme] }"
          />
          当前主题推荐色
        </Button>
        <div class="grid grid-cols-3 justify-items-center gap-2">
          <Button
            v-for="{ label, value } in colorOptions" :key="value" class="w-full" variant="outline" :class="{
              'border-black dark:border-white border-2': primaryColor === value,
            }" @click="colorChanged(value)"
          >
            <span
              class="mr-2 inline-block h-4 w-4 rounded-full" :style="{
                background: value,
              }"
            />
            {{ label }}
          </Button>
        </div>
      </div>
      <div class="space-y-2">
        <h2>自定义主题色</h2>
        <div ref="pickColorsContainer">
          <PickColors
            v-if="pickColorsContainer" v-model:value="primaryColor" show-alpha :format="format"
            :format-options="formatOptions" :theme="isDark ? 'dark' : 'light'"
            :popup-container="pickColorsContainer" @change="colorChanged"
          />
        </div>
      </div>
      <div class="space-y-2">
        <div class="flex items-center justify-between gap-2">
          <h2>主题组合</h2>
          <Button
            size="sm"
            variant="outline"
            :class="{
              'border-black dark:border-white border-2': !isThemeCompositionCustom,
            }"
            @click="resetThemeComposition"
          >
            当前主题
          </Button>
        </div>
        <Select v-model="selectedThemeSlot">
          <SelectTrigger>
            <SelectValue placeholder="选择组件" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="{ label, value, desc } in themeSlotOptions" :key="value" :value="value">
              {{ label }}
              <span class="ml-2 text-xs text-muted-foreground">{{ desc }}</span>
            </SelectItem>
          </SelectContent>
        </Select>
        <div class="grid grid-cols-2 gap-2">
          <Button
            v-for="preset in currentSlotPresets"
            :key="preset.id"
            class="h-auto min-h-[4.25rem] w-full justify-start px-3 py-2 text-left whitespace-normal"
            variant="outline"
            :class="{
              'border-black dark:border-white border-2': currentSlotPreset === preset.id,
            }"
            @click="themeSlotChanged(preset.id)"
          >
            <span class="block min-w-0">
              <span class="block truncate text-sm font-medium">{{ preset.label }}</span>
              <span class="block truncate text-xs text-muted-foreground">{{ preset.preview }}</span>
              <span class="block truncate text-[11px] text-muted-foreground/80">{{ preset.desc }}</span>
            </span>
          </Button>
        </div>
      </div>
      <div class="space-y-2">
        <h2>代码块主题</h2>
        <Button
          class="w-full justify-between" variant="outline" :class="{
            'border-black dark:border-white border-2': !isCodeBlockThemeCustom,
          }" @click="useThemeCodeBlockTheme"
        >
          <span>当前主题推荐代码配色</span>
          <span class="text-xs text-muted-foreground">{{ recommendedCodeBlockThemeLabel }}</span>
        </Button>
        <div>
          <Select v-model="codeBlockTheme" @update:model-value="codeBlockThemeChanged">
            <SelectTrigger>
              <SelectValue placeholder="Select a code block theme" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="{ label, value } in codeBlockThemeOptions" :key="label" :value="value">
                {{ label }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div class="space-y-2">
        <h2>图注格式</h2>
        <div class="grid grid-cols-3 justify-items-center gap-2">
          <Button
            v-for="{ label, value } in legendOptions" :key="value" class="w-full" variant="outline" :class="{
              'border-black dark:border-white border-2': legend === value,
            }" @click="legendChanged(value)"
          >
            {{ label }}
          </Button>
        </div>
      </div>

      <div class="space-y-2">
        <h2>Mac 代码块</h2>
        <div class="grid grid-cols-5 justify-items-center gap-2">
          <Button
            class="w-full" variant="outline" :class="{
              'border-black dark:border-white border-2': isMacCodeBlock,
            }" @click="!isMacCodeBlock && macCodeBlockChanged()"
          >
            开启
          </Button>
          <Button
            class="w-full" variant="outline" :class="{
              'border-black dark:border-white border-2': !isMacCodeBlock,
            }" @click="isMacCodeBlock && macCodeBlockChanged()"
          >
            关闭
          </Button>
        </div>
      </div>
      <div class="space-y-2">
        <h2>标题自动编号</h2>
        <div class="grid grid-cols-5 justify-items-center gap-2">
          <Button
            class="w-full" variant="outline" :class="{
              'border-black dark:border-white border-2': isShowHeadingNumber,
            }" @click="!isShowHeadingNumber && showHeadingNumberChanged()"
          >
            开启
          </Button>
          <Button
            class="w-full" variant="outline" :class="{
              'border-black dark:border-white border-2': !isShowHeadingNumber,
            }" @click="isShowHeadingNumber && showHeadingNumberChanged()"
          >
            关闭
          </Button>
        </div>
      </div>
      <div class="space-y-2">
        <h2>代码块行号</h2>
        <div class="grid grid-cols-5 justify-items-center gap-2">
          <Button
            class="w-full" variant="outline" :class="{
              'border-black dark:border-white border-2': isShowLineNumber,
            }" @click="!isShowLineNumber && showLineNumberChanged()"
          >
            开启
          </Button>
          <Button
            class="w-full" variant="outline" :class="{
              'border-black dark:border-white border-2': !isShowLineNumber,
            }" @click="isShowLineNumber && showLineNumberChanged()"
          >
            关闭
          </Button>
        </div>
      </div>
      <div class="space-y-2">
        <h2>文本块自动换行</h2>
        <div class="grid grid-cols-5 justify-items-center gap-2">
          <Button
            class="w-full" variant="outline" :class="{
              'border-black dark:border-white border-2': isTextCodeBlockWrapped,
            }" @click="!isTextCodeBlockWrapped && textCodeBlockWrappedChanged()"
          >
            开启
          </Button>
          <Button
            class="w-full" variant="outline" :class="{
              'border-black dark:border-white border-2': !isTextCodeBlockWrapped,
            }" @click="isTextCodeBlockWrapped && textCodeBlockWrappedChanged()"
          >
            关闭
          </Button>
        </div>
      </div>

      <div class="space-y-2">
        <h2>微信外链转底部引用</h2>
        <div class="grid grid-cols-5 justify-items-center gap-2">
          <Button
            class="w-full" variant="outline" :class="{
              'border-black dark:border-white border-2': isCiteStatus,
            }" @click="!isCiteStatus && citeStatusChanged()"
          >
            开启
          </Button>
          <Button
            class="w-full" variant="outline" :class="{
              'border-black dark:border-white border-2': !isCiteStatus,
            }" @click="isCiteStatus && citeStatusChanged()"
          >
            关闭
          </Button>
        </div>
      </div>
      <div class="space-y-2">
        <h2>段落首行缩进</h2>
        <div class="grid grid-cols-5 justify-items-center gap-2">
          <Button
            class="w-full" variant="outline" :class="{
              'border-black dark:border-white border-2': isUseIndent,
            }" @click="!isUseIndent && useIndentChanged()"
          >
            开启
          </Button>
          <Button
            class="w-full" variant="outline" :class="{
              'border-black dark:border-white border-2': !isUseIndent,
            }" @click="isUseIndent && useIndentChanged()"
          >
            关闭
          </Button>
        </div>
      </div>
      <div class="space-y-2">
        <h2>段落两端对齐</h2>
        <div class="grid grid-cols-5 justify-items-center gap-2">
          <Button
            class="w-full" variant="outline" :class="{
              'border-black dark:border-white border-2': isUseJustify,
            }" @click="!isUseJustify && useJustifyChanged()"
          >
            开启
          </Button>
          <Button
            class="w-full" variant="outline" :class="{
              'border-black dark:border-white border-2': !isUseJustify,
            }" @click="isUseJustify && useJustifyChanged()"
          >
            关闭
          </Button>
        </div>
      </div>
      <div class="space-y-2">
        <h2>样式配置</h2>
        <Button variant="destructive" @click="resetStyleConfirm">
          重置
        </Button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 移动端右侧栏动画 - 只有添加了 animate 类才启用 */
.mobile-right-drawer.animate {
  transition: transform 300ms cubic-bezier(0.16, 1, 0.3, 1);
}
</style>
