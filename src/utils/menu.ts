export const navLinks = [
  {
    path: 'overview',
    name: '总览',
    icon: 'IconHomepageOutline'
  },
  {
    path: 'localfile',
    name: '本地文件',
    icon: 'IconFolderCloseOutline'
  },
  {
    path: 'articles',
    name: '文章',
    icon: 'IconFileOutline'
  },
  {
    path: 'gallery',
    name: '图库',
    icon: 'IconImageOutline'
  },
  {
    path: 'diary',
    name: '随记',
    icon: 'IconReadOutline'
  },

  {
    path: 'setting',
    name: '设置',
    icon: 'IconSettingsOutline'
  }
];

// 总览总数（浅色模式微妙渐变）
export const overLink = [
  {
    path: 'editlocalfile',
    name: '本地文件',
    total: '0M',
    bgcolor: '180deg, #ed6665 0%, #e95d54 100%' // 错误色
  },
  {
    path: 'editarticle',
    name: '博客文章',
    total: 0,
    bgcolor: '180deg, #3f8f9f 0%, #1a7482 100%' // 主色
  },
  {
    path: 'editgallery',
    name: '图库',
    total: 0,
    bgcolor: '180deg, #f4c2bd 0%, #f9cfc8 100%' // 警告色
  },
  {
    path: 'diary',
    name: '随笔随记',
    total: 0,
    bgcolor: '180deg, #82cbae 0%, #66c0a4 100%' // 成功色
  },

/*   {
    path: 'settings',
    name: '设置',
    total: 0,
    bgcolor: '180deg, #4697a0 0%, #2a8a96 100%' // 链接色
  } */
];