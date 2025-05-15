<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ref } from 'vue'
import SwitchProxy from '@renderer/components/SwitchProxy.vue'

const router = useRouter()
const routes = ref(router.getRoutes().filter((route) => route.meta && route.meta.title))
</script>

<template>
  <aside>
    <ul>
      <li v-for="route in routes" :key="route.path">
        <RouterLink :to="route.path">{{ route.meta.title }}</RouterLink>
      </li>
    </ul>
    <SwitchProxy />
  </aside>
</template>

<style scoped>
aside {
  display: flex;
  flex-direction: column;
  background: #e8e8e8;
  width: 200px;
  color: black;
  height: 100vh;
  user-select: none;
}

ul {
  flex: 1;
  padding: 10px;
}

li > a {
  display: inline-block;
  width: 100%;
  height: 100%;
  padding: 5px 10px;
  text-decoration: none;
  color: #333;
  border-radius: 5px;
}

li > a:hover {
  background: #dcdcdc;
}

li > a.router-link-active {
  background: var(--primary-color);
  color: white;
  font-weight: 500;
}
</style>
