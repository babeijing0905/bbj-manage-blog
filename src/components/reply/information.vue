<template>
  <yk-drawer
    placement="right"
    :show="active"
    @close="closes"
    :title="'私信' + count"
  >
    <yk-space dir="vertical">
      <reply
        v-for="item in messages"
        :key="item.id"
        :content="item"
        style="width: 100%"
        @delete="deleteMsg"
        :isComment="false"
        @click="changeIsRead(item.id)"
      ></reply
    ></yk-space>
    <template #footer>
      <yk-pagination
        :total="count"
        @change="changePage"
        simple
        :default-page-size="props.pageSize"
      />
    </template>
  </yk-drawer>
</template>

<script lang="ts" setup>
import { getCurrentInstance, onMounted, ref } from "vue";
import { toRefs } from "vue";
import type { InformationProps } from "./reply";
//import { comment } from "../../mock/data";

import { deleteMessageApi, readMessageApi } from "../../api";
import { messageApi } from "../../api";
import { useUserStore } from "../store/user";
import { useCode } from "../../hooks/code";

const userStore = useUserStore();
const { tackleCode } = useCode();
const proxy: any = getCurrentInstance()?.proxy;
const props = withDefaults(defineProps<InformationProps>(), {
  pageSize: 4,
  height: "650px",
});
const emits = defineEmits(["close"]);
const { active } = toRefs(props);
const closes = () => {
  emits("close", false);
};
//总数

const count = ref<number>(123);
//数据内容
const messages = ref();
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
const getData = (e: boolean) => {
  request.count = e;
  messageApi(request).then((res: any) => {
    if (tackleCode(res.code)) {
      if (res.data.count) {
        count.value = res.data.count;
      }

      messages.value = res.data.list;
      //console.log(messages.value);
    }
  });
  /*  let data = comment.data;

   */
};
//func:删除评论
const deleteMsg = (e: number) => {
  let request = {
    token: userStore.token,
    id: e,
  };
  deleteMessageApi(request).then((res: any) => {
    if (tackleCode(res.code)) {
      messages.value = messages.value.filter((obj: any) => {
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
  readMessageApi(request).then((res: any) => {
    if (tackleCode(res.code)) {
      //处理前端的已读
      for (let i = 0; i < messages.value.length; i++) {
        if (messages.value[i].id === e) {
          messages.value[i].isread = 1;
        }
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

<style lang="less" scoped></style>
