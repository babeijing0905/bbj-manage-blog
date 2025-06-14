<template>
  <yk-space dir="vertical" class="menu-bar">
    <router-link
      :to="item.path"
      v-for="item in navLinks"
      :key="item.path"
      class="menu-bar_nav"
    >
      <yk-space align="center" size="m">
        <component :is="item.icon" />
        <yk-text>{{ item.name }}</yk-text>
      </yk-space>
    </router-link>

    <!-- 添加模型组件和跳转按钮 -->
    <div class="model-container" v-if="!isDigitalHumanPage">
      <SimpleModel class="model" />
      <yk-button
        class="jump-btn"
        type="secondary"
        size="m"
        status="success"
        @click="jumpToDigitalHuman"
      >
        进入数字人
      </yk-button>
    </div>
  </yk-space>
</template>

<script lang="ts" setup>
import { navLinks } from "../../utils/menu";
import SimpleModel from "../digital-human/SimpleModel.vue";
import { useRouter, useRoute } from "vue-router";
import { computed } from "vue";

const router = useRouter();
const route = useRoute();

const isDigitalHumanPage = computed(() => {
  return route.path === "/digital-human";
});

const jumpToDigitalHuman = () => {
  router.push("/digital-human");
};
</script>

<style lang="less" scoped>
.menu-bar {
  padding: @space-l;
  position: fixed;
  top: 72px;
  left: 8px;
  z-index: 100;

  &_nav {
    width: 160px;
    height: 40px;
    background: @bg-color-l;
    border-radius: @radius-m;
    padding: 0 @space-l;
    display: flex;
    align-items: center;
    text-decoration: none;
    .yk-icon {
      color: @font-color-ss;
      width: 16px;
      height: 16px;
    }
    &:hover {
      background: @bg-color-l;
      .yk-text {
        font-weight: 600;
      }
    }
  }
  .router-link-active {
    background: linear-gradient(180deg, #82cbae 0%, #66c0a4 100%);
    .yk-icon {
      color: @white;
      width: 16px;
      height: 16px;
    }
    .yk-text {
      color: @white;
      font-weight: 600;
    }
  }
}
.model-container {
  position: absolute;
  left: -160px;
  bottom: -480px;
  width: 500px;
  height: 600px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: @space-m;

  .model {
    width: 100%;
    height: calc(100% - 40px);
    border-radius: @radius-l;
    overflow: hidden;
  }

  .jump-btn {
    position: absolute;
    bottom: 140px;
    left: 210px;
  }
}
</style>
