import fetch from "../utils/axios"
import { baseUrl } from "../utils/env"
export const urlManage=(s:string)=>{
  return  baseUrl+s
}

/* part：用户 认证*/

//是否注册/isRegister
export const isRegisterApi = (token: string) => 
  fetch.post('/isRegister', {}, {
    headers: {
      token
    }
  })


//用户注册/register
export const registerApi=(data:object)=>fetch.post('/register',data)

//用户登录/signin
export const signinApi=(data:object)=>fetch.post('/signin',data)


/* part：数据统计 */
//总览数据/overview
export const overviewApi=(data:object)=>fetch.post('/overview',data)


/* part：评论 */
//查看评论列表/comment
export const commentApi=(data:object)=>fetch.post('/comment',data)

//标记评论为已读/commentIsread
export const commentIsreadtApi=(data:object)=>fetch.post('/commentIsread',data)

//删除评论/deleteComment
export const deleteCommentApi=(data:object)=>fetch.post('/deleteComment',data)


/* part:私信 */
//获取私信/message
export const messageApi=(data:object)=>fetch.post('/message',data)

//获取未读私信总数/noreadMessage
export const noreadMessageApi=(data:object)=>fetch.post('/noreadMessage',data)

//删除私信/deleteMessage
export const deleteMessageApi=(data:object)=>fetch.post('/deleteMessage',data)


//已读私信/readMessage
export const readMessageApi=(data:object)=>fetch.post('/readMessage',data)

/* part:分组管理 */
//新建分组/addSubset
export const addSubsetApi=(data:object)=>fetch.post('/addSubset',data)

//新建分组/subset
export const subsetApi=(data:object)=>fetch.post('/subset',data)

//修改分组/updateSubset
export const updateSubsetApi=(data:object)=>fetch.post('/updateSubset',data)

//删除分组/deleteSubset
export const deleteSubsetApi=(data:object)=>fetch.post('/deleteSubset',data)

/* part:标签管理 */

//获取标签/label
export const labelApi=(data:object)=>fetch.post('/label',data)
//添加标签/addLabel
export const addLabelApi=(data:object)=>fetch.post('/addLabel',data)

//删除标签/deleteLabel
export const deleteLabelApi=(data:object)=>fetch.post('/deleteLabel',data)

/* part:文章管理 */

//新建文章或图库/createArticle
export const createArticleApi=(data:object)=>fetch.post('/createArticle',data)


/* part：文件管理 */
//新建文章或图库/upload
export const uploadApi=(data:object)=>fetch.post('/upload',data)