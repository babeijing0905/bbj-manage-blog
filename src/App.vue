<script setup lang="ts">
import HeaderBar from "./components/bar/HeaderBar.vue";
</script>

<template>
  <!-- 头部 -->
  <HeaderBar></HeaderBar>
  <!-- 内容 -->
  <router-view></router-view>
</template>

<style scoped lang="less">
@color: #00aaee;
.test {
  color: @scolor;
}
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
