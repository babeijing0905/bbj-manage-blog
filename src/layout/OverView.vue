<template>
  <yk-space dir="vertical" size="xl">
    <TopTitle :is-search="false" />

    <gather></gather>
    <yk-space style="width: 100%" size="xl">
      <datas style="width: 50%"></datas>
      <comment style="width: 50%" height="516px"></comment>
    </yk-space>

   
  </yk-space>
</template>

<script lang="ts" setup>
import { TopTitle } from "../components/bar";
import gather from "../components/overview/gather.vue";
import datas from "../components/overview/datas.vue";
import comment from "../components/reply/comment.vue";



</script>

<style lang="less" scoped>

</style>
