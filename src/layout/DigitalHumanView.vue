<template>
  <yk-space dir="vertical" size="l">
    <TopTitle name="数字人展示" :is-search="false" style="margin-bottom: 8px" />
    <digital-human></digital-human>
  </yk-space>
</template>

<script lang="ts" setup>
import { TopTitle } from "../components/bar";
import DigitalHuman from "../components/digital-human/DigitalHuman.vue";
</script>

<style lang="less" scoped></style>
