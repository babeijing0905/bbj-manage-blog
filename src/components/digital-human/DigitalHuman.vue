<template>
  <div class="digital-human-container">
    <div class="nav">
      <span>上键或左键切换前一个动作，下键或右键切换下一个动作</span>
    </div>
    <div class="loading" id="js-loader" v-if="isLoading">
      <div class="loader"></div>
    </div>
    <div id="digital-human-container"></div>
  </div>
</template>

<script>
import { defineComponent, onMounted, onBeforeUnmount, ref } from 'vue';

export default defineComponent({
  name: 'DigitalHuman',
  setup() {
    const isLoading = ref(true);
    
    // 全局变量
    let camera, scene, renderer, stats;
    let model, skeleton, mixer, clock;
    let neck, waist, nowaction, index = 0;
    let standWeight, freezeWeight, footworkWeight, endingWeight;
    let settings, crossFadeControls = [], InteractiveAnims = [];
    let standAction, freezeAction, footworkAction, endingAction, currentAction;
    let singleStepMode = false;
    let sizeOfNextStep = 0;
    let actions;
    let disposed = false;
    let gui = null;
    
    // 用于动态加载脚本的函数
    const loadScript = (url) => {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.type = 'module';
        script.src = url;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    };

    // 初始化场景
    const init = async () => {
      // 动态加载脚本
      try {
        // 首先加载Three.js核心
        window.THREE = await loadThreeJS();
        
        // 然后加载其他依赖
        const OrbitControls = await loadOrbitControls();
        const GLTFLoader = await loadGLTFLoader();
        const GUI = await loadGUI();
        const Stats = await loadStats();
        const Clock = window.THREE.Clock;
        
        // 1.获取容器
        const container = document.getElementById('digital-human-container');
        
        // 2.场景
        scene = new window.THREE.Scene();
        scene.background = new window.THREE.Color(0xebd2c3);
        
        // 3.相机
        camera = new window.THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 30;
        camera.position.x = 0;
        camera.position.y = -3;
        
        // 4.渲染器
        renderer = new window.THREE.WebGLRenderer({ antialias: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        
        // 调整为容器大小，而不是全屏
        renderer.setSize(container.clientWidth || 800, container.clientHeight || 600);
        renderer.shadowMap.enabled = true;
        container.appendChild(renderer.domElement);
        
        // 5.光照
        // 5.1环境光
        const hemiLight = new window.THREE.HemisphereLight(0xffffff, 0xffffff, 1.7);
        hemiLight.position.set(0, 50, 0);
        scene.add(hemiLight);
        
        // 5.2平行光
        const dirLight = new window.THREE.DirectionalLight(0xffffff, 1);
        dirLight.position.set(-8, 12, 12);
        
        // 5.3设置阴影相机的裁剪面
        let d = 8.25;
        dirLight.castShadow = true;
        dirLight.shadow.mapSize = new window.THREE.Vector2(1024, 1024);
        dirLight.shadow.camera.near = 0.1;
        dirLight.shadow.camera.far = 1500;
        dirLight.shadow.camera.left = d * -1;
        dirLight.shadow.camera.right = d;
        dirLight.shadow.camera.top = d;
        dirLight.shadow.camera.bottom = d * -1;
        scene.add(dirLight);
        
        // 6.地面
        let floorGeometry = new window.THREE.PlaneGeometry(5000, 5000, 1, 1);
        let floorMaterial = new window.THREE.MeshPhongMaterial({
          color: 0xebd2c3,
          shininess: 0,
        });
        let floor = new window.THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -0.5 * Math.PI;
        floor.receiveShadow = true;
        floor.position.y = -11;
        scene.add(floor);
        
        // 7.加载模型
        const loader = new GLTFLoader();
        
        // 7.2加载模型
        loader.load('/P2/images/animation.glb', (gltf) => {
          scene.add(gltf.scene);
          // 7.3添加模型
          model = gltf.scene;
          const animations = gltf.animations;
          
          // 7.4遍历所有子物体
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
          });
          
          // 将模型比例设置为初始的7倍
          model.scale.set(7, 7, 7);
          // 移动模型
          model.position.y = -11;
          scene.add(model);
          
          // 8.2骨骼处理
          skeleton = new window.THREE.SkeletonHelper(model);
          skeleton.visible = false;
          scene.add(skeleton);
          
          // 创建控制面板
          createPanel(GUI);
          
          mixer = new window.THREE.AnimationMixer(model);
          standAction = mixer.clipAction(animations[6]);
          freezeAction = mixer.clipAction(animations[5]);
          footworkAction = mixer.clipAction(animations[4]);
          endingAction = mixer.clipAction(animations[0]);
          
          actions = [standAction, freezeAction, footworkAction, endingAction];
          activateAllActions();
          
          currentAction = actions[0]; // 默认动作
          
          isLoading.value = false; // 加载完成
          
          // 监听键盘事件
          document.addEventListener('keydown', handleKeyDown);
          
          // 监听鼠标移动
          document.addEventListener('mousemove', handleMouseMove);
          
          // 开始动画循环
          clock = new window.THREE.Clock();
          animate();
        }, 
        // 进度回调
        (progress) => {
          const percent = (progress.loaded / progress.total * 100).toFixed(2);
          console.log(`加载进度：${percent}%`);
        },
        (error) => {
          console.log('模型加载错误:', error);
        });
        
        // 性能监控
        stats = new Stats();
        container.appendChild(stats.dom);
        
        // 轨道控制器
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enablePan = false;
        controls.enableZoom = false;
        controls.target.set(0, 1, 0);
        controls.update();
        
        // 窗口变化时，更新相机宽高比
        window.addEventListener('resize', handleResize);
          
      } catch (error) {
        console.error('初始化错误:', error);
        isLoading.value = false;
      }
    };
    
    // 动态加载Three.js核心
    const loadThreeJS = async () => {
      await loadScript('/P2/js/three.module.js');
      return window.THREE;
    };
    
    // 动态加载OrbitControls
    const loadOrbitControls = async () => {
      await loadScript('/P2/js/OrbitControls.js');
      return window.THREE.OrbitControls;
    };
    
    // 动态加载GLTFLoader
    const loadGLTFLoader = async () => {
      await loadScript('/P2/js/GLTFLoader.js');
      return window.THREE.GLTFLoader;
    };
    
    // 动态加载GUI
    const loadGUI = async () => {
      await loadScript('/P2/js/lil-gui.module.min.js');
      return window.GUI;
    };
    
    // 动态加载Stats
    const loadStats = async () => {
      await loadScript('/P2/js/stats.module.js');
      return window.Stats;
    };

    // 响应式调整大小
    const handleResize = () => {
      const container = document.getElementById('digital-human-container');
      if (container && camera && renderer) {
        const width = container.clientWidth;
        const height = container.clientHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
      }
    };

    // 获取鼠标坐标
    const getMousePos = (e) => {
      return { x: e.clientX, y: e.clientY };
    };

    // 移动关节
    const moveJoint = (mouse, joint, degreeLimit) => {
      let degrees = getMouseDegrees(mouse.x, mouse.y, degreeLimit);
      joint.rotation.y = window.THREE.MathUtils.degToRad(degrees.x);
      joint.rotation.x = window.THREE.MathUtils.degToRad(degrees.y);
    };

    // 调整对应旋转角度
    const getMouseDegrees = (x, y, degreeLimit) => {
      let dx = 0,
          dy = 0,
          xdiff,
          xPercentage,
          ydiff,
          yPercentage;

      let w = { x: window.innerWidth, y: window.innerHeight };
      if (x <= w.x / 2) {
        xdiff = w.x / 2 - x;
        xPercentage = (xdiff / (w.x / 2)) * 100;
        dx = ((degreeLimit * xPercentage) / 100) * -1;
      }
      if (x >= w.x / 2) {
        xdiff = x - w.x / 2;
        xPercentage = (xdiff / (w.x / 2)) * 100;
        dx = (degreeLimit * xPercentage) / 100;
      }
      if (y <= w.y / 2) {
        ydiff = w.y / 2 - y;
        yPercentage = (ydiff / (w.y / 2)) * 100;
        dy = (((degreeLimit * 0.5) * yPercentage) / 100) * -1;
      }
      if (y >= w.y / 2) {
        ydiff = y - w.y / 2;
        yPercentage = (ydiff / (w.y / 2)) * 100;
        dy = (degreeLimit * yPercentage) / 100;
      }
      return { x: dx, y: dy };
    };

    // 监听鼠标移动
    const handleMouseMove = (e) => {
      const mousecoords = getMousePos(e);
      if (neck && waist) {
        moveJoint(mousecoords, neck, 50);
        moveJoint(mousecoords, waist, 30);
      }
    };

    // 监听键盘事件
    const handleKeyDown = (e) => {
      let time = 0;
      if (e.keyCode === 40 || e.keyCode === 39) { // 按向下或向右键切换
        index >= actions.length - 1 ? index = 0 : index++;
        prepareCrossFade(currentAction, actions[index], time); // 切换下一个动画
        currentAction = actions[index];
      }
      if (e.keyCode === 38 || e.keyCode === 37) { // 向左或向上键切换
        index === 0 ? index = actions.length - 1 : index--;
        prepareCrossFade(currentAction, actions[index], time); // 切换前一个动画
        currentAction = actions[index];
      }
    };

    // 创建控制面板
    const createPanel = (GUI) => {
      gui = new GUI({ width: 310 });
      // 添加folder
      const folder1 = gui.addFolder('可见性控制'); 
      const folder2 = gui.addFolder('激活/停用');
      const folder3 = gui.addFolder('暂停/步进控制');
      const folder4 = gui.addFolder('动作切换');
      const folder5 = gui.addFolder('动作权重');
      const folder6 = gui.addFolder('速度控制');

      // 设置控制项
      settings = {
        '显示模型': true,
        '显示骨骼': false,
        '停用所有动作': deactivateAllActions,
        '暂停/继续': pauseContinue,
        '单步执行': toSingleStepMode,
        '修改步长': 0.05,
        '站立': function () {
          prepareCrossFade(currentAction, standAction, 0);
          currentAction = standAction;
        },
        '冻结': function () {
          prepareCrossFade(currentAction, freezeAction, 0);
          currentAction = freezeAction;
        },
        '舞步': function () {
          prepareCrossFade(currentAction, footworkAction, 0);
          currentAction = footworkAction;
        },
        '结束动作': function () {
          prepareCrossFade(currentAction, endingAction, 0);
          currentAction = endingAction;
        },
        '使用默认过渡时长': true,
        '设置自定义过渡时长': 0.5,
        '调整站立权重': 0.0,
        '调整冻结权重': 0.0,
        '调整舞步权重': 0.0,
        '调整结束动作权重': 0.0,
        '调整时间缩放': 1.0
      };

      folder1.add(settings, '显示模型').onChange(showModel);
      folder1.add(settings, '显示骨骼').onChange(showSkeleton);
      folder2.add(settings, '停用所有动作');
      folder3.add(settings, '暂停/继续');
      folder3.add(settings, '单步执行');
      folder3.add(settings, '修改步长', 0.01, 0.1, 0.001);
      
      crossFadeControls.push(folder4.add(settings, '站立'));
      crossFadeControls.push(folder4.add(settings, '冻结'));
      crossFadeControls.push(folder4.add(settings, '舞步'));
      crossFadeControls.push(folder4.add(settings, '结束动作'));
      
      folder4.add(settings, '使用默认过渡时长');
      folder4.add(settings, '设置自定义过渡时长', 0, 10, 0.01);

      // 控制不同动画权重
      folder5.add(settings, '调整站立权重', 0.0, 1.0, 0.01).listen().onChange(function (weight) {
        setWeight(standAction, weight);
      });
      folder5.add(settings, '调整冻结权重', 0.0, 1.0, 0.01).listen().onChange(function (weight) {
        setWeight(freezeAction, weight);
      });
      folder5.add(settings, '调整舞步权重', 0.0, 1.0, 0.01).listen().onChange(function (weight) {
        setWeight(footworkAction, weight);
      });
      folder5.add(settings, '调整结束动作权重', 0.0, 1.0, 0.01).listen().onChange(function (weight) {
        setWeight(endingAction, weight);
      });
      folder6.add(settings, '调整时间缩放', 0.0, 1.5, 0.01).onChange(modifyTimeScale);

      folder1.open();
      folder2.open();
      folder3.open();
      folder4.open();
      folder5.open();
      folder6.open();
    };

    // 模型的可见性
    const showModel = (visibility) => {
      model.visible = visibility;
    };

    // 骨骼的可见性
    const showSkeleton = (visibility) => {
      skeleton.visible = visibility;
    };

    // 修改时间缩放比例
    const modifyTimeScale = (speed) => {
      mixer.timeScale = speed;
    };

    // 停止所有动画动作
    const deactivateAllActions = () => {
      actions.forEach(function (action) {
        action.stop();
        action.setEffectiveWeight(0);
        action.enabled = false;
      });
    };

    // 激活所有动画动作并为其设置权重
    const activateAllActions = () => {
      setWeight(standAction, settings ? settings['调整站立权重'] : 0);
      setWeight(freezeAction, settings ? settings['调整冻结权重'] : 0);
      setWeight(footworkAction, settings ? settings['调整舞步权重'] : 1); // 默认播放舞步
      setWeight(endingAction, settings ? settings['调整结束动作权重'] : 0);
      actions.forEach(function (action) {
        action.play();
      });
    };

    // 在动画暂停和继续之间切换
    const pauseContinue = () => {
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
    };

    // 暂停所有动画
    const pauseAllActions = () => {
      actions.forEach(function (action) {
        action.paused = true;
      });
    };

    // 恢复所有动画
    const unPauseAllActions = () => {
      actions.forEach(function (action) {
        action.paused = false;
      });
    };

    // 切换到单步模式，并设置下一步步长
    const toSingleStepMode = () => {
      unPauseAllActions();
      singleStepMode = true;
      sizeOfNextStep = settings['修改步长'];
    };

    // 从一个动画过渡到另一个动画
    const prepareCrossFade = (startAction, endAction, defaultDuration) => {
      const duration = setCrossFadeDuration(defaultDuration);
      singleStepMode = false;
      unPauseAllActions();

      // 重置所有动画的权重，确保其他动画不会影响
      actions.forEach(action => {
        if (action !== endAction) {
          setWeight(action, 0);
        }
      });
      
      settings['调整站立权重'] = 0;
      settings['调整冻结权重'] = 0;
      settings['调整舞步权重'] = 0;
      settings['调整结束动作权重'] = 0;
      executeImmediateTransition(startAction, endAction, duration);
    };

    const executeImmediateTransition = (startAction, endAction, duration) => {
      // 立即播放目标动画
      endAction.time = 0;
      setWeight(endAction, 1);
      if (endAction === standAction) {
        settings['调整站立权重'] = 1;
      } else if (endAction === freezeAction) {
        settings['调整冻结权重'] = 1;
      } else if (endAction === footworkAction) {
        settings['调整舞步权重'] = 1;
      } else {
        settings['调整结束动作权重'] = 1;
      }
      endAction.play();
    };

    const setCrossFadeDuration = (defaultDuration) => {
      if (settings['使用默认过渡时长']) {
        return defaultDuration;
      } else {
        return settings['设置自定义过渡时长'];
      }
    };

    // 同步两个动画动作切换
    const synchronizeCrossFade = (startAction, endAction, duration) => {
      mixer.addEventListener('loop', onLoopFinished);
      function onLoopFinished(event) {
        if (event.action === startAction) {
          mixer.removeEventListener('loop', onLoopFinished);
          executeCrossFade(startAction, endAction, duration);
        }
      }
    };

    // 淡入淡出动画
    const executeCrossFade = (startAction, endAction, duration) => {
      setWeight(endAction, 1);
      endAction.time = 0;
      startAction.crossFadeTo(endAction, duration, true);
    };

    // 设置权重
    const setWeight = (action, weight) => {
      if (!action) return;
      action.enabled = true;
      action.setEffectiveTimeScale(1);
      action.setEffectiveWeight(weight);
    };

    // 更新权重滑块
    const updateWeightSliders = () => {
      if (!settings) return;
      settings['调整站立权重'] = standAction.getEffectiveWeight();
      settings['调整冻结权重'] = freezeAction.getEffectiveWeight();
      settings['调整舞步权重'] = footworkAction.getEffectiveWeight();
      settings['调整结束动作权重'] = endingAction.getEffectiveWeight();
    };

    // 启用或禁用某些按钮
    const updateCrossFadeControls = () => {
      if (!crossFadeControls.length) return;
      
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
    };

    // 动画循环
    const animate = () => {
      if (disposed) return;
      
      standWeight = standAction ? standAction.getEffectiveWeight() : 0;
      freezeWeight = freezeAction ? freezeAction.getEffectiveWeight() : 0;
      footworkWeight = footworkAction ? footworkAction.getEffectiveWeight() : 0;
      endingWeight = endingAction ? endingAction.getEffectiveWeight() : 0;
      
      // 更新权重和交叉淡入
      updateCrossFadeControls();
      updateWeightSliders();
      
      let mixerUpdateDelta = clock.getDelta();
      if (singleStepMode) {
        mixerUpdateDelta = sizeOfNextStep;
        sizeOfNextStep = 0;
      }
      
      // 更新所有动画状态
      mixer && mixer.update(mixerUpdateDelta);
      renderer && renderer.render(scene, camera);
      stats && stats.update();
      
      // 递归调用，实现连续动画
      if (!disposed) {
        requestAnimationFrame(animate);
      }
    };

    // 组件挂载时
    onMounted(async () => {
      // 使用try-catch包装初始化过程
      try {
        await init();
      } catch (error) {
        console.error("初始化数字人组件时出错:", error);
      }
    });

    // 组件卸载前清理资源
    onBeforeUnmount(() => {
      disposed = true;
      
      // 移除事件监听器
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      
      // 释放资源
      if (mixer) {
        mixer.stopAllAction();
      }
      
      if (gui) {
        gui.destroy();
      }
      
      // 处理场景中的其他对象
      if (scene) {
        scene.clear();
      }
      
      if (renderer) {
        renderer.dispose();
        const container = document.getElementById('digital-human-container');
        if (container && container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
      }
      
      // 移除性能监视器
      if (stats && stats.dom.parentNode) {
        stats.dom.parentNode.removeChild(stats.dom);
      }
      
      // 清理脚本标签
      document.querySelectorAll('script[src^="/P2/js/"]').forEach(script => {
        script.remove();
      });
    });

    return {
      isLoading
    };
  }
});
</script>

<style lang="less" scoped>
.digital-human-container {
  position: relative;
  width: 100%;
  height: 600px;
  overflow: hidden;
  background-color: #ebd2c3;
  
  .nav {
    background-color: rgba(235, 210, 195, 0.8);
    position: absolute;
    top: 10px;
    left: 0;
    right: 0;
    z-index: 10;
    padding: 10px 0;
    text-align: center;

    span {
      font-size: 16px;
      color: rgb(51, 99, 138);
      font-weight: 600;
    }
  }
  
  #digital-human-container {
    width: 100%;
    height: 100%;
  }
  
  .loading {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(235, 210, 195, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 100;
    
    .loader {
      border: 5px solid #f3f3f3;
      border-top: 5px solid rgb(51, 99, 138);
      border-radius: 50%;
      width: 50px;
      height: 50px;
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  }
}
</style> 