import { ref,defineEmits } from "vue";

import { useSubsetStore } from "../components/store/subset";
import { getCurrentInstance } from "vue";

import { addSubsetApi, subsetApi ,deleteSubsetApi,updateSubsetApi} from "../api";
import { useUserStore } from "../components/store/user";
import { useCode } from "../hooks/code";

const userStore = useUserStore();
const { tackleCode } = useCode();
const emits = defineEmits(["nowSubset"]);
//import type { SubsetData } from "../../utils/interface";
//当前选择
const selected = ref<number | string>("-1all");
//store
const subsetStore = useSubsetStore();


export function useSubset(){

//新建分组内容
const inputValue = ref<number | string>();

//func:选择切换
const changeOption = (id: number | string, type: string) => {
  if (id + type != selected.value) {
    selected.value = id + type;
    emits("nowSubset", { id, type });
  }
};

//获取分组
const rawSubset =async  (e:number) => {
  let request = {
    token: userStore.token,
    classify: e,
  };
  
  
 await  subsetApi(request).then((res: any) => {
    if (tackleCode(res.code)) {
      //console.log(res.data);
     subsetStore.$patch({
  data: res.data.list,
  count: res.data.total
});
    }
  });
};

const proxy: any = getCurrentInstance()?.proxy;
//取消
const cancel = () => {
  inputValue.value = "";
};
//插入
const confirm = (e:number) => {
  if (inputValue.value) {
    let request = {
      token: userStore.token,
      value: {
        subset_name: inputValue.value,
        classify: e,
        moment: new Date(),
      },
    };
    //console.log(request);
    addSubsetApi(request).then((res: any) => {
      if (tackleCode(res.code)) {
        //  console.log(res.data);
        let sub = {
          id: res.data,
          name: inputValue.value!,
          value: 0,
        };
        subsetStore.data.push(sub);
        inputValue.value = "";
        proxy.$message({ type: "primary", message: "插入完成" });
      }
    });
  } else {
    proxy.$message({ type: "warning", message: "请输入" });
  }
};

//func:删除
const deleteSubset = (e: number | string) => {
  //提交后端处理
  let request = {
    token: userStore.token,
    subsetID: e,
  };
  // console.log(request);
  deleteSubsetApi(request).then((res: any) => {
    if (tackleCode(res.code)) {
      subsetStore.data = subsetStore.data.filter(
        (obj: { value: any; id: number | string }) => {
          if (obj.id === e) {
            subsetStore.exclude.value += obj.value;
          }
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
//修改分钟信息
const updateSubset=(e:any)=>{
   //提交后端处理
    let request = {
      token: userStore.token,
      subsetID: e.id,
      subsetName: e.name,
    };
    console.log(request);
    updateSubsetApi(request).then((res: any) => {
      if (tackleCode(res.code)) {
        console.log(res.data);
        proxy.$message({ type: "primary", message: "修改成功" });
      }
    });
}

return{
  inputValue,
  selected,
  changeOption,
  cancel,
  rawSubset,
  confirm,
  visible,
  showModal,
  deleteSubset,
  updateSubset
}

}