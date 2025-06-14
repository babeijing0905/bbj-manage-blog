import * as THREE from 'three'
import { OrbitControls } from 'three/addons/OrbitControls.js'//轨道控制器
import { GLTFLoader } from 'three/addons/GLTFLoader.js'//加载3d模型
import { AnimationUtils } from 'three/addons/AnimationUtils.js'
import { GUI } from 'three/addons/lil-gui.module.min.js'//图形化界面工具
import Stats from 'three/addons/stats.module.js'//性能监控工具，显示FPS等信息
import { Clock } from 'three/addons/Clock.js'
/* 实验内容 */
//TODO1:创建一个avatar，了解创建过程
//TODO2:为avatar设置相关动画，至少创建2个以上动画
//TODO3:利用threejs编程数字人基本展示
/* TODO4:
利用threejs实现数字人交互（可选择其他https://ift.devinci.fr/3D-interactive-avatar  ）
    4.1键盘进行动作选择
    4.2鼠标进行视点控制
*/
//TODO5:多个动作融合
//TODO6:了解morph target动画

let camera, scene, renderer, stats
let model, skeleton, mixer, clock//model：3d模型；skeleton：骨骼辅助显示工具；mixer：动画混合器，管理模型多个动画；clock：计时器
let neck, waist, nowaction, index = 0
let standWeight, freezeWeight, footworkWeight, endingWeight, Weight
let settings, crossFadeControls = [], InteractiveAnims = []
let standAction, freezeAction, footworkAction, endingAction, currentAction /* = standAction */
let singleStepMode = false;
let sizeOfNextStep = 0;
let actions


init()

