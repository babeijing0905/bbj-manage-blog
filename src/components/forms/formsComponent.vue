<template>
  <div class="forms">
    <yk-space dir="vertical" size="xl">
      <input
        type="text"
        class="forms-title"
        placeholder="请输入标题"
        v-model="formsData.title"
      />
      <yk-space align="center">
        <div class="subset">
          <input
            type="text"
            placeholder="选择分类"
            disabled
            v-model="subsetName"
            style="width: 110px; line-height: 24px"
          />
          <IconDownOutline />
          <yk-dropdown @selected="subsetSelected">
            <yk-dropdown-item v-for="item in subsetList" :value="item.id">{{
              item.name
            }}</yk-dropdown-item>
          </yk-dropdown>
        </div>
        <yk-space align="center" size="s"
          ><yk-tag
            v-for="(tag, index) in formsData.label"
            :key="index"
            closeable
            shape="round"
            @close="deleteLabel(tag)"
          >
            {{ tag }}
          </yk-tag>
          <yk-text
            type="third"
            @click="showLabel"
            style="cursor: pointer; white-space: nowrap"
            v-show="formsData.label.length < 3"
          >
            插入标签
          </yk-text>
        </yk-space>
      </yk-space>
      <div :class="{ introduce: props.classify == 0 }">
        <yk-text-area
          v-model="formsData.introduce"
          placeholder="请输入简介..."
          :maxLength="800"
          :auto-size="raws"
        ></yk-text-area>
      </div>
    </yk-space>
    <div class="forms-cover" v-if="props.classify == 0">
      <yk-upload
        :upload-url="uploadUrl"
        :file-list="fileUrl"
        :limit="1"
        accept="image/*"
        @handle-success="handleSuccess"
        :handle-beforeUpload="handleBeforeUpload"
      ></yk-upload>
    </div>
    <yk-modal v-model="visible" title="标签" size="s" :show-footer="false">
      <yk-space dir="vertical" size="l">
        <yk-input
          v-model="inputValue"
          placeholder="请输入标签并点击确定"
          style="width: 280px"
          @submit="addLabel"
        ></yk-input>
        <yk-space size="s">
          <yk-tag
            v-for="(tag, index) in formsData.label"
            :key="index"
            closeable
            shape="round"
            @close="deleteLabel(tag)"
          >
            {{ tag }}
          </yk-tag>
        </yk-space>
        <yk-space wrap size="s" style="padding-top: 8px">
          <yk-tag
            v-for="(tag, index) in labelArr"
            :key="index"
            shape="round"
            style="cursor: pointer"
            @click="selectLabel(tag)"
          >
            {{ tag }}
          </yk-tag>
        </yk-space>
      </yk-space>
    </yk-modal>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, watch } from "vue";
import { baseUrl } from "../../utils/env";
import { useSubset } from "../../hooks/subset";
import { useLabel } from "../../hooks/label";
import { useSubsetStore } from "../store/subset";
import { useUserStore } from "../store/user";
import { useCode } from "../../hooks/code";

const { tackleCode } = useCode();
const subsetStore = useSubsetStore();
const userStore = useUserStore();
const { rawSubset } = useSubset();
const { rawlabel, label, inputValue, confirm } = useLabel();
const props = defineProps({
  classify: {
    default: 0,
    type: Number,
  },
});

const emits = defineEmits(["formData"]);
const formsData = ref<any>({
  title: "",
  subset_id: undefined,
  label: [], //标签
  introduce: "",
  cover: "",
  classify: props.classify,
});
//简介行数
const raws = computed(() => {
  if (props.classify == 1) {
    return {
      minRaws: 24,
      maxRaws: 30,
    };
  } else {
    return {
      minRaws: 4,
      maxRaws: 10,
    };
  }
});
//分类名称
const subsetName = ref();
//选择分类
const subsetSelected = (e: number) => {
  formsData.value.subset_id != e;
  for (let i = 0; i < subsetList.value.length; i++) {
    if (e === subsetList.value[i].id) {
      subsetName.value = subsetList.value[i].name;
    }
  }
};
//获取分类
const subsetList = ref();
subsetList.value = subsetStore.data;

//标签

//所有标签

const labelArr = ref<any[]>([]);

//标签弹窗
const visible = ref<boolean>(false);
const showLabel = () => {
  visible.value = true;
};
//增加标签
const addLabel = () => {
  if (inputValue.value && formsData.value.label.length < 3) {
    confirm();
    formsData.value.label.push(inputValue.value);
  }
};
//选择标签
const selectLabel = (e: number | string) => {
  if (formsData.value.label.length < 3) {
    formsData.value.label.push(e);
    labelArr.value = labelArr.value.filter((obj: number | string) => {
      return obj != e;
    });
  }
};

//删除标签
const deleteLabel = (e: number | string) => {
  labelArr.value.unshift(e);
  formsData.value.label = formsData.value.label.filter(
    (obj: number | string) => {
      return obj != e;
    }
  );
};
//封面
const uploadUrl = `${baseUrl}/upload`;
const fileUrl = ref([]);

//图片提交成功
const handleSuccess = (res: any) => {
  if (tackleCode(res.code)) {
    let photoUrl = { name: res.data.fileName, url: baseUrl + res.data.url };
    fileUrl.value.push(photoUrl);
    formsData.value.cover = res.data.url;
  }
};

//bug：14文件上传
const handleBeforeUpload = async (rawFile: File) => {
  const formData = new FormData();
  formData.append("file", rawFile); // 添加文件字段
  formData.append("token", userStore.token); // 添加 token 到 body 中
  formData.append("subsetId", "1");
  console.log(formData);
  try {
    const response = await fetch(uploadUrl, {
      method: "POST",
      body: formData,
    });

    const result = await response.json();
    console.log(result);

    /*   if (response.ok) {
      // 假设组件会将当前文件列表传入回调，使用 empty array 占位
      handleSuccess(result, []);
    } else {
      handleError(result, []);
    } */
  } catch (err) {
    console.log(formData);
    /* handleError(err, []); */
  }

  return false; // 阻止默认上传行为
};

watch(formsData.value, (e) => {
  emits("formData", e);
});
watch(
  () => subsetStore.data,
  (e) => {
    subsetList.value = e;
  },
  {
    immediate: true,
  }
);
watch(
  () => label.value,
  (e: any) => {
    for (let i = 0; i < e.length; i++) {
      labelArr.value.push(e[i].labelName);
    }
  },
  {
    immediate: true,
  }
);
onMounted(() => {
  rawSubset(props.classify);
  rawlabel();
});
</script>

<style lang="less" scoped>
.forms {
  position: relative;
  padding-top: @space-xl;

  input {
    border: none;
    background: transparent;
    outline: none;
    &::placeholder {
      color: @gray-4;
    }
  }
  &-title {
    font-size: @size-xl;
    font-weight: 600;
  }
  .yk-dropdown {
    position: absolute;
    top: 0;
  }
  .yk-text-area {
    border: 0px solid transparent;
    border-radius: 0;
    background-color: transparent;
    padding: 0;
  }
  .introduce {
    width: 100%;
    border-bottom: 1px solid @gray-2;
  }
  &-cover {
    position: absolute;
    right: 0;
    top: 0;
  }
}
</style>
<style lang="less">
.yk-dropdown__title {
  width: 120px;

  height: 24px;
}
.yk-upload__picture-button {
  width: 160px;
  height: 120px;
}
.yk-upload-picture {
  width: 160px;
  height: 120px;
}
.yk-upload__picture {
  width: 160px;
  height: 120px;
}
</style>
