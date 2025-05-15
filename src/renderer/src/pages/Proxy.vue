<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'

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

const showWarning = computed(() => {
  if (systemProxyAddress.value && mitmproxyAddress.value) {
    try {
      return (
        JSON.parse(systemProxyAddress.value).proxyUrl.replace('localhost', '127.0.0.1') !==
        mitmproxyAddress.value
      )
    } catch (e) {
      return false
    }
  }
  return false
})

const btnLoading = ref(false)
const proxyVerified = ref()
const btnIcon = computed(() => {
  if (proxyVerified.value) {
    return 'pi pi-check'
  } else {
    return ''
  }
})
const btnLabel = computed(() => {
  if (btnLoading.value) {
    return '检查中'
  } else if (proxyVerified.value) {
    return '代理设置正确'
  } else if (proxyVerified.value === false) {
    return '代理设置有误，重新检查'
  } else {
    return '检查代理设置是否正确'
  }
})
const btnSeverity = computed(() => {
  if (proxyVerified.value) {
    return 'success'
  } else if (proxyVerified.value === false) {
    return 'danger'
  } else {
    return 'info'
  }
})
async function verify() {
  btnLoading.value = true
  proxyVerified.value = undefined
  await new Promise((resolve) => setTimeout(resolve, 500))
  proxyVerified.value = await window.electron.ipcRenderer.invoke('verify-mitmproxy')
  btnLoading.value = false
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
    <Message v-if="showWarning" severity="warn"
      >注意：mitmproxy 代理地址与系统代理设置不一致，请检查是否有开启其他 VPN 服务。</Message
    >
    <section>
      <Fieldset legend="系统代理">
        <p v-if="systemProxyAddress" class="code no-scrollbar">{{ systemProxyAddress }}</p>
        <p v-else style="color: red">未设置</p>
      </Fieldset>
    </section>
    <section>
      <Fieldset legend="内置 mitmproxy 代理">
        <p v-if="mitmproxyAddress" class="code">{{ mitmproxyAddress }}</p>
        <p v-else style="color: red">未启动</p>
      </Fieldset>
    </section>
    <Button
      v-if="mitmproxyAddress"
      :icon="btnIcon"
      :loading="btnLoading"
      :label="btnLabel"
      class="btn"
      :severity="btnSeverity"
      @click="verify"
    ></Button>
  </div>
</template>
