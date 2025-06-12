<template>
  <yk-space size="l" dir="vertical" class="file-view">
    <TopTitle name="本地文件" :is-search="false" style="margin-bottom: 8px">
      <template #custom>
        <yk-space align="center">
          <yk-text>图片、视频、音频大小不超过20M</yk-text>
          <yk-button>UPLOAD</yk-button>
        </yk-space>
      </template>
    </TopTitle>
    <subset :classify="2"> </subset>
    <files></files>
  </yk-space>
</template>

<script lang="ts" setup>
import TopTitle from "../components/bar/TopTitle.vue";
import subset from "../components/subset/subset.vue";
import files from "../components/files/files.vue";
</script>

<style lang="less" scoped>
.file-view {
  width: 100%;
}
</style>