/* 初始化 */
function init() {
  //1.获取容器
  const container = document.getElementById('container')

  //2.场景
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0xebd2c3)
  //添加雾：将地板颜色和背景颜色模糊在一起
  //scene.fog = new THREE.Fog(0xffffff, 10, 50)
  //3.相机
  camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000)
  camera.position.z = 30
  camera.position.x = 0;
  camera.position.y = -3;
  //4.渲染器
  renderer = new THREE.WebGLRenderer({ antialias: true })//antialias是否抗锯齿
  renderer.setPixelRatio(window.devicePixelRatio)//设置像素比。避免HIDPI上面 绘图模糊
  renderer.setSize(window.innerWidth, window.innerHeight)//将输出的canvas调整为网页大小
  renderer.shadowMap.enabled = true//投射阴影
  document.body.appendChild(renderer.domElement)//在body上添加canvas并将其渲染

  //5.光照
  //5.1环境光
  /* 半球光源
      上半球白色，下半球灰色 */
  const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 1.7)
  hemiLight.position.set(0, 50, 0)
  scene.add(hemiLight)
  //5.2平行光
  /* 模拟太阳光等远距离的强光源，光线是平行的。
  光线白色，强度3 */
  const dirLight = new THREE.DirectionalLight(0xffffff, 1)
  dirLight.position.set(-8, 12, 12)
  //5.3设置阴影相机的裁剪面
  /* 平行光使用阴影相机来控制哪些区域会被阴影覆盖。
  通过 dirLight.shadow.camera 属性设置阴影相机的裁剪面 */
  /* top、bottom、left、right：这些参数控制阴影相机的视野范围，确定光源能够照射到的区域大小。
  near 和 far：这两个参数控制阴影相机的近裁剪面和远裁剪面，决定了阴影的可见范围。 */
  let d = 8.25;
  dirLight.castShadow = true;
  dirLight.shadow.mapSize = new THREE.Vector2(1024, 1024);
  dirLight.shadow.camera.near = 0.1;
  dirLight.shadow.camera.far = 1500;
  dirLight.shadow.camera.left = d * -1;
  dirLight.shadow.camera.right = d;
  dirLight.shadow.camera.top = d;
  dirLight.shadow.camera.bottom = d * -1;
  scene.add(dirLight)

  //6.地面
  let floorGeometry = new THREE.PlaneGeometry(5000, 5000, 1, 1);//足够大平面
  let floorMaterial = new THREE.MeshPhongMaterial({
    color: 0xebd2c3,
    shininess: 0,
  });
  let floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = -0.5 * Math.PI;
  floor.receiveShadow = true;
  floor.position.y = -11;
  scene.add(floor);

  /* TODO3:加载模型 */
  //7.加载模型
  //7.1创建实例
  const loader = new GLTFLoader()

  //7.2加载模型
  loader.load('./images/animation.glb', gltf => {
    //* 检查是否导入成功 */
    //console.log(gltf.scene)
    //console.log(gltf.animations)

    scene.add(gltf.scene);
    //7.3添加模型

    model = gltf.scene
    const animations = gltf.animations;// 提取加载的模型中包含的动画数据
    //7.4遍历所有子物体

    //为每个网格设置阴影
    model.traverse(child => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
      if (child.isBone && child.name === 'Neck') {
        neck = child; // 颈部
      }
      if (child.isBone && child.name === 'Spine') {
        waist = child; // 腰部
      }
    })
    //将模型比例设置为初始的7倍
    model.scale.set(7, 7, 7)
    //移动模型
    model.position.y = -11
    scene.add(model)

    /* TODO4：数字人交互 */
    //8.2骨骼处理
    skeleton = new THREE.SkeletonHelper(model)
    skeleton.visible = false
    scene.add(skeleton)


    createPanel()


    mixer = new THREE.AnimationMixer(model)
    standAction = mixer.clipAction(animations[6])
    freezeAction = mixer.clipAction(animations[5])
    footworkAction = mixer.clipAction(animations[4])
    endingAction = mixer.clipAction(animations[0])



    actions = [standAction, freezeAction, footworkAction, endingAction]
    //console.log(animations)
    activateAllActions()


    renderer.setAnimationLoop(animate)




  }, // 进度回调
    progress => {
      const percent = (progress.loaded / progress.total * 100).toFixed(2); // 计算加载进度百分比
      console.log(`加载进度：${percent}%`); // 打印进度
    },
    error => {
      console.log(error)
    }
  )





  stats = new Stats()
  container.appendChild(stats.dom)

  //9.轨道控制器
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enablePan = false;
  controls.enableZoom = false;
  controls.target.set(0, 1, 0);
  controls.update();

  //窗口变化时，更新相机宽高比
  //window.addEventListener('resize', onWindowResize);

}
//更新函数
function update() {
  renderer.render(scene, camera)
  requestAnimationFrame(update)

  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }
}
update()
//保持模型比例
function resizeRendererToDisplaySize(renderer) {
  const canvas = renderer.domElement;
  let width = window.innerWidth;
  let height = window.innerHeight;
  let canvasPixelWidth = canvas.width / window.devicePixelRatio;
  let canvasPixelHeight = canvas.height / window.devicePixelRatio;

  const needResize =
    canvasPixelWidth !== width || canvasPixelHeight !== height;
  if (needResize) {
    renderer.setSize(width, height, false);
  }
  return needResize;
}
/* TODO4.2:鼠标进行视点控制 */
//监听鼠标事件
document.addEventListener('mousemove', function (e) {
  const mousecoords = getMousePos(e)
  if (neck && waist) {
    moveJoint(mousecoords, neck, 50)
    moveJoint(mousecoords, waist, 30)
  }
})
//获取鼠标坐标
function getMousePos(e) {
  return { x: e.clientX, y: e.clientY }
}
//移动关节
function moveJoint(mouse, joint, degreeLimit) {
  let degrees = getMouseDegrees(mouse.x, mouse.y, degreeLimit)
  joint.rotation.y = THREE.MathUtils.degToRad(degrees.x)
  joint.rotation.x = THREE.MathUtils.degToRad(degrees.y)

}
//调整对应旋转角度
function getMouseDegrees(x, y, degreeLimit) {
  let dx = 0,
    dy = 0,
    xdiff,
    xPercentage,
    ydiff,
    yPercentage

  let w = { x: window.innerWidth, y: window.innerHeight }
  if (x <= w.x / 2) {
    xdiff = w.x / 2 - x
    xPercentage = (xdiff / (w.x / 2)) * 100
    dx = ((degreeLimit * xPercentage) / 100) * -1
  }
  if (x >= w.x / 2) {
    xdiff = x - w.x / 2
    xPercentage = (xdiff / (w.x / 2)) * 100
    dx = (degreeLimit * xPercentage) / 100
  }
  if (y <= w.y / 2) {
    ydiff = w.y / 2 - y

    yPercentage = (ydiff / (w.y / 2)) * 100
    dy = (((degreeLimit * 0.5) * yPercentage) / 100) * -1
  }
  if (y >= w.y / 2) {
    ydiff = y - w.y / 2
    yPercentage = (ydiff / (w.y / 2)) * 100
    dy = (degreeLimit * yPercentage) / 100

  }
  return {
    x: dx, y: dy
  }
}
/* TODO4.1:键盘进行控制 */
//监听键盘事件
document.addEventListener('keydown', (e) => {
  let time = 0

  if (e.keyCode === 40 || e.keyCode === 39) {//按向下或向右键切换

    index >= actions.length - 1 ? index = 0 : index++;

    prepareCrossFade(currentAction, actions[index], time)//切换下一个动画
    currentAction = actions[index]
  }
  if (e.keyCode === 38 || e.keyCode === 37) {//向左或向上键切换
    index === 0 ? index = actions.length - 1 : index--;
    prepareCrossFade(currentAction, actions[index], time)//切换前一个动画
    currentAction = actions[index]
  }
  //console.log(currentAction)
})

