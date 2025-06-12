<template>
  <div class="gallery-item">
    <yk-space size="s" dir="vertical">
      <div class="gallery-item-img">
        <div class="gallery-item-cover">
          <yk-image
            :src="cover"
            width="238"
            height="160"
            :is-lazy="true"
            :preview="false"
            fit="cover"
          />
        </div>
        <yk-space :size="2">
          <div class="gallery-item-img-left img-div">
            <yk-image
              :src="'./src/assets/image/'+props.data?.content![0]"
              width="78"
              height="78"
              :is-lazy="true"
              :preview="false"
              fit="cover"
              v-if="props.data?.content![0]"
            />
          </div>
          <div class="gallery-item-img-center img-div">
            <yk-image
              :src="'./src/assets/image/'+props.data?.content![1]"
              width="78"
              height="78"
              :is-lazy="true"
              :preview="false"
              fit="cover"
              v-if="props.data?.content![1]"
            />
          </div>
          <div class="gallery-item-img-right img-div">
            <yk-image
              :src="'./src/assets/image/'+props.data?.content![2]"
              width="78"
              height="78"
              :is-lazy="true"
              :preview="false"
              fit="cover"
              v-if="props.data?.content![2]"
            />
          </div>
        </yk-space>
        <yk-space class="gallery-item-control" :size="4">
          <IconFillFill />
          <yk-popconfirm
            trigger="click"
            placement="topRight"
            title="确定删除"
            content="删除将不可恢复"
            @confirm="deletegallery()"
          >
            <IconDeleteOutline />
          </yk-popconfirm>
        </yk-space>
      </div>
      <div style="width: 100%">
        <p class="gallery-item-title">{{ props.data?.title }}</p>

        <div class="gallery-item-datas">
          <yk-space size="xl">
            <yk-space>
              <yk-text type="third"
                ><IconEyeOutline />{{ props.data?.views }}</yk-text
              >
              <yk-text type="third"
                ><IconLikeOutline />{{ props.data?.views }}</yk-text
              >
            </yk-space>
          </yk-space>
          <yk-text type="third">{{ momentm(props.data?.moment) }}</yk-text>
        </div>
      </div>
    </yk-space>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import type { ArticleData } from "../../utils/interface";

import { momentm } from "../../utils/moment";

type galleryItemProps = {
  data?: ArticleData;
};
const props = withDefaults(defineProps<galleryItemProps>(), {});
const emits = defineEmits(["delete", "state"]);
//封面地址
const cover = computed(() => {
  return `./src/assets/image/${props.data.cover}`;
});
//删除
const deletegallery = () => {
  emits("delete", props.data!.id);
};
</script>

<style lang="less" scoped>
.gallery-item {
  border-radius: @radius-m;
  background-color: @bg-color-l;

  width: 238;
  &-cover {
    position: relative;
    border-radius: @radius-m @radius-m 0 0;
    overflow: hidden;

    flex: none;
    padding-bottom: 2px;
  }
  &-img-left {
    border-radius: 0 0 0 @radius-m;
    overflow: hidden;
  }
  &-img-right {
    border-radius: 0 0 @radius-m 0;
    overflow: hidden;
  }
  .img-div {
    width: 78px;
    height: 78px;
    background-color: @gray-2;
  }
  &-unpublish {
    position: absolute;
    bottom: 0;
    width: 100%;
    text-align: center;
    background-color: rgba(63, 143, 159, 0.8);
    line-height: 36px;
    color: @white;
    font-weight: 600;
  }
  &-title {
    .font-l();
    padding-top: @space-m;
    font-weight: 600;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    text-overflow: ellipsis;
  }

  &-datas {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  &-control {
    position: absolute;
    right: @space-l;
    top: @space-l;
    background-color: rgba(255, 255, 255, 0.56);
    border-radius: @radius-m;
    padding: @space-ss;
    opacity: 0;
    .yk-icon {
      width: 24px;
      height: 24px;
      padding: 5px;
      color: @gray;
      cursor: pointer;
      &:hover {
        color: @pcolor;
      }
    }
    &:hover {
      background-color: rgba(255, 255, 255, 0.64);
      backdrop-filter: blur(2px);
    }
  }
  &:hover {
    .gallery-item-control {
      opacity: 1;
    }
  }
}
</style>
<style lang="less">
.gallery-item {
  .yk-image__img {
    border-radius: 0;
  }
}
</style>
