import { baseUrl } from "./env";
import { YkMessage } from "@yike-design/ui";
import axios from "axios";

const service=axios.create({
  baseURL:baseUrl,
  timeout:8000,

})


//part：添加请求拦截器
service.interceptors.request.use(
  //在发送请求前
  config=>{
    return config
  },
  //对请求错误
  error=>{
    YkMessage({type: 'warning', message: error.message})
    return Promise.reject()
  }
)

//part:添加响应拦截器
service.interceptors.response.use(
  response=>{
    if(response.status==200){
      return response.data
    }else{
          YkMessage({type: 'warning', message: '请求发送失败'})
    return Promise.reject()

    }
  },
   error=>{
    YkMessage({type: 'warning', message: error.message})
    return Promise.reject()
  }
)

export default service