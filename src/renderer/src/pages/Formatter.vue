<script setup lang="ts">
import { computed, ref } from 'vue'

const htmlDirectory = ref<string | null>(null)
const outputDirectory = ref<string | null>(null)

async function selectDirectory(type: 'html' | 'output' = 'html'): Promise<void> {
  const dir = await window.electron.ipcRenderer.invoke('dialog:open')
  if (type === 'html') {
    htmlDirectory.value = dir
  } else if (type === 'output') {
    outputDirectory.value = dir
  }
}

const htmlFiles = ref<string[]>([])

const logs = ref<string[]>([])
const logContent = computed(() => logs.value.join('\n'))
const loading = ref(false)
const btnLabel = ref('开始转换')
const isStop = ref(false)

async function convert(): Promise<void> {
  if (loading.value) {
    isStop.value = true
    btnLabel.value = '停止中'
    return
  }

  loading.value = true
  const dir = htmlDirectory.value
  logs.value.length = 0
  try {
    logs.value.push('开始查询 HTML 文件')
    htmlFiles.value = await window.electron.ipcRenderer.invoke('query:html-files', dir)
    logs.value.push('查得 HTML 文件 ' + htmlFiles.value.length + ' 个')

    logs.value.push('启动文件服务器')
    const address = await window.electron.ipcRenderer.invoke('start:file-server', dir)

    const total = htmlFiles.value.length
    for (let i = 0; i < total; i++) {
      if (isStop.value) {
        break
      }
      btnLabel.value = `进度: ${i + 1}/${total}`
      logs.value.push(`(${i + 1}/${total}): 开始导出: ${htmlFiles.value[i]}`)
      await window.electron.ipcRenderer.invoke(
        'generate:pdf',
        address + htmlFiles.value[i],
        outputDirectory.value
      )
    }
  } finally {
    btnLabel.value = '开始转换'
    loading.value = false
    isStop.value = false
  }
}
</script>

<template>
  <div class="container">
    <InputGroup>
      <FloatLabel variant="on">
        <InputText id="on_label" v-model="htmlDirectory" disabled />
        <label for="on_label">HTML 根目录</label>
      </FloatLabel>
      <InputGroupAddon>
        <Button icon="pi pi-folder-open" severity="secondary" @click="selectDirectory('html')" />
      </InputGroupAddon>
    </InputGroup>
    <InputGroup>
      <FloatLabel variant="on">
        <InputText id="on_label" v-model="outputDirectory" disabled />
        <label for="on_label">输出目录</label>
      </FloatLabel>
      <InputGroupAddon>
        <Button icon="pi pi-folder-open" severity="secondary" @click="selectDirectory('output')" />
      </InputGroupAddon>
    </InputGroup>
    <div>
      <Button
        :label="btnLabel"
        :loading="loading"
        :disabled="!htmlDirectory || !outputDirectory"
        size="small"
        @click="convert"
      />
    </div>
    <Divider type="solid" />
    <div>
      <h3>日志</h3>
      <Textarea :value="logContent" disabled class="textarea" auto-resize :rows="10" />
    </div>
  </div>
</template>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.textarea {
  width: 100%;
  height: 300px !important;
  resize: none;
  overflow-y: scroll !important;
}
</style>
