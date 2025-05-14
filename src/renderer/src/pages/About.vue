<script setup lang="ts">
import { reactive } from 'vue'

const versions = reactive({ ...window.electron.process.versions })
</script>

<template>
  <div>
    <section>
      <h3>版本信息：</h3>
      <ul class="versions">
        <li class="electron-version">Electron v{{ versions.electron }}</li>
        <li class="chrome-version">Chromium v{{ versions.chrome }}</li>
        <li class="node-version">Node v{{ versions.node }}</li>
        <li class="node-version">App v1.0.0</li>
      </ul>
    </section>
    <section>
      <h3>开发者：</h3>
      <p>jooooock</p>
      <p><a href="https://github.com/jooooock" target="_blank">GitHub</a></p>
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

ul {
  padding: 0;
  font-family: 'Menlo', 'Lucida Console', monospace;
}
</style>
