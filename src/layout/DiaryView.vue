<template>
  <yk-space dir="vertical" size="l">
    <TopTitle
      name="随记"
      :is-search="false"
      style="margin-bottom: 8px"
    ></TopTitle>
    <yk-space style="width: 100%" size="l">
      <diary />
      <diary-editor style="flex: none; width: 60%" />
    </yk-space>
  </yk-space>
</template>

<script lang="ts" setup>
import TopTitle from "../components/bar/TopTitle.vue";
import diary from "../components/diary/diary.vue";
import diaryEditor from "../components/diary/diaryEditor.vue";
</script>

<style lang="less" scoped></style>
