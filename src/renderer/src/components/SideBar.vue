<script setup lang="ts">
const model = defineModel<string>({ required: true })
const items = [{ label: '格式转换' }, { label: '系统代理' }, { label: '关于' }]
</script>

<template>
  <aside>
    <ul>
      <li
        v-for="item in items"
        :key="item.label"
        :class="{ active: model === item.label }"
        @click="model = item.label"
      >
        {{ item.label }}
      </li>
    </ul>
  </aside>
</template>

<style scoped>
aside {
  background: #e8e8e8;
  width: 200px;
  color: black;
  height: 100vh;
  user-select: none;
}

ul {
  padding: 10px;
}

li {
  padding: 5px 10px;
}

li.active {
  background: cornflowerblue;
  color: white;
  font-weight: bold;
  border-radius: 5px;
}
</style>
