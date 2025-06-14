<template>
  <div class="head-bar">
    <yk-space
      align="center"
      :size="12"
      style="cursor: pointer"
      @click="backHome"
    >
      <img
        src="/src/assets/logo.svg"
        style="width: 32px; height: 32px"
        class="logo"
      />
      <span class="name">BBJ-blog</span>
    </yk-space>
    <yk-space align="center" size="xl">
      <yk-badge is-dot :hidden="noread">
        <IconMailOutline style="font-size: 20px" @click="changeActive(true)" />
      </yk-badge>
      <!-- 头像 -->
      <yk-avatar
        img-url="https://www.huohuo90.com:3003/user/6353b034dd4b583975e77fbe.png"
      ></yk-avatar>
      <div><yk-theme /></div>
      <yk-button size="m" @click="logOut" style="font-weight: 600"
        >EXIT
      </yk-button>
    </yk-space>
    <information :active="active" @close="changeActive(false)"></information>
  </div>
</template>

<script lang="ts" setup>
import { useRouter } from "vue-router";
import { onMounted, ref } from "vue";
import information from "../reply/information.vue";
import { isRegisterApi } from "../../api";
import { useCode } from "../../hooks/code";
import { useUserStore } from "../store/user";
import { noreadMessageApi } from "../../api";

const router = useRouter();
const active = ref<boolean>(false);
const userStore = useUserStore();

//code验证
const { tackleCode } = useCode();
//func:返回总览
const backHome = () => {
  router.push("/");
};
//func:展开关闭私信
const changeActive = (e: boolean) => {
  active.value = e;
};

const isRegister = () => {
  isRegisterApi(userStore.token).then((res: any) => {
    // console.log(res);
    if (tackleCode(res.code)) {
      //已注册
      isLogin();
    }
  });
};
//是否登录
const isLogin = () => {
  if (!userStore.token) {
    router.push("/login");
  }
};

//获取未读私信总数
const noread = ref(false);

const noreadMsg = () => {
  let data = {
    token: userStore.token,
  };
  noreadMessageApi(data).then((res: any) => {
    if (tackleCode(res.code)) {
      if (res.data === 0) {
        noread.value = true;
      }
    }
  });
};
//退出
const logOut = () => {
  userStore.$patch({
    id: -1,
    name: "",
    token: "",
  });
  router.push("/login");
};
onMounted(() => {
  isRegister();
  noreadMsg();
});
</script>

<style lang="less" scoped>
.head-bar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 64px;
  background-color: @bg-color-l;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 @space-xl;
}
.logo {
  height: 24px;
  width: 38px;
}
.name {
  font-size: 20px;
  font-weight: 800;
}
</style>
