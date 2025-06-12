<template>
  <div class="card comment" style="width: 100%">
    <div class="card-title">
      <p class="card-title-name">评论{{ count }}</p>
    </div>
    <yk-scrollbar ref="scrollbar" :height="height" style="padding: 0 24px">
      <yk-space dir="vertical">
        <reply
          v-for="item in comments"
          :key="item.id"
          :content="item"
          style="width: 100%"
          @delete="deleteComment"
          @isread="changeIsRead"
        ></reply
      ></yk-space>
    </yk-scrollbar>
    <div class="comment-pagination">
      <yk-pagination
        :total="count"
        size="m"
        @change="changePage"
        :default-page-size="props.pageSize"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { getCurrentInstance, onMounted, ref } from "vue";
import reply from "./reply.vue";
//import { comment } from "../../mock/data";
import type { CommentProps } from "./reply";

import { commentApi, commentIsreadtApi, deleteCommentApi } from "../../api";
import { useUserStore } from "../store/user";
import { useCode } from "../../hooks/code";

const userStore = useUserStore();
const { tackleCode } = useCode();

const proxy: any = getCurrentInstance()?.proxy;
const props = withDefaults(defineProps<CommentProps>(), {
  pageSize: 4,
  height: "650px",
});
//总数

const count = ref<number>(123);
//数据内容
const comments = ref();
//请求
type Request = {
  token?: string;
  pageSize: number; //单页条数
  nowPage: number; //当前页
  count?: boolean;
};
const request: Request = {
  token: userStore.token,
  pageSize: props.pageSize,
  nowPage: 1,
  count: true,
};
//func：获取数据
const getCommentData = (e: boolean) => {
  request.count = e;
  commentApi(request).then((res: any) => {
    if (tackleCode(res.code)) {
      if (res.data.count) {
        count.value = res.data.count;
      }

      comments.value = res.data.list;
      //console.log(comments.value);
    }
  });
  /*  let data = comment.data;

   */
};
//func:删除评论
const deleteComment = (e: number) => {
  let request = {
    token: userStore.token,
    id: e,
  };
  deleteCommentApi(request).then((res: any) => {
    if (tackleCode(res.code)) {
      comments.value = comments.value.filter((obj: any) => {
        return obj.id !== e;
      });
      proxy.$message({ type: "primary", message: "删除成功" });
    }
  });
};
//func:已读
const changeIsRead = (e: number) => {
  let request = {
    token: userStore.token,
    id: e,
  };
  commentIsreadtApi(request).then((res: any) => {
    if (tackleCode(res.code)) {
      //处理前端的已读
      for (let i = 0; i < comments.value.length; i++) {
        if (comments.value[i].id === e) {
          comments.value[i].isread = 1;
        }
      }
    }
  });
};
//func:翻页
const changePage = (e: number) => {
  request.nowPage = e;
  getCommentData(false);
};
onMounted(() => {
  getCommentData(true);
});
</script>

<style lang="less" scoped>
.comment {
  padding: @space-xl 0 64px;
  position: relative;
  padding-bottom: 64px;
  .card-title-name {
    padding: 0 @space-xl;
  }
  &-pagination {
    padding: @space-l @space-xl;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    border-top: 1px solid @line-color-s;
    position: absolute;
    bottom: 0;
    width: 100%;
    left: 0;
  }
}
</style>
