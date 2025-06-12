<template>
  <yk-space class="gather">
    <div
      v-for="(item, index) in gathers"
      :key="index"
      class="gather-list"
      :style="{ background: 'linear-gradient(' + item.bgcolor + ')' }"
    >
      <yk-space dir="vertical" size="s">
        <yk-text type="secondary">{{ item.name }}</yk-text>
        <yk-title :level="2" size="xl">{{ item.total }}</yk-title>
      </yk-space>
      <yk-button
        v-if="index > 0"
        size="xl"
        type="secondary"
        shape="square"
        @click="editPage(item.path)"
      >
        <IconPlusOutline />
      </yk-button>
    </div>
  </yk-space>
</template>

<script lang="ts" setup>
import { overLink } from "../../utils/menu";
import { onMounted, ref } from "vue";
//import { overview } from "../../mock/data";
import { useRouter } from "vue-router";
import { overviewApi } from "../../api";
import { useUserStore } from "../store/user";
import { useCode } from "../../hooks/code";

const userStore = useUserStore();
const { tackleCode } = useCode();

const router = useRouter();
const gathers = ref(overLink);

//func:获取数据
const getGatherData = () => {
  let request = {
    token: userStore.token,
  };
  overviewApi(request).then((res: any) => {
    if (tackleCode(res.code)) {
      //获得返回数据
      console.log(userStore.token);
      let data = res.data;
      gathers.value[0].total = data.file;
      gathers.value[1].total = data.article;
      gathers.value[2].total = data.gallery;
      gathers.value[3].total = data.diary;
    }
  });
  //let data = overview.data;
};
//func跳转到编辑页面
const editPage = (n: string) => {
  router.push(n);
};
onMounted(() => {
  getGatherData();
});
</script>

<style lang="less" scoped>
.gather {
  width: 100%;
  &-list {
    width: 25%;
    background-color: #fff;
    display: flex;
    justify-content: space-between;
    padding: @space-xl;
    border-radius: @radius-l;
    align-items: center;
    &:first-child {
      .yk-title,
      .yk-text {
        color: @white;
      }
    }
  }
}
</style>
