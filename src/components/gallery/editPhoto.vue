<template>
  <div class="edit-photo">
    <yk-upload :upload-url="uploadUrl" :draggable="true"></yk-upload>
    <div class="edit-photo-waterfall">
      <div class="edit-photo-waterfall-item" v-for="item in photos">
        <img :src="'./src/assets/image/' + item.url" />
        <IconStarFill
          class="edit-photo-waterfall-item-cover"
          v-show="item.id == coverIndex"
        />
        <yk-space size="ss">
          <p
            class="edit-photo-waterfall-item-tool"
            v-show="item.id != coverIndex"
            @click="changeCover(item.id)"
          >
            设为封面
          </p>
          <IconDeleteOutline
            class="edit-photo-waterfall-item-delete"
            @click="deletePhotos(item.id)"
          />
        </yk-space>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, getCurrentInstance } from "vue";
import { mkphotos } from "../../mock/data";
const proxy: any = getCurrentInstance()?.proxy;
//获取图片
const photos = ref();
const getPhotos = () => {
  photos.value = mkphotos.data;
};
//todo:上传地址
const uploadUrl = " ";
//封面
const coverIndex = ref<number>(0);
const changeCover = (e: number) => {
  coverIndex.value = e;
};
//删除
const deletePhotos = (e: number) => {
  photos.value = photos.value.filter((obj: any) => {
    return obj.id !== e;
  });
  if (coverIndex.value == e && photos.value.length > 0) {
    coverIndex.value = photos.value[0].id;
  } else if (coverIndex.value == e && photos.value.length <= 0) {
    coverIndex.value = -1;
  }
  proxy.$message({ type: "primary", message: "删除完成" });
};
onMounted(() => {
  getPhotos();
});
</script>

<style lang="less" scoped>
.edit-photo {
  background-color: @bg-color-l;
  border-radius: @radius-m;
  padding: @space-l;
  width: 100%;
}
.edit-photo-waterfall {
  width: 100%;
  column-count: 3;
  column-gap: @space-xl;
  padding-top: 32px;
  &-item {
    margin-bottom: @space-xl;
    border-radius: @radius-m;
    overflow: hidden;
    line-height: 0%;
    img {
      width: 100%;
    }
    .yk-space {
      position: absolute;
      top: @space-l;
      right: @space-l;
    }
    &-cover {
      position: absolute;
      left: @space-l;
      top: @space-l;
      width: 24px;
      height: 24px;
      color: @scolor;
    }
    &-tool {
      line-height: 32px;
      padding: 0 @space-m;
      border-radius: @radius-m;
      background-color: rgba(255, 255, 255, 0.56);
      color: @pcolor;
      cursor: pointer;
      opacity: 0;
      &:hover {
        background-color: rgba(255, 255, 255, 0.8);
        backdrop-filter: blur(2px);
      }
    }
    &-delete {
      width: 32px;
      height: 32px;
      padding: 9px;
      border-radius: @radius-m;
      background-color: rgba(255, 255, 255, 0.56);
      cursor: pointer;
      color: @gray;
      transition: all @animatb;
      opacity: 0;

      &:hover {
        color: @ecolor;
        background-color: rgba(255, 255, 255, 0.8);
        backdrop-filter: blur(2px);
      }
    }
    &:hover {
      .edit-photo-waterfall-item-tool {
        opacity: 1;
      }
      .edit-photo-waterfall-item-delete {
        opacity: 1;
      }
    }
  }
}
</style>
