<template>
  <div class="diary">
    <yk-space
      dir="vertical"
      size="xl"
      style="width: 100%; padding-bottom: 24px"
    >
      <diaryItem
        v-for="item in diaryList"
        :data="item"
        :key="item.id"
        @delete="deleteDiary"
      />
    </yk-space>
    <div class="diary-pagination">
      <yk-pagination :total="count" size="m" @change="changePage" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, getCurrentInstance } from "vue";
import diaryItem from "./diaryItem.vue";
import { mkdiary } from "../../mock/data";
import type { DiaryData } from "../../utils/interface";

const proxy: any = getCurrentInstance()?.proxy;
const props = defineProps({
  pageSize: {
    type: Number,
    default: 6,
  },

  searchTerm: {
    type: String,
    default: "",
  },
});
type Request = {
  token?: string;
  pageSize: number; //单页条数；
  nowPage: number; //当前页
  state?: number; //状态
  subsetId?: number; //分组
  serchTerm?: string | number; //搜索词条
  count?: boolean;
};
const request = {
  pageSize: props.pageSize,

  nowPage: 2, //单页条数；

  searchTerm: props.searchTerm, //搜索词条
  count: true,
};
//获取随记
const diaryList = ref<DiaryData[]>([]);
//随记总数
const count = ref<number>(0);
//当前页码

const getData = () => {
  if (request.nowPage === 1) {
    count.value = mkdiary.count;
  }
  let arr = mkdiary.list.slice(
    (request.nowPage - 1) * request.pageSize,
    request.nowPage * request.pageSize
  );
  diaryList.value = [...arr];
  console.log(diaryList.value);
};
//删除
const deleteDiary = (e: any) => {
  diaryList.value = diaryList.value.filter((obj: any) => {
    return obj.id !== e;
  });
  proxy.$message({ type: "primary", message: "删除完成" });
};

//func:翻页
const changePage = (e: number) => {
  request.nowPage = e;
  getData();
};
onMounted(() => {
  getData();
});
</script>

<style lang="less" scoped>
.diary {
  width: 100%;

  &-pagination {
    padding: @space-s 0;
    display: flex;
    align-items: center;
    justify-content: flex-end;

    width: 100%;
  }
}
</style>
