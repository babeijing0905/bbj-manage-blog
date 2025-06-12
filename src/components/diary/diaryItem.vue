<template>
  <div class="diary-item">
    <yk-space dir="vertical">
      <div class="diary-item-toptitle">
        <yk-space dir="vertical" :size="4">
          <p class="diary-item-title">
            {{ props.data.title }}
            <img
              :src="'/src/assets/image/weather/' + weather[props.data?.weatherId!].icon"
              style="width: 24px"
            />
          </p>

          <yk-text type="third">{{ momentl(props.data?.moment) }}</yk-text>
        </yk-space>
        <yk-popconfirm
          trigger="click"
          placement="topRight"
          title="确定删除"
          content="删除将不可恢复"
          @confirm="deletediary()"
        >
          <IconDeleteOutline class="diary-item-delete" />
        </yk-popconfirm>
      </div>
      <yk-text>{{ props.data?.content }}</yk-text>
      <div class="images">
        <yk-image-preview-group
          :src-list="pictures"
          width="80"
          height="80"
          fit="cover"
        ></yk-image-preview-group>
      </div>
    </yk-space>
  </div>
</template>

<script lang="ts" setup>
import type { DiaryData } from "../../utils/interface";
import { weather } from "../../utils/weather";
import { momentl } from "../../utils/moment";
import { computed } from "vue";
type diaryItemProps = {
  data?: DiaryData;
};
const props = withDefaults(defineProps<diaryItemProps>(), {});
const emits = defineEmits(["delete"]);

//图片处理
const pictures = computed(() => {
  if (props.data?.picture) {
    //note：深拷贝
    let arr = JSON.parse(JSON.stringify(props.data?.picture));
    for (let i = 0; i < arr.length; i++) {
      arr[i] = `./src/assets/image/${arr[i]}`;
    }
    return arr;
  }
  return " ";
});
//删除
const deletediary = () => {
  emits("delete", props.data!.id);
};
</script>

<style lang="less" scoped>
.diary-item {
  border-radius: @radius-m;
  padding: @space-xl;
  background-color: @bg-color-l;

  width: 100%;
  &-toptitle {
    display: flex;
    justify-content: space-between;
    width: 100%;
  }
  &-title {
    display: flex;
    align-items: center;
    font-size: 20px;
    font-weight: 600;
    img {
      margin-left: @space-s;
    }
  }
  &-delete {
    width: 20px;
    height: 20px;
    padding: 2px;
    color: @font-color-s;
    transition: color @animatb;
    display: none;
    &:hover {
      color: @font-color-l;
    }
  }
  &:hover {
    .diary-item-delete {
      display: block;
    }
  }
}
</style>
<style lang="less">
.images {
  .yk-space {
    gap: 8px;
  }
  .yk-image {
    border-radius: 8px;
  }
}
</style>
