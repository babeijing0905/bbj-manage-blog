<template>
  <yk-space dir="vertical" style="width: 100%" size="xl">
    <articleItem
      v-for="item in articleList"
      :data="item"
      :key="item.id"
      @delete="deleteArticle"
      @state="updateState"
    />
    <div class="article-pagination">
      <yk-pagination :total="count" size="m" @change="changePage" />
    </div>
  </yk-space>
</template>

<script lang="ts" setup>
import { onMounted, ref, getCurrentInstance } from "vue";
import articleItem from "./articleItem.vue";
import { mkarticle } from "../../mock/data";
import type { ArticleData } from "../../utils/interface";

const proxy: any = getCurrentInstance()?.proxy;
const props = defineProps({
  pageSize: {
    type: Number,
    default: 6,
  },
  subsetId: {
    default: -1,
    type: Number,
  },
  state: {
    default: 0,
    type: Number,
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
  state: props.state, //状态
  subsetId: props.subsetId, //分组
  searchTerm: props.searchTerm, //搜索词条
  count: true,
};
//获取文章
const articleList = ref<ArticleData[]>([]);
//文章总数
const count = ref<number>(0);
//当前页码

const getData = (e: boolean) => {
  if (e) {
    count.value = mkarticle.count;
  }
  let arr = mkarticle.list.slice(
    (request.nowPage - 1) * request.pageSize,
    request.nowPage * request.pageSize
  );
  articleList.value = [...arr];
};
//删除
const deleteArticle = (e: any) => {
  articleList.value = articleList.value.filter((obj: any) => {
    return obj.id !== e;
  });
  proxy.$message({ type: "primary", message: "删除完成" });
};
//修改
const updateState = (e: any) => {
  articleList.value.filter((i: { id: number; state: number }) => {
    if (i.id == e.id) {
      i.state = e.state;
      if (e.state == 1) {
        proxy.$message({ type: "primary", message: "发布成功" });
      } else {
        proxy.$message({ type: "primary", message: "已撤回" });
      }
    }
  });
};
//func:翻页
const changePage = (e: number) => {
  request.nowPage = e;
  getData(false);
};
onMounted(() => {
  getData(true);
});
</script>

<style lang="less" scoped>
.article-pagination {
  padding: @space-s 0 @space-xl;
  display: flex;
  align-items: center;
  justify-content: flex-end;

  width: 100%;
}
</style>
