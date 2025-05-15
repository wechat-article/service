<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

const wsAddress = ref('')

async function queryWsPort(): Promise<void> {
  const port = await window.electron.ipcRenderer.invoke('get-ws-port')
  if (port) {
    wsAddress.value = `ws://127.0.0.1:${port}`
  } else {
    wsAddress.value = ''
  }
}

const wsClients = ref(0)

async function queryWsClients(): Promise<void> {
  const clients = await window.electron.ipcRenderer.invoke('get-ws-clients')
  if (clients) {
    wsClients.value = clients
  } else {
    wsClients.value = 0
  }
}

function query() {
  queryWsPort()
  queryWsClients()
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
    <section class="relative">
      <h3>Credentials 监听地址：</h3>
      <p v-if="wsAddress">{{ wsAddress }}</p>
      <p v-else style="color: red">未启动</p>
      <p class="btn">连接客户端数: {{ wsClients }}</p>
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