/* TODO5：多个动作融合 */

//创建用户控制面板
function createPanel() {
  const panel = new GUI({ width: 310 });
  //添加folder
  const folder1 = panel.addFolder('Visibility');//控制骨骼可见性
  const folder2 = panel.addFolder('Deactivation');//控制动画启用于禁用
  const folder3 = panel.addFolder('Pausing/Stepping');//暂停/继续动画
  const folder4 = panel.addFolder('Crossfading');//控制动画渐变过渡
  const folder5 = panel.addFolder('Blend Weights');//调整不同动画权重
  const folder6 = panel.addFolder('General Speed');//调整动画播放速度

  //设置控制项
  settings = {
    'show model': true,
    'show skeleton': false,
    'deactivate all': deactivateAllActions,
    //'activate all': activateAllActions,
    'pause/continue': pauseContinue,
    'make single step': toSingleStepMode,//单步播放
    'modify step size': 0.05,
    'freeze': function () {
      prepareCrossFade(currentAction, freezeAction, 0);
      currentAction = freezeAction;
    },
    'stand': function () {

      prepareCrossFade(currentAction, standAction, 0);
      currentAction = standAction
    },
    'footwork': function () {

      prepareCrossFade(currentAction, footworkAction, 0);
      currentAction = footworkAction
    },

    'ending': function () {
      prepareCrossFade(currentAction, endingAction, 0)
      currentAction = endingAction
    },


    'use default duration': true,
    'set custom duration': 0.5,//默认过渡时间
    'modify stand weight': 0.0,//权重为1，动画生效
    'modify freeze weight': 0.0,
    'modify footwork weight': 0.0,

    'modify ending weight': 0.0,

    'modify time scale': 1.0//动画时间缩放，默认正常速度
  };
  folder1.add(settings, 'show model').onChange(showModel);//监听变化
  folder1.add(settings, 'show skeleton').onChange(showSkeleton);
  folder2.add(settings, 'deactivate all');
  //folder2.add(settings, 'activate all');
  folder3.add(settings, 'pause/continue');
  folder3.add(settings, 'make single step');
  folder3.add(settings, 'modify step size', 0.01, 0.1, 0.001);//控制单步播放时每步的时间长度。该控制项的范围为 0.01 到 0.1 秒，步长为 0.001 秒
  crossFadeControls.push(folder4.add(settings, 'stand'));
  crossFadeControls.push(folder4.add(settings, 'freeze'));
  crossFadeControls.push(folder4.add(settings, 'footwork'));

  crossFadeControls.push(folder4.add(settings, 'ending'))
  folder4.add(settings, 'use default duration');
  folder4.add(settings, 'set custom duration', 0, 10, 0.01);//允许用户自定义动画时间

  //控制不同动画权重
  folder5.add(settings, 'modify stand weight', 0.0, 1.0, 0.01).listen().onChange(function (weight) {

    setWeight(standAction, weight);


  });
  folder5.add(settings, 'modify freeze weight', 0.0, 1.0, 0.01).listen().onChange(function (weight) {

    setWeight(freezeAction, weight);


  });
  folder5.add(settings, 'modify footwork weight', 0.0, 1.0, 0.01).listen().onChange(function (weight) {

    setWeight(footworkAction, weight);

  });

  folder5.add(settings, 'modify ending weight', 0.0, 1.0, 0.01).listen().onChange(function (weight) {

    setWeight(endingAction, weight);

  });
  folder6.add(settings, 'modify time scale', 0.0, 1.5, 0.01).onChange(modifyTimeScale);

  folder1.open();
  folder2.open();
  folder3.open();
  folder4.open();
  folder5.open();
  folder6.open();

}
//使用add方法创建UI交互界面 add(控制对象, 对象具体属性, 其他参数) 使用onChange方法来执行某些代码


