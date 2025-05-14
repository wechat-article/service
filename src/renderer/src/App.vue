<script setup lang="ts">
import { ref } from 'vue'
import SideBar from '@renderer/components/SideBar.vue'
import About from '@renderer/pages/About.vue'
import Proxy from '@renderer/pages/Proxy.vue'
import Formatter from '@renderer/pages/Formatter.vue'

const activeTab = ref('proxy')
</script>

<template>
  <SideBar v-model="activeTab" />
  <div id="content-view">
    <Proxy v-show="activeTab === 'proxy'" />
    <Formatter v-show="activeTab === 'formatter'" />
    <About v-show="activeTab === 'about'" />
  </div>
</template>
