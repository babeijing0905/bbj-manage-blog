let baseUrl=""
let baseImgPath=""

if(process.env.NODE_ENV=='development'){
  //part:开发环境
  baseUrl="http://localhost:8088"
  baseImgPath=""
}else{
  //part:正式环境
  //todo:改为服务器地址
  baseUrl=""
  baseImgPath=""
}
export {
  baseUrl,
  baseImgPath
}