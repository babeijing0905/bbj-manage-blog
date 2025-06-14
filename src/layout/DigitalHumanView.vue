<template>
  <yk-space style="width: 100%" size="xl">
    <digital-human style="width: 70%"></digital-human>
    <ControlPanel style="width: 30%"></ControlPanel>
  </yk-space>
</template>

<script lang="ts" setup>
import { TopTitle } from "../components/bar";
import DigitalHuman from "../components/digital-human/DigitalHuman.vue";
</script>

<style lang="less" scoped>
.my-digital-human {
  height: 500px; /* 设置您想要的高度 */
}
</style>
