//part:回复内容
export type ReplyData={
  
          id:number;
          article?:{
              id:number;
              title?:string;
          };
          userId:number
         userName:string
         userAvatar:string

          
          comment:string;//内容
          moment:string;//时间
          complaint?:number;//举报数
          isread:number//1已读，0未读
      
}
//part：分组
export interface SubsetData{
    id:number|string,
   name:string|number,
    value:number,
    moment?:string
}//part：标签
export interface LabelData{
    id:number|string,
    labelName:string|number,
 
    moment?:Date
}
//part：文件
export interface FileData{
    id:number,
     url:string;//地址
    fileName:string;//文件名 
    format:string;//格式
    subsetId:number;//所属类型 
    selected?:boolean,//是否选择
}
//part:文章
export interface ArticleData{
 id:number;
          title:string;
          subsetId?:number;
          moment:Date;//时间
          label?:string[];
          introduce?:string;//简介 
          cover?:string;//封面地址
          views:number;//查看次数
          state:number;//状态0未发布、1已发布
          comment:number;//评论数
          praise:number;//点赞次数
          content?:string|string[]
}

 //part:随记
export interface DiaryData{
    id:number;
    title:string;
    moment:Date;//时间
    weatherId:number;//天气
    content:string|string[];
    picture?:string[];
}
