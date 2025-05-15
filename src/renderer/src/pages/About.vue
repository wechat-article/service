<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useToast } from 'primevue/usetoast'

const toast = useToast()

const versions = reactive({ ...window.electron.process.versions })
const appVersion = ref('')
onMounted(async () => {
  appVersion.value = await window.electron.ipcRenderer.invoke('get-app-version')
})

async function openLogs() {
  const error = await window.electron.ipcRenderer.invoke('open-logs-directory')
  if (error) {
    toast.add({
      severity: 'error',
      summary: 'Error Message',
      detail: error,
      life: 3000
    })
  }
}
</script>

<template>
  <div>
    <section>
      <Fieldset legend="版本信息">
        <ul class="versions">
          <li class="electron-version">Electron v{{ versions.electron }}</li>
          <li class="chrome-version">Chromium v{{ versions.chrome }}</li>
          <li class="node-version">Node v{{ versions.node }}</li>
          <li class="node-version">App v{{ appVersion }}</li>
        </ul>
      </Fieldset>
    </section>
    <section>
      <Fieldset legend="开发者信息">
        <p>jooooock</p>
        <p><a href="https://github.com/jooooock" target="_blank">GitHub</a></p>
      </Fieldset>
    </section>
    <section>
      <Fieldset legend="日志">
        <Button severity="info" @click="openLogs">查看系统日志</Button>
      </Fieldset>
    </section>
  </div>
</template>

<style scoped>
ul {
  padding: 0;
  font-family: 'Menlo', 'Lucida Console', monospace;
}
</style>
