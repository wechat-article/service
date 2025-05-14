<script setup lang="ts">
import { ref } from 'vue'
import SideBar from '@renderer/components/SideBar.vue'
import About from '@renderer/pages/About.vue'
import Proxy from '@renderer/pages/Proxy.vue'
import Formatter from '@renderer/pages/Formatter.vue'

const currentTab = ref('格式转换')
</script>

<template>
  <SideBar v-model="currentTab" />
  <div id="content-view">
    <Formatter v-show="currentTab === '格式转换'" />
    <Proxy v-show="currentTab === '系统代理'" />
    <About v-show="currentTab === '关于'" />
  </div>
</template>
