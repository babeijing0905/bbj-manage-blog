import {  ref } from "vue";
//import { mklabel } from "../../mock/data";
import type { LabelData } from "../utils/interface";
import { getCurrentInstance } from "vue";

import { addLabelApi, labelApi,deleteLabelApi } from "../api";
import { useUserStore } from "../components/store/user";
import { useCode } from "../hooks/code";

const userStore = useUserStore();
const { tackleCode } = useCode();

export function useLabel(){

//新建分组内容
const inputValue = ref<number | string>();

//获取标签
const label = ref<LabelData[]>([]);
const rawlabel = () => {
  let request = {
    token: userStore.token,
  };
  labelApi(request).then((res: any) => {
    if (tackleCode(res.code)) {
      label.value = [...res.data];
    }
  });
};

const proxy: any = getCurrentInstance()?.proxy;
//取消
const cancel = () => {
  inputValue.value = "";
};

//新建标签
const confirm = () => {
  if (inputValue.value) {
    let request = {
      token: userStore.token,
      value: {
        label_name: inputValue.value,

        moment: new Date(),
      },
    };
    //console.log(request);
    addLabelApi(request).then((res: any) => {
      if (tackleCode(res.code)) {
        //  console.log(res.data);
        let lab = {
          id: res.data,
          labelName: inputValue.value!,
        };
        label.value.unshift(lab);
        inputValue.value = "";
        proxy.$message({ type: "primary", message: "插入完成" });
      }
    });
  } else {
    proxy.$message({ type: "warning", message: "请输入" });
  }
};
//func:删除


const deletelabel = (e: number | string) => {
  //提交后端处理
  let request = {
    token: userStore.token,
    labelId: e,
  };
  // console.log(request);
  deleteLabelApi(request).then((res: any) => {

    if (tackleCode(res.code)) {
      label.value = label.value.filter(
        (obj: { id: number | string }) => {
          return obj.id !== e;
        }
      );
      proxy.$message({ type: "primary", message: "删除成功" });
    }
  });
};
//管理分组
const visible = ref<boolean>(false);
const showModal = () => {
  visible.value = !visible.value;
};
return{
  inputValue,
  visible,
  label,
  rawlabel,
  confirm,
  showModal,
  cancel,deletelabel
  
}
}