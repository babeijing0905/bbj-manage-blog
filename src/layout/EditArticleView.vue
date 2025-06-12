<template>
  <div class="edit-article">
    <div class="edit-article-topbar">
      <p class="edit-article-topbar-title">新建博客</p>
      <yk-space align="center">
        <yk-text type="secondary" v-show="nowMoment">{{ nowMoment }}</yk-text>
        <yk-button type="secondary" @click="submit(0)">保存</yk-button
        ><yk-button @click="submit(1)">发布</yk-button></yk-space
      >
    </div>

    <editorComponent style="width: 1200px" @editors="editorData">
      <formsComponent style="width: 820px" :classify="0" @formData="formData"
    /></editorComponent>
  </div>
</template>

<script lang="ts" setup>
import editorComponent from "../components/editor/editorComponent.vue";
import formsComponent from "../components/forms/formsComponent.vue";
import { ref, getCurrentInstance } from "vue";
import { timeT } from "../utils/moment";
const proxy: any = getCurrentInstance()?.proxy;
//收取form内容
const form = ref();
const formData = (e: any) => {
  form.value = e;
};
//接受editor内容
const editors = ref();
const editorData = (e: any) => {
  editors.value = e;
};
const nowMoment = ref();
const submit = (e: number) => {
  if (form.value && form.value.title) {
    if (e == 0) {
      let nowTime = new Date();
      nowMoment.value = timeT(nowTime);
    }
    let request = {
      ...form.value,
      ...{
        content: editors.value,
        state: e,
        classify: 0,
        moment: new Date(),
      },
    };
    console.log(request);
  } else {
    proxy.$message({ type: "warning", message: "请输入标题" });
  }
};
</script>

<style lang="less" scoped>
.edit-article {
  padding: @space-xl 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  &-topbar {
    border-radius: @radius-m;
    background-color: @bg-color-l;
    padding: @space-l @space-xl;
    margin-bottom: @space-l;
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 1200px;

    &-title {
      .font-xl();
      font-weight: 600;
    }
  }
}
</style>
