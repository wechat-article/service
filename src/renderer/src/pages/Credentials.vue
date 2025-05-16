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

  window.electron.ipcRenderer.on('update:credentials', onUpdateCredentials)
})
onUnmounted(() => {
  clearInterval(timer!)
  window.electron.ipcRenderer.removeAllListeners('update:credentials')
})

const btnCopyIcon = ref('pi-copy')
function copy() {
  navigator.clipboard.writeText(wsAddress.value)
  btnCopyIcon.value = 'pi-check'
  setTimeout(() => {
    btnCopyIcon.value = 'pi-copy'
  }, 1000)
}

interface ParsedCredential {
  nickname: string
  round_head_img: string
  biz: string
  uin: string
  key: string
  pass_ticket: string
  wap_sid2: string
  time: string
  valid: boolean
}

const credentials = ref<ParsedCredential[]>([])

function onUpdateCredentials(_, data) {
  credentials.value = data
}

const btnLoading = ref(false)
async function remove(biz: string) {
  try {
    btnLoading.value = true
    const res = await window.electron.ipcRenderer.invoke('remove-credential', biz)
    console.log(res)
  } finally {
    btnLoading.value = false
  }
}
</script>

<template>
  <div>
    <section class="relative">
      <Fieldset legend="Credentials 监听地址">
        <p v-if="wsAddress" class="code flex">
          <span>{{ wsAddress }}</span>
          <i class="icon pi" :class="btnCopyIcon" @click="copy"></i>
        </p>
        <p v-else style="color: red">未启动</p>
      </Fieldset>
      <p class="btn">
        已连接客户端: <span class="num">{{ wsClients }}</span>
      </p>
    </section>
    <section>
      <Fieldset legend="Credentials 列表">
        <div class="flex flex-col gap-3">
          <div
            v-for="credential in credentials"
            :key="credential.biz"
            class="flex w-full border rounded-md hover:ring ring-blue-500 hover:shadow-md transition-all duration-300 px-8 py-3 gap-3"
          >
            <div class="h-20">
              <img :src="credential.round_head_img" alt="Image" class="h-full" />
            </div>
            <div class="flex-1">
              <p>公众号名称：{{ credential.nickname || '--' }}</p>
              <p>fakeid: {{ credential.biz }}</p>
              <p>获取时间: {{ credential.time }}</p>
              <span v-if="credential.valid" class="font-sans font-bold text-green-500">有效</span>
              <span v-else class="font-sans font-bold text-rose-500">已过期</span>
            </div>
            <Button
              label="删除"
              severity="danger"
              :loading="btnLoading"
              @click="remove(credential.biz)"
            ></Button>
          </div>
        </div>
      </Fieldset>
    </section>
  </div>
</template>

<style scoped>
.relative {
  position: relative;
}
.flex {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.code .icon {
  cursor: pointer;
}

.btn {
  position: absolute;
  top: -10px;
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
