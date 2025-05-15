<script setup lang="ts">
import SideBar from '@renderer/components/SideBar.vue'
</script>

<template>
  <SideBar />
  <div id="content-view">
    <RouterView />
  </div>
</template>
