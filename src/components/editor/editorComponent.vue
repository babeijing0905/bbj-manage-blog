<template>
  <yk-affix :offset="60" @change="toolbarTop">
    <Toolbar
      class="toolbar"
      :class="{ istop: top }"
      :editor="editorRef"
      :defaultConfig="toolbarConfig"
      :mode="mode"
    />
  </yk-affix>

  <div class="editor-main">
    <slot></slot>
    <Editor
      style="min-height: 500px; width: 820px; overflow-y: hidden"
      v-model="valueHtml"
      :defaultConfig="editorConfig"
      :mode="mode"
      @onCreated="handleCreated"
      @onChange="onChange"
    />
  </div>
</template>

<script lang="ts" setup>
import "./index.less";

import { onBeforeUnmount, ref, shallowRef } from "vue";
import { Editor, Toolbar } from "@wangeditor/editor-for-vue";
import type { IEditorConfig } from "@wangeditor/editor";
import { colors } from "./colors";
const emits = defineEmits(["editors"]);

// 编辑器实例，必须用 shallowRef
const editorRef = shallowRef();

// 内容 HTML
const valueHtml = ref("<p>hello</p>");
//工具栏固定
const top = ref<boolean>(false);
const toolbarTop = (e: boolean) => {
  top.value = e;
};

//菜单配置
const editorConfig: Partial<IEditorConfig> = {
  MENU_CONF: {
    color: {
      colors: colors,
    },
    bgColor: {
      colors: colors,
    },
    uploadImage: {
      //todo：图片上传地址
      server: "/api/upload",
      /*  async customUpload(file: File, insertFn: InsertFnType) {
        const formData = new FormData();
        formData.append("file", "cover");
        formData.append("id", "bbj");
        uploadApi(formData).then(() => {
          insertFn(url, poster);
        });
      }, */
    },
  },
};
//获取内容
const onChange = () => {
  emits("editors", valueHtml.value);
};

const toolbarConfig = {};

// 组件销毁时，也及时销毁编辑器
onBeforeUnmount(() => {
  const editor = editorRef.value;
  if (editor == null) return;
  editor.destroy();
});

const handleCreated = (editor) => {
  editorRef.value = editor; // 记录 editor 实例，重要！
};
</script>
<style scoped lang="less">
.toolbar {
  border-radius: @radius-s;
  width: 1200px;
  background-color: @bg-color-l;
}
.istop {
  box-shadow: @shadow-m;
}
.editor-main {
  padding-top: @space-xl;
  margin-top: @space-s;
  border-radius: @radius-m;
  background-color: @bg-color-l;
  width: 1200px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
</style>
