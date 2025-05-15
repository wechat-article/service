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
      <Fieldset legend="Credentials 监听地址">
        <p v-if="wsAddress" class="code">{{ wsAddress }}</p>
        <p v-else style="color: red">未启动</p>
      </Fieldset>
      <p class="btn">
        已连接客户端: <span class="num">{{ wsClients }}</span>
      </p>
    </section>
  </div>
</template>

<style scoped>
.relative {
  position: relative;
}

.btn {
  position: absolute;
  top: 25px;
  right: 10px;
}

.num {
  font-size: 20px;
  font-weight: bold;
  color: #e95020;
  font-family:
    ui-monospace,
    SFMono-Regular,
    SF Mono,
    Menlo,
    Consolas,
    Liberation Mono,
    monospace;
}
</style>
