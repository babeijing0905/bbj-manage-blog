<template>
  <yk-space size="m" class="reply">
    <yk-badge is-dot in-dot="true" :border="2" :hidden="content.isread">
      <yk-avatar
        :img-url="urlManage(props.content.userAvatar)"
        v-if="isComment"
        @click="changeIsRead(props.content!.id)"
      ></yk-avatar>
    </yk-badge>

    <yk-space dir="vertical" size="s" class="reply-main">
      <div class="reply-name">
        <yk-text strong>{{ content.userName }}</yk-text>
        <yk-text style="font-size: 12px" type="third">{{
          momentl(content.moment)
        }}</yk-text>
      </div>
      <yk-text type="secondary">{{ content.comment }}</yk-text>
      <yk-space size="s" align="center" v-if="isComment">
        <yk-tag class="tag" type="primary" v-if="content?.article!.id!=null">
          {{ content?.article?.title }}</yk-tag
        >
        <yk-tag v-else> 文章已被删除</yk-tag>

        <yk-text type="danger" v-show="content?.complaint!>0"
          >举报 {{ content.complaint }}</yk-text
        >
      </yk-space>
      <IconDeleteOutline
        class="reply-main-delete"
        @click.stop="deleteReply(props.content.id)"
      />
    </yk-space>
  </yk-space>
</template>

<script lang="ts" setup>
import type { ReplyProps } from "./reply";
import { momentl } from "../../utils/moment";
import { urlManage } from "../../api";
const props = withDefaults(defineProps<ReplyProps>(), {
  isComment: true,
});

//func:delete
const emits = defineEmits(["delete", "isread"]);
const deleteReply = (e: number) => {
  emits("delete", e);
};
//func：已读
const changeIsRead = (e: number) => {
  emits("isread", e);
};
</script>

<style lang="less" scoped>
.reply {
  width: 100%;

  &-main {
    border-bottom: 1px solid @line-color-s;
    width: 100%;
    padding-bottom: @space-l;
    flex: 1;
    position: relative;
    &-delete {
      position: absolute;
      right: 0;
      top: 0;
      width: 16px;
      height: 16px;
      cursor: pointer;
      display: none;
    }
  }
  &-name {
    display: flex;
    flex-direction: column;
  }
  &:hover {
    .reply-main-delete {
      display: block;
    }
  }
}
</style>
