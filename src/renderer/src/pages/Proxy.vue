<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

const systemProxyAddress = ref('')

async function querySystemProxy(): Promise<void> {
  const result = await window.electron.ipcRenderer.invoke('get-system-proxy')
  if (result) {
    systemProxyAddress.value = JSON.stringify(result, null, 2)
  } else {
    systemProxyAddress.value = ''
  }
}

const mitmproxyAddress = ref('')

async function queryMitmproxyPort(): Promise<void> {
  const port = await window.electron.ipcRenderer.invoke('get-mitmproxy-port')
  if (port) {
    mitmproxyAddress.value = `http://127.0.0.1:${port}`
  } else {
    mitmproxyAddress.value = ''
  }
}

async function verify() {
  window.open('http://mitm.it', '_blank')
}

function query() {
  querySystemProxy()
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
    <section>
      <h3>当前系统代理：</h3>
      <p v-if="systemProxyAddress" class="code">{{ systemProxyAddress }}</p>
      <p v-else style="color: red">未设置</p>
    </section>
    <section class="relative">
      <h3>内置 mitmproxy 代理：</h3>
      <p v-if="mitmproxyAddress">{{ mitmproxyAddress }}</p>
      <p v-else style="color: red">未启动</p>
      <Button v-if="mitmproxyAddress" class="btn" severity="info" @click="verify"
        >验证代理是否设置正确</Button
      >
    </section>
  </div>
</template>

<style scoped>
section:not(:first-child) {
  margin-block: 30px;
}

section h3 {
  font-weight: bold;
}

section .code {
  font-family: 'Menlo', 'Lucida Console', monospace;
  white-space: pre;
  font-size: 16px;
  background: #eaeaea;
  padding: 5px 10px;
  border-radius: 5px;
}

.relative {
  position: relative;
}
.btn {
  position: absolute;
  right: 0;
  top: 0;
}
</style>
