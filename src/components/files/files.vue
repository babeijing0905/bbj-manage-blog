<template>
  <div class="files">
    <div class="files-tool">
      <yk-space v-show="selectedFilesId.length > 0">
        <yk-checkbox
          :checked="checkedAll"
          :indeterminate="indeterminate"
          @change="handleChangeAll"
          >全选</yk-checkbox
        >
        <yk-text>已选择 {{ selectedFilesId.length }} 项内容</yk-text>
      </yk-space>
      <yk-space>
        <IconDeleteOutline class="files-tool-delete" @click="deleteFiles" />
        <yk-popconfirm
          title="选择分组"
          placement="bottomRight"
          trigger="click"
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
    </div>
    <div class="files-main">
      <filesItem
        v-for="item in files"
        :data="item"
        :key="item.id"
        @selected="selectFile"
        @delete="deleteFile"
        @changeSubsetId="changeSubset"
      ></filesItem>
    </div>
    <div class="files-pagination">
      <yk-pagination :total="count" size="m" @change="changePage" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue";
import { mkfiles } from "../../mock/data";
import { getCurrentInstance } from "vue";
import filesItem from "./filesItem.vue";
import { useSubsetStore } from "../store/subset";

import "./files.less";

const emits = defineEmits(["nowSubset"]);
//import type { SubsetData } from "../../utils/interface";
//当前选择

//store
const subsetStore = useSubsetStore();
type FileProps = {
  pageSize: number;
  subsetId: number | string;
};
const props = withDefaults(defineProps<FileProps>(), {
  pageSize: 8,
  subsetId: -1,
});
//总数

const count = ref<number>(123);
//数据内容
const files = ref();
//请求
type Request = {
  token?: string;
  pageSize: number; //单页条数
  nowPage: number; //当前页
};
const request: Request = {
  pageSize: props.pageSize,
  nowPage: 1,
};
//func：获取数据
const getfilesData = (e: boolean) => {
  let data = mkfiles;
  if (e) {
    count.value = data.count;
  }
  files.value = data.list.slice(
    (request.nowPage - 1) * request.pageSize,
    request.nowPage * request.pageSize
  );
  //加入选择项
  for (let i = 0; i < files.value.length; i++) {
    files.value[i].selected = false;
  }
};
//part：头部操作
const indeterminate = ref(false);
const checkedAll = ref(false);

const handleChangeAll = (value: boolean) => {
  indeterminate.value = false;
  //先清空选择ID
  selectedFilesId.value = [];
  if (value) {
    checkedAll.value = true;
    for (let i = 0; i < files.value.length; i++) {
      files.value[i].selected = true;
      selectedFilesId.value.push(files.value[i].id);
    }
  } else {
    checkedAll.value = false;
    for (let i = 0; i < files.value.length; i++) {
      files.value[i].selected = false;
    }
  }
};
const selectedFilesId = ref<number[]>([]);
//选择操作
const selectFile = (e: number) => {
  //半选与全选
  for (let i = 0; i < files.value.length; i++) {
    if (files.value[i].id === e) {
      files.value[i].selected = !files.value[i].selected;
      if (files.value[i].selected) {
        selectedFilesId.value.push(files.value[i].id);
      } else {
        //移除
        selectedFilesId.value = selectedFilesId.value.filter((item) => {
          return item !== e;
        });
      }
      if (selectedFilesId.value.length === 0) {
        indeterminate.value = false;
        checkedAll.value = false;
      } else if (selectedFilesId.value.length == files.value.length) {
        indeterminate.value = false;
        checkedAll.value = true;
      } else {
        indeterminate.value = true;
        checkedAll.value = false;
      }
    }
  }
};

//删除单张照片
const deleteFile = (e: number) => {
  files.value = files.value.filter((item: any) => {
    return item.id != e;
  });
};
//全部删除
const deleteFiles = () => {
  if (selectedFilesId.value.length > 0) {
    for (let i = 0; i < selectedFilesId.value.length; i++) {
      files.value = files.value.filter((item: any) => {
        return item.id != selectedFilesId.value[i];
      });
    }
    //清除选择的ID
    selectedFilesId.value = [];
  }
};

//切换图片分组
const changeSubset = (e: any) => {
  proxy.$message({ type: "primary", message: e.id });
};

//func:翻页
const changePage = (e: number) => {
  request.nowPage = e;
  getfilesData(false);
};
//func：分类选择
const subsetSelectedId = ref<number | string>();
//切换分组
const changeOption = (e: number | string) => {
  subsetSelectedId.value = e;
};

const proxy: any = getCurrentInstance()?.proxy;
function cancel() {
  proxy.$message({ type: "warning", message: "你点击了取消按钮" });
}
function confirm() {
  proxy.$message({ type: "primary", message: "你点击了确认按钮" });
}
onMounted(() => {
  getfilesData(true);
});
</script>

<style lang="less" scoped>
.files {
  padding: @space-xl;
  border-radius: @radius-l;
  background-color: @bg-color-l;
  width: 100%;
  &-tool {
    padding: @space-l;
    border-radius: @radius-m;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: @bg-color-m;
    &-delete,
    &-switch {
      width: 20px;
      height: 20px;
      color: @font-color-s;
      cursor: pointer;
      &:hover {
        color: @font-color-l;
      }
    }
  }
  &-main {
    padding: 24px 0 32px;
    display: grid;
    grid-template-columns: repeat(auto-fill, 200px);
    row-gap: 32px;
    column-gap: 24px;
    justify-content: center;
  }
  &-pagination {
    padding: @space-l 0 0;
    display: flex;
    align-items: center;
    justify-content: flex-end;

    width: 100%;
  }
}
</style>
