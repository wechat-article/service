<script setup lang="ts">
import { onMounted, ref } from 'vue'

const systemProxyAddress = ref('')

async function querySystemProxy(): Promise<void> {
  const result = await window.electron.ipcRenderer.invoke('get-system-proxy')
  if (result) {
    systemProxyAddress.value = JSON.stringify(result, null, 2)
  } else {
    systemProxyAddress.value = ''
  }
  setTimeout(() => {
    querySystemProxy()
  }, 1000)
}

const mitmproxyAddress = ref('')

async function queryMitmproxyPort(): Promise<void> {
  const port = await window.electron.ipcRenderer.invoke('get-mitmproxy-port')
  if (port) {
    mitmproxyAddress.value = `http://127.0.0.1:${port}`
  } else {
    mitmproxyAddress.value = ''
  }
  setTimeout(() => {
    queryMitmproxyPort()
  }, 1000)
}

const wsAddress = ref('')

async function queryWsPort(): Promise<void> {
  const port = await window.electron.ipcRenderer.invoke('get-ws-port')
  if (port) {
    wsAddress.value = `ws://127.0.0.1:${port}`
  } else {
    wsAddress.value = ''
  }
  setTimeout(() => {
    queryWsPort()
  }, 1000)
}

const wsClients = ref(0)

async function queryWsClients(): Promise<void> {
  const clients = await window.electron.ipcRenderer.invoke('get-ws-clients')
  if (clients) {
    wsClients.value = clients
  } else {
    wsClients.value = 0
  }
  setTimeout(() => {
    queryWsClients()
  }, 1000)
}

onMounted(() => {
  querySystemProxy()
  queryMitmproxyPort()
  queryWsPort()
  queryWsClients()
})

const btnLoading = ref(false)

async function switchMitmProxy(on = true): Promise<void> {
  btnLoading.value = true
  try {
    await window.electron.ipcRenderer.invoke(on ? 'start-mitmproxy' : 'stop-mitmproxy')
  } finally {
    btnLoading.value = false
  }
}
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
    </section>
    <section>
      <h3>Credentials 监听地址：</h3>
      <p v-if="wsAddress">{{ wsAddress }}</p>
      <p v-else style="color: red">未启动</p>
      <p>已有{{ wsClients }}个客户端连接</p>
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

.switch {
  position: absolute;
  right: 10px;
  top: 0;
}
</style>
