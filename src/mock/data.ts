import Mock from 'mockjs'
const Random=Mock.Random
//part:总览数据
export const overview=Mock.mock({
  code: 200,//200正常、300未通过token验证、500错误、400功能拒绝
    data:{
       "file":Random.float(60,100,2,2)+'M',
       "article|0-50":0,
        "gallery|0-50":0,
        "diary|0-50":0,
        "project|0-50":0,
        "resource|0-50":0,
    }
})

//part:访问量
export const visit=Mock.mock({
  "data|30":[
    {
      //时间
      "date":"@datetime('MM-dd')",
      "count|10-100":12,

    }
  ]
})

//part:数据监测
export const survey=Mock.mock({
  "data":{
    "device":[
      {
        "key":'mobile',
        "name":'移动端',
        "value|38-120":50,
      },
      {
        "key":'pc',
        "name":'电脑端',
        "value|38-120":40,
      }
    ],
    "website":[
       {
        "key":'home',
        "name":'首页',
        "value|38-120":50,
      },
      {
        "key":'project',
        "name":'项目',
        "value|38-120":40,
      },
      {
        "key":'diary',
        "name":'随记',
        "value|38-120":40,
      },
      {
        "key":'gallery',
        "name":'图库',
        "value|38-120":40,
      }
    ]
  }
})
//part:评论
export const comment=Mock.mock({
"data":
  {
    "count":123,
    "list|123":[{
      "id|+1":0,
      "article":{
        "id|+1":2,
        "title":"@ctitle(3,12)",
      },
      "user":{
         "id|+1":3,
         "name":"@ctitle(3,12)",
         "imgurl":"https://www.huohuo90.com:3003/user/6353b034dd4b583975e77fbe.png",

      },
      "comment":"@cparagraph(1,4)",
      "moment":"@datetime()",
      "complaint|0-12":0,
      }]
    }
  }

)

//part:文章状态
export const state=Mock.mock({
"data":[
  {
    "id":0,
    "name":"已发布",
    "value|0-30":4,
    },{
    "id":1,
    "name":"未发布",
    "value|0-30":4,
    
    }
]
  }
)

//part：分组
export const subset=Mock.mock({
 
   "data":{
     "count":123,
    "list|4":[{
      "id|+1":0,
        "name":"@ctitle(3,5)",
        "value|0-30":4,
        "moment":"@datetime()",
    }]
   }
    
  }
)
//part:图片合集
const photos=[
  "a.jpg",
  "b.jpg",
  "c.jpg",
  "d.jpg",
  "e.jpg",
  "f.jpg",
  "g.jpg",
  "h.jpg",
  "i.jpg",
  "j.png",
  "k.jpg",
]
const photoarr=[
  ["a.jpg"],
  ["b.jpg","c.jpg"],
  ["d.jpg","e.jpg","f.jpg"],
  ["h.jpg","i.jpg","j.png"],
  ["k.jpg","l.jpg","g.jpg"],

]
//part:文件数据
export const mkfiles=Mock.mock({
  "count":64,
   "list|64":[
     {
            "id|+1":0,
            /* comment:忘记写|，害我好找 
            
            */
            "url|+1":photos,//地址
            "fileName":"@ctitle(2,12)",//文件名 
            "format":"jpeg",//格式
            "subsetId|0-4":3,//所属类型 
        }]
})

//part:标签
//part：分组
export const mklabel=Mock.mock({
 
   "data":{
     "count":123,
    "list|12":[{
      "id|+1":0,
        "name":"@ctitle(3,5)",
    
        "moment":"@datetime()",
    }]
   }
    
  }
)
//part:文章数据
export const mkarticle=Mock.mock({
  "count":64,
   "list|64":[
     {
            "id|+1":0,
            /* comment:忘记写|，害我好找 
            
            */
            "cover|1":photos,//地址
             "title":"@ctitle(4,12)",
              "moment":"@datetime()",
              "label|0-3":["@ctitle(2,4)"],
               "introduce":"@cparagraph(1,4)",
            "views|12-429":122,
            "comment|8-24":12,
            "praise|8-123":44,

            "subsetId|0-4":0 ,
            "state|0-1":0,
        }]
})
//part:图库数据
export const mkgallery=Mock.mock({
  "count":64,
   "list|64":[
     {
            "id|+1":0,
            /* comment:忘记写|，害我好找 
            
            */
            "cover|1":photos,//地址
             "title":"@ctitle(4,12)",
              "moment":"@datetime()",
              "label|0-3":["@ctitle(2,4)"],
               "introduce":"@cparagraph(1,4)",
            "views|12-429":122,
            "comment|8-24":12,
            "praise|8-123":44,

            "subsetId|0-4":0 ,
            "content|1":photoarr,
        }]
})
//part:日记数据
export const mkdiary=Mock.mock({
  "count":64,
   "list|64":[
     {
            "id|+1":0,
             "title":"@ctitle(4,12)",
              "moment":"@datetime()",
              //comment:又写了一个错别字，害我找半天

              "weatherId|0-7":0,
               "content":"@cparagraph(2,10)",
            "picture|1":photoarr,
        }]
})
//part:图片列表
export const mkphotos=Mock.mock({

   "data|6":[
     {
            "id|+1":0,
         "url|+1":photos,
        }]
})