//定义模型的可见性
function showModel(visibility) {
  model.visible = visibility
}
//骨骼的可见性
function showSkeleton(visibility) {
  skeleton.visible = visibility;
}
//修改时间缩放比例
function modifyTimeScale(speed) {
  mixer.timeScale = speed;
}
//停止所有动画动作
function deactivateAllActions() {
  actions.forEach(function (action) {
    action.stop();
    action.setEffectiveWeight(0);
    action.enabled = false;

  });

}
//激活所有动画动作并未其设置权重
function activateAllActions() {
  setWeight(standAction, settings['modify stand weight']);
  setWeight(freezeAction, settings['modify freeze weight']);
  setWeight(footworkAction, settings['modify footwork weight']);
  setWeight(endingAction, settings['modify ending weight']);
  actions.forEach(function (action) {
    action.play();
  });

}
//在动画暂停和继续之间切换
function pauseContinue() {
  if (singleStepMode) {
    singleStepMode = false;
    unPauseAllActions();
  } else {
    if (standAction.paused) {
      unPauseAllActions();
    } else {
      pauseAllActions();
    }
  }
}
//暂停所有动画
function pauseAllActions() {
  actions.forEach(function (action) {
    action.paused = true;
  });

}
//恢复所有动画
function unPauseAllActions() {
  actions.forEach(function (action) {
    action.paused = false;
  });

}
//切换到单步模式，并设置下一步步长
function toSingleStepMode() {
  unPauseAllActions();
  singleStepMode = true;
  sizeOfNextStep = settings['modify step size'];
}
//从一个动画过渡到另一个动画
function prepareCrossFade(startAction, endAction, defaultDuration) {
  const duration = setCrossFadeDuration(defaultDuration);//设置淡出时间
  singleStepMode = false;
  unPauseAllActions();

  // 重置所有动画的权重，确保其他动画不会影响
  actions.forEach(action => {
    if (action !== endAction) {
      setWeight(action, 0); // 重置其他动画权重为0
    }
  });
  settings['modify stand weight'] = 0;
  settings['modify freeze weight'] = 0;
  settings['modify footwork weight'] = 0;
  settings['modify ending weight'] = 0;
  executeImmediateTransition(startAction, endAction, duration);
}
function executeImmediateTransition(startAction, endAction, duration) {
  // 直接停止当前动画
  //deactivateAllActions()
  // 立即播放目标动画
  endAction.time = 0;
  setWeight(endAction, 1);
  if (endAction === standAction) {
    settings['modify stand weight'] = 1;
  } else if (endAction === freezeAction) {
    settings['modify freeze weight'] = 1;
  } else if (endAction === footworkAction) {
    settings['modify footwork weight'] = 1;
  } else {
    settings['modify ending weight'] = 1;
  }
  // 设置权重为1，确保目标动画完全播放
  endAction.play(); // 直接播放目标动画
}
function setCrossFadeDuration(defaultDuration) {
  if (settings['use default duration']) {
    return defaultDuration;
  } else {
    return settings['set custom duration'];
  }
}
//同步两个动画动作切换
function synchronizeCrossFade(startAction, endAction, duration) {
  mixer.addEventListener('loop', onLoopFinished);
  function onLoopFinished(event) {
    if (event.action === startAction) {
      mixer.removeEventListener('loop', onLoopFinished);
      executeCrossFade(startAction, endAction, duration);
    }
  }
}
//淡入淡出动画
function executeCrossFade(startAction, endAction, duration) {
  setWeight(endAction, 1);
  endAction.time = 0;
  startAction.crossFadeTo(endAction, duration, true);
}
//设置权重
function setWeight(action, weight) {
  action.enabled = true;
  action.setEffectiveTimeScale(1);
  action.setEffectiveWeight(weight);
}
//确保settings中权重值正确更新
function updateWeightSliders() {
  settings['modify stand weight'] = standAction;
  settings['modify freeze weight'] = freezeAction;
  settings['modify footwork weight'] = footworkAction;
  settings['modify ending weight'] = endingAction;
}
//启用或禁用某些按钮
function updateCrossFadeControls() {
  if (standWeight === 1 && freezeWeight === 0 && footworkWeight === 0 && endingWeight === 0) {
    crossFadeControls[0].disable();
    crossFadeControls[1].enable();
    crossFadeControls[2].enable();
    crossFadeControls[3].enable();
  }
  if (standWeight === 0 && freezeWeight === 1 && footworkWeight === 0 && endingWeight === 0) {
    crossFadeControls[0].enable();
    crossFadeControls[1].disable();
    crossFadeControls[2].enable();
    crossFadeControls[3].enable();

  }
  if (standWeight === 0 && freezeWeight === 0 && footworkWeight === 1 && endingWeight === 0) {

    crossFadeControls[0].enable();
    crossFadeControls[1].enable();
    crossFadeControls[2].disable();
    crossFadeControls[3].enable();


  }

  if (standWeight === 0 && freezeWeight === 0 && footworkWeight === 0 && endingWeight === 1) {

    crossFadeControls[0].enable();
    crossFadeControls[1].enable();
    crossFadeControls[2].enable();
    crossFadeControls[3].disable();

  }
  if (standWeight === 0 && freezeWeight === 0 && footworkWeight === 0 && endingWeight === 0) {
    crossFadeControls.forEach(control => control.enable());


  }
}
//实现权重调节
function setWeightinit() {
  setWeight(standAction, settings['modify stand weight'])
  setWeight(freezeAction, settings['modify freeze weight'])
  setWeight(footworkAction, settings['modify footwork weight'])
  setWeight(endingAction, settings['modify ending weight'])
}
clock = new Clock()
function animate() {
  standWeight = standAction.getEffectiveWeight()//获取动画权重
  freezeWeight = freezeAction.getEffectiveWeight()
  footworkWeight = footworkAction.getEffectiveWeight()
  endingWeight = endingAction.getEffectiveWeight()
  //更新权重和交叉淡入

  updateCrossFadeControls()
  updateWeightSliders();
  let mixerUpdateDelta = clock.getDelta();
  if (singleStepMode) {
    mixerUpdateDelta = sizeOfNextStep;
    sizeOfNextStep = 0;
  }
  //更新所有动画状态
  mixer.update(mixerUpdateDelta);
  renderer.render(scene, camera)
  stats.update()



  console.log('Weights:', { standWeight, freezeWeight, footworkWeight, endingWeight });

}
