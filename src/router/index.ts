import { createWebHistory, createRouter } from 'vue-router'
import IndexView from '../layout/IndexView.vue'
import HelloWorld from '../components/HelloWorld.vue'

/* 嵌套路由 */
const routes = [
  {
    path: '/',
    redirect:'/overview',
    component: IndexView,
    children: [
      {
        // 当 /user/:id/profile 匹配成功
        // UserProfile 将被渲染到 User 的 <router-view> 内部
        path: 'overview',
        component: ()=>import('../layout/OverView.vue'),
      }, {
       
        path: 'articles',
        component: ()=>import('../layout/ArticleView.vue'),
      },{
       
        path: 'gallery',
        component: ()=>import('../layout/GalleryView.vue'),
      },{
       
        path: 'diary',
        component: ()=>import('../layout/DiaryView.vue'),
      },
      {
       
        path: 'localfile',
        component: ()=>import('../layout/FileView.vue'),
      },
      {
        // 当 /user/:id/posts 匹配成功
        // UserPosts 将被渲染到 User 的 <router-view> 内部
        path: 'hello',
        component: HelloWorld,
      }, {
        path: '/digital-human',
        component: ()=>import('../layout/DigitalHumanView.vue'),
      },
     
    ],
  },{
       
        path: '/editgallery',
        component: ()=>import('../layout/EditGallery.vue'),
      },{
       
        path: '/editarticle',
        component: ()=>import('../layout/EditArticleView.vue'),
      }
      ,{
       
        path: '/login',
        component: ()=>import('../layout/Login.vue'),
      },{
       
        path: '/register',
        component: ()=>import('../layout/Register.vue'),
      },{
       
        path: '/errorinfo',
        component: ()=>import('../layout/404.vue'),
      },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})


//在路由请求前
router.beforeEach((to,from,next)=>{
  if(to.matched.length===0){
    //地址发生错误时跳转
    
    from.name?next({
      name:from.name

    }):next('/')
  }else{
    next()
  }
})
export default router;