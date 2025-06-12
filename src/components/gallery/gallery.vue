<template>
  <div class="gallery">
    <div class="gallery-content">
      <div class="gallery-content-files">
        <galleryItem
          v-for="item in articleList"
          :data="item"
          :key="item.id"
          @delete="deleteArticle"
          @state="updateState"
        />
      </div>
    </div>

    <div class="gallery-pagination">
      <yk-pagination :total="count" size="m" @change="changePage" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, getCurrentInstance } from "vue";
import galleryItem from "./galleryItem.vue";
import { mkgallery } from "../../mock/data";
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
    count.value = mkgallery.count;
  }
  let arr = mkgallery.list.slice(
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
.gallery {
  width: 100%;
  background-color: @bg-color-l;
  padding: 32px 24px 24px;
  border-radius: @radius-m;
  &-content {
    display: inline;
    &-files {
      display: grid;
      grid-template-columns: repeat(auto-fill, 238px);
      row-gap: 32px;
      column-gap: 24px;
      justify-content: center;
    }
  }

  &-pagination {
    padding: @space-s 0;
    display: flex;
    align-items: center;
    justify-content: flex-end;

    width: 100%;
  }
}
</style>
