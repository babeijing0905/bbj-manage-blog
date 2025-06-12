
import { ref, getCurrentInstance } from "vue";
import { timeT } from "../utils/moment";
import { createArticleApi } from "../api";
import { useUserStore } from "../components/store/user";
import { useCode } from "../hooks/code";

const userStore = useUserStore();
const { tackleCode } = useCode();
export function useArticle(){
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
return {
  formData,editorData,submit
}

}