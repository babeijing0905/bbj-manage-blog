<template>
  <div class="subset">
    <yk-space wrap>
      <!--  note:这是一个动态类绑定的写法。selected == -1 是一个条件表达式，当 -->
      <!--  selected 的值等于 -1 时，'subset-menu-selected' 这个类名会被添加 -->
      <div
        class="subset-menu"
        :class="{ 'subset-menu-selected': selected == '-1all' }"
        @click="changeOption(-1, 'all')"
      >
        全部{{ subsetStore.count }}
      </div>

      <div
        class="subset-menu"
        v-for="item in state.data"
        :key="item.id"
        :class="{ 'subset-menu-selected': selected == item.id + 'state' }"
        @click="changeOption(item.id, 'state')"
        v-if="props.classify === 0"
      >
        {{ item.name }}{{ item.value }}
      </div>
      <div
        class="subset-menu"
        :class="{
          'subset-menu-selected': selected == subsetStore.exclude + 'exclude',
        }"
        @click="changeOption(subsetStore.exclude.id, 'exclude')"
      >
        {{ subsetStore.exclude.name }}{{ subsetStore.exclude.name }}
      </div>
      <div
        class="subset-menu"
        v-for="item in subsetStore.data"
        :key="item.id"
        :class="{ 'subset-menu-selected': selected == item.id + 'subset' }"
        @click="changeOption(item.id, 'subset')"
      >
        {{ item.name }} {{ item.value }}
      </div>
    </yk-space>
    <yk-space style="flex: none">
      <yk-popconfirm
        title="新建分组"
        @cancel="cancel"
        @confirm="confirm(props.classify)"
        trigger="click"
        placement="bottom"
      >
        <yk-text type="primary"
          ><IconCirclePlusOutline style="margin-right: 4px" />新建</yk-text
        >
        <template #content>
          <div style="margin: 8px 4px 16px">
            <yk-input
              show-counter
              :limit="6"
              palceholder="请输入"
              style="width: 208px"
              v-model="inputValue"
            ></yk-input>
          </div>
        </template>
      </yk-popconfirm>
      <yk-text type="primary" @click="showModal"
        ><IconSettingsOutline style="margin-right: 4px" />管理分组</yk-text
      >
    </yk-space>
    <yk-modal v-model="visible" title="这里是标题">
      <subsetManage></subsetManage>
      <template #footer>
        <yk-button @click="showModal">确定</yk-button>
      </template>
    </yk-modal>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, watchEffect } from "vue";

import subsetManage from "./subsetManage.vue";

import { useSubsetStore } from "../store/subset";

import { state } from "../../mock/data";
import { useSubset } from "../../hooks/subset";
//store
const subsetStore = useSubsetStore();
const {
  inputValue,
  selected,
  changeOption,
  cancel,
  rawSubset,
  confirm,
  visible,
  showModal,
} = useSubset();
const props = defineProps({
  classify: {
    default: -1,
    type: Number,
  },
});

onMounted(() => {
  rawSubset(props.classify);
  watchEffect(() => {
    console.log("watch subsetStore.data", subsetStore.data);
  });
});
</script>

<style lang="less" scoped>
.subset {
  width: 100%;
  padding: @space-l @space-xl;
  border-radius: @radius-m;
  background-color: @bg-color-l;
  display: flex;
  justify-content: space-between;
  align-items: center;
  .yk-text {
    cursor: pointer;
  }
  &-menu {
    padding: 0 @space-l;
    background-color: @bg-color-m;
    border-radius: @radius-r;
    line-height: 32px;
    user-select: none;
    cursor: pointer;
    &-selected {
      background-color: @pcolor-1;
      color: @pcolor;
      font-weight: 500;
    }
  }
}
</style>
