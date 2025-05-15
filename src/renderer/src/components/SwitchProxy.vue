<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

const mitmproxyAddress = ref('')

async function queryMitmproxyPort(): Promise<void> {
  const port = await window.electron.ipcRenderer.invoke('get-mitmproxy-port')
  if (port) {
    mitmproxyAddress.value = `http://127.0.0.1:${port}`
  } else {
    mitmproxyAddress.value = ''
  }
}

const btnLoading = ref(false)

async function switchMitmProxy(on = true): Promise<void> {
  btnLoading.value = true
  try {
    await window.electron.ipcRenderer.invoke(on ? 'start-mitmproxy' : 'stop-mitmproxy')
  } finally {
    btnLoading.value = false
  }
}

function query() {
  queryMitmproxyPort()
}

let timer: number | null = null
onMounted(() => {
  query()
  timer = window.setInterval(() => {
    query()
  }, 1000)
})
onUnmounted(() => {
  clearInterval(timer!)
})
</script>

<template>
  <div>
    <Button
      v-if="!mitmproxyAddress"
      class="switch"
      label="启动代理"
      :loading="btnLoading"
      severity="info"
      @click="switchMitmProxy(true)"
    />
    <Button
      v-else
      class="switch"
      label="关闭代理"
      :loading="btnLoading"
      severity="help"
      @click="switchMitmProxy(false)"
    />
  </div>
</template>

<style scoped>
.switch {
  width: 100%;
  border-radius: 0;
}
</style>
