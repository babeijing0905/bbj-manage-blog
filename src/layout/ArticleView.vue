<template>
  <yk-space dir="vertical" size="l">
    <TopTitle
      name="文章"
      :is-search="false"
      style="margin-bottom: 8px"
    ></TopTitle>
    <subset :classify="0" />
    <yk-space style="width: 100%">
      <articleComponet style="width: 100%"></articleComponet>
      <!--   note：因为label也是html标签，所以要加view区分 -->
      <label-view>a</label-view>
    </yk-space>
  </yk-space>
</template>

<script lang="ts" setup>
import TopTitle from "../components/bar/TopTitle.vue";
import subset from "../components/subset/subset.vue";

import labelView from "../components/label/label.vue";
import articleComponet from "../components/article/articleComponet.vue";
</script>

<style lang="less" scoped></style>
