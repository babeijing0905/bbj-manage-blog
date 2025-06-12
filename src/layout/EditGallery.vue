<template>
  <div class="edit-gallery">
    <div class="edit-gallery-topbar">
      <p class="edit-gallery-topbar-title">新建图库</p>
      <yk-space
        ><yk-button type="secondary">取消</yk-button
        ><yk-button>发布</yk-button></yk-space
      >
    </div>
    <yk-space style="width: 100%"
      ><editPhoto />
      <div class="edit-gallery-form">
        <formsComponent style="width: 420px" :classify="1" /></div
    ></yk-space>
  </div>
</template>

<script lang="ts" setup>
import editPhoto from "../components/gallery/editPhoto.vue";
import formsComponent from "../components/forms/formsComponent.vue";
</script>

<style lang="less" scoped>
.edit-gallery {
  padding: @space-xl 80px;

  &-topbar {
    border-radius: @radius-m;
    background-color: @bg-color-l;
    padding: @space-l @space-xl;
    margin-bottom: @space-l;
    display: flex;
    justify-content: space-between;
    align-items: center;

    &-title {
      .font-xl();
      font-weight: 600;
    }
  }
  &-form {
    background-color: @bg-color-l;
    border-radius: @radius-m;

    flex: none;
    display: flex;
    padding: 24px;
    justify-content: center;
  }
}
</style>
