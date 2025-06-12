<template>
  <div class="files-item">
    <div
      class="files-item-img"
      :class="{ 'files-item-selected': props.data?.selected }"
    >
      <yk-image
        :src="url"
        width="200"
        height="200"
        :is-lazy="true"
        fit="cover"
      ></yk-image>
      <yk-space class="files-item-img-tool" size="s">
        <IconDeleteOutline class="files-tool-delete" @click="deleteFile" />
        <yk-popconfirm
          title="选择分组"
          placement="bottomRight"
          @cancel="cancel"
          @confirm="confirm"
        >
          <IconSwitchOutline class="files-tool-switch" />

          <template #content>
            <yk-scrollbar ref="scrollbar" height="148px" class="subset">
              <div
                v-for="item in subsetStore.data"
                class="subset-item"
                :class="{ 'subset-selected': subsetSelectedId == item.id }"
                @click="changeOption(item.id)"
              >
                {{ item.name }}{{ item.value }}
              </div>
            </yk-scrollbar>
          </template>
        </yk-popconfirm>
      </yk-space>
      <div class="files-item-img-check" @click="checkFile">
        <IconTickMinOutline style="color: #fff; font-size: 24px" />
      </div>
    </div>
    <p class="files-item-name">
      {{ props.data?.fileName }}.{{ props.data?.format }}
    </p>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import type { FileData } from "../../utils/interface";
import { getCurrentInstance } from "vue";

import { ref } from "vue";
import { useSubsetStore } from "../store/subset";

import "./files.less";

type FileItemProps = {
  data?: FileData;
};
const subsetStore = useSubsetStore();

const props = withDefaults(defineProps<FileItemProps>(), {});
//图片路径
const url = computed(() => {
  return `/src/assets/image/${props.data?.url}`;
});
const emits = defineEmits(["changeSubsetId", "delete", "selected"]);
//func：分类选择
const subsetSelectedId = ref<number | string>(props.data?.subsetId!);
//切换分组
const changeOption = (e: number | string) => {
  subsetSelectedId.value = e;
};

const proxy: any = getCurrentInstance()?.proxy;
function cancel() {
  proxy.$message({ type: "warning", message: "你点击了取消按钮" });
}

function confirm() {
  //如果当前选择与之前不同时
  if (subsetSelectedId.value != props.data?.subsetId) {
    let data = {
      id: props.data?.id,
      subsetId: subsetSelectedId.value,
    };
    emits("changeSubsetId", data);
  }
}
//func：删除
const deleteFile = () => {
  emits("delete", props.data?.id);
};
//选择
const checkFile = () => {
  emits("selected", props.data?.id);
};
</script>

<style lang="less" scoped>
.files-item {
  &-img {
    position: relative;
    background-color: @pcolor-1;
    border-radius: @radius-s;
    border: 2px solid @bg-color-l;

    &-tool {
      position: absolute;
      right: @space-s;
      bottom: @space-s;
      opacity: 0;
      .yk-icon {
        width: 32px;
        height: 32px;
        padding: 8px;
        background-color: rgba(255, 255, 255, 0.56);
        border-radius: @radius-m;
        transition: all @animatb;
        cursor: pointer;
        &:hover {
          color: @pcolor;
          background-color: rgba(255, 255, 255, 0.72);
          backdrop-filter: blur(2px);
        }
      }
    }
    &-check {
      width: 26px;
      height: 26px;
      border-radius: @radius-s;
      background-color: @gray-4;
      position: absolute;
      left: @space-s;
      top: @space-s;

      border: 1px solid rgba(255, 255, 255, 0.56);
      cursor: pointer;
      opacity: 0;
      .yk-icon {
        opacity: 1;
      }
    }
    &:hover {
      background-color: @pcolor-1;
      .files-item-img-check {
        opacity: 1;
      }
      .files-item-img-tool {
        opacity: 1;
      }
    }
  }
  &-selected {
    background-color: @pcolor-1;

    .files-item-img-check {
      background-color: @pcolor;
      opacity: 1;
      .yk-icon {
        opacity: 1;
      }
    }
    .files-item-img-tool {
      opacity: 0;
    }

    &:hover {
      background-color: @pcolor-1;
      .files-item-img-check {
        opacity: 1;
      }
      .files-item-img-tool {
        opacity: 0;
      }
    }
  }
  &-name {
    padding-top: @space-l;
    text-align: center;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    text-overflow: ellipsis;
  }
}
</style>
