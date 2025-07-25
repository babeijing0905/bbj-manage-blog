<template>
  <div class="article-item">
    <yk-space size="xl">
      <div class="article-item-cover">
        <yk-image
          :src="cover"
          width="160"
          height="120"
          :is-lazy="true"
          :preview="false"
          fit="cover"
        />
        <p class="article-item-unpublish" v-if="props.data.state === 0">
          未发布
        </p>
      </div>
      <div style="width: 100%">
        <p class="article-item-title">{{ props.data?.title }}</p>
        <p class="article-item-introduce">{{ props.data?.introduce }}</p>
        <div class="article-item-datas">
          <yk-space size="xl">
            <yk-text type="secondary">
              {{ subsetStore.subsetName(props.data?.subsetId) }}
              <yk-text type="secondary" v-if="props.data!.label!.length>0"
                >/
                <span
                  v-for="item in props.data.label"
                  style="padding-right: 4px"
                  >{{ item }}</span
                >
              </yk-text>
            </yk-text>
            <yk-text type="third">{{ momentm(props.data?.moment) }}</yk-text>
            <yk-space>
              <yk-text type="third"
                ><IconEyeOutline />{{ props.data?.views }}</yk-text
              >
              <yk-text type="third"
                ><IconLikeOutline />{{ props.data?.praise }}</yk-text
              >
              <yk-text type="third"
                ><IconCommentOutline />{{ props.data?.comment }}</yk-text
              >
            </yk-space>
          </yk-space>
          <yk-space class="article-item-control" size="xl">
            <yk-tooltip
              placement="top"
              title="发布"
              v-if="props.data?.state == 0"
            >
              <IconSendOutline @click="updateState(1)" />
            </yk-tooltip>
            <yk-tooltip
              placement="top"
              title="撤回"
              v-if="props.data?.state == 1"
            >
              <IconRevokeOutline @click="updateState(0)" />
            </yk-tooltip>
            <yk-tooltip placement="top" title="编辑">
              <IconFillFill />
            </yk-tooltip>
            <yk-popconfirm
              trigger="click"
              placement="topRight"
              title="确定删除"
              content="删除将不可恢复"
              @confirm="deleteArticle()"
            >
              <IconDeleteOutline />
            </yk-popconfirm>
          </yk-space>
        </div>
      </div>
    </yk-space>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import type { ArticleData } from "../../utils/interface";
import { useSubsetStore } from "../store/subset";
import { momentm } from "../../utils/moment";

//store
const subsetStore = useSubsetStore();
type ArticleItemProps = {
  data?: ArticleData;
};
const props = withDefaults(defineProps<ArticleItemProps>(), {});
const emits = defineEmits(["delete", "state"]);
//封面地址
const cover = computed(() => {
  return `./src/assets/image/${props.data.cover}`;
});
//删除
const deleteArticle = () => {
  emits("delete", props.data!.id);
};

//修改状态
const updateState = (e: number) => {
  emits("state", { id: props.data!.id, state: e });
};
</script>

<style lang="less" scoped>
.article-item {
  border-radius: @radius-m;
  background-color: @bg-color-l;
  padding: @space-xl;
  width: 100%;
  &-cover {
    position: relative;
    border-radius: @radius-m;
    overflow: hidden;
    width: 160px;
    flex: none;
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
    font-size: 20px;
    font-weight: 600;
  }
  &-introduce {
    .font-m();
    height: 48px;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    text-overflow: ellipsis;
    color: @font-color-l;
    margin-bottom: @space-m;
    max-width: 720px;
  }
  &-datas {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  &-control {
    .yk-icon {
      width: 20px;
      height: 20px;
      color: @font-color-s;
      cursor: pointer;
      &:hover {
        color: @pcolor;
      }
    }
  }
}
</style>
