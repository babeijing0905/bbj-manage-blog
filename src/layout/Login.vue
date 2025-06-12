<template>
  <div class="login" :style="{ height: pageHeight + 'px' }">
    <yk-space dir="vertical" :size="48" class="login-main" align="center">
      <yk-space dir="vertical" align="center">
        <!--   todo：图标 -->
        <img
          src="../assets/logo.svg"
          style="width: 60px; height: 60px"
          class="logo"
        />
        <span class="name">Welcome to BBJ's Blog</span>
      </yk-space>

      <yk-space dir="vertical">
        <yk-input
          v-model="user.name"
          clearable
          placeholder="用户名"
          style="width: 320px"
          size="xl"
        />
        <yk-input
          v-model="user.psw"
          clearable
          placeholder="密码"
          type="password"
          style="width: 320px"
          size="xl"
        />
      </yk-space>
      <yk-space dir="vertical" style="width: 100%">
        <yk-button long @click="submit" size="xl">登录</yk-button>
        <yk-button long type="secondary" @click="toRegister" size="xl"
          >没有账号，去注册</yk-button
        >
      </yk-space>
    </yk-space>
  </div>
</template>

<script lang="ts" setup>
import { ref, getCurrentInstance } from "vue";
import { signinApi } from "../api";

import { useRouter } from "vue-router";
import { useUserStore } from "../components/store/user";

const router = useRouter();
//code验证
const userStore = useUserStore();
const proxy: any = getCurrentInstance()?.proxy;
//获取页面高度
const pageHeight = ref(window.innerHeight);
//用户
const user = ref({
  name: "",
  psw: "",
});
//提交
const submit = () => {
  if (user.value.name && user.value.psw.length > 3) {
    let data = {
      name: user.value.name,
      password: user.value.psw,
    };
    signinApi(data).then((res: any) => {
      if (res.code == 200) {
        userStore.$patch(res.data);
        //console.log(userStore.name);

        router.push("/");
      } else if (res.code == 400) {
        proxy.$message({ type: "error", message: "用户名或密码错误" });
      }
    });
  } else {
    proxy.$message({ type: "warning", message: "输入不完整" });
  }
};
//跳转登录页面
const toRegister = () => {
  router.push("/register");
};
</script>

<style lang="less" scoped>
.login {
  z-index: 10;
  position: fixed;
  top: 0;
  left: 0;
  background-color: @bg-color-m;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  &-main {
    padding: 48px;
    border-radius: @radius-xl;
    background-color: @bg-color-l;
    .name {
      font-size: 20px;
      font-weight: 600;
    }
    .logo {
      width: 24px;
      height: 24px;
    }
  }
}
</style>
