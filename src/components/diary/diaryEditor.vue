<template>
  <div class="diary-editor">
    <div class="diary-editor-form">
      <div class="diary-editor-form-top">
        <input
          type="text"
          class="diary-editor-form-title"
          placeholder="请输入标题"
          v-model="diaryForm.title"
        />
        <yk-popover placement="bottomRight" title="选择天气">
          <template #content>
            <yk-space wrap :size="[32, 20]" style="padding: 16px 0 16px 14px"
              ><div
                class="diary-editor-weather"
                v-for="item in weather"
                :class="{ selected: diaryForm.weatherId == item.id }"
                @click="selectWeather(item.id)"
              >
                <img
                  :src="'/src/assets/image/weather/' + item.icon"
                  style="width: 24px"
                /></div
            ></yk-space>
          </template>
          <img
            :src="
              '/src/assets/image/weather/' + weather[diaryForm.weatherId].icon
            "
            style="width: 32px"
          />
        </yk-popover>
      </div>
      <yk-text-area
        v-model="diaryForm.content"
        :maxLength="1600"
        placeholder="请输入..."
        :auto-size="{
          minRows: 24,
          maxRows: 24,
        }"
      ></yk-text-area>
      <div class="diary-editor-form-picture">
        <yk-upload
          :upload-url="uploadUrl"
          :file-list="diaryForm.picture"
          accept="image/*"
        ></yk-upload>
      </div>
    </div>
    <div class="diary-editor-foot">
      <yk-space size="s">
        <yk-button type="secondary">取消</yk-button>
        <yk-button>新建</yk-button>
      </yk-space>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { weather } from "../../utils/weather";
type DiaryForm = {
  title?: string;
  weatherId?: number;
  content?: string;
  picture?: string[];
};
const diaryForm = ref<DiaryForm>({ weatherId: 0 });
//todo:上传地址
const uploadUrl = "https://www.huohuo90.com:3005/upload";
//选择天气
const selectWeather = (id: number) => {
  diaryForm.value.weatherId = id;
};
</script>

<style lang="less" scoped>
.diary-editor {
  background-color: @bg-color-l;
  border-radius: @radius-m;
  width: 100%;
  &-form {
    padding: @space-xl;
    &-title {
      font-size: @size-xl;
      font-weight: bold;
      color: @font-color-l;
      padding-bottom: @space-m;
    }
    &-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      input {
        border: none;
        background: transparent;

        outline: none;
        &::placeholder {
          color: @gray-4;
        }
      }
      .selected {
        &::before {
          position: absolute;
          bottom: -6px;
          left: 9px;
          content: "";
          display: block;
          width: 6px;
          height: 6px;
          border-radius: 4px;
          background: @pcolor;
        }
      }
    }
    &-picture {
      padding-top: @space-xl;
    }
  }

  &-foot {
    display: flex;
    justify-content: end;
    padding: @space-m;
    border-top: 1px solid @line-color-s;
  }
}
</style>
<style lang="less">
.diary-editor {
  .yk-text-area {
    background-color: transparent;
    border: none;
    border-radius: 0;
    padding: 0px;
  }
  .yk-text-area__inner {
    font-size: @size-m;
    line-height: 1.5;
    &::placeholder {
      color: @gray-5;
    }
  }
}
</style>
