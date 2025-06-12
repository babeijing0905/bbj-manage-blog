<template>
  <yk-space dir="vertical" size="l">
    <TopTitle
      name="图库"
      :is-search="false"
      style="margin-bottom: 8px"
    ></TopTitle>
    <subset :classify="1" />
    <gallery></gallery>
  </yk-space>
</template>

<script lang="ts" setup>
import TopTitle from "../components/bar/TopTitle.vue";
import subset from "../components/subset/subset.vue";
import gallery from "../components/gallery/gallery.vue";
</script>

<style lang="less" scoped></style>
