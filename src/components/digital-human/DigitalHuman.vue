<template>
  <div class="digital-human-container">
    <div class="loading" id="js-loader" v-if="isLoading">
      <div class="loader"></div>
    </div>
    <div id="digital-human-container"></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from "vue";
import * as THREE from "../../assets/digital-human/js/three.module.js";
import { OrbitControls } from "../../assets/digital-human/js/OrbitControls.js";
import { GLTFLoader } from "../../assets/digital-human/js/GLTFLoader.js";
import animationModelPath from "../../assets/digital-human/images/animation.glb";

interface Props {
  width?: number | string;
  showControls?: boolean;
}

interface Settings {
  showModel: boolean;
  showSkeleton: boolean;
  deactivateAllActions: () => void;
  pauseContinue: () => void;
  singleStep: () => void;
  stepSize: number;
  stand: () => void;
  freeze: () => void;
  footwork: () => void;
  ending: () => void;
  useDefaultDuration: boolean;
  customDuration: number;
  standWeight: number;
  freezeWeight: number;
  footworkWeight: number;
  endingWeight: number;
  timeScale: number;
}

// Props 定义
const props = withDefaults(defineProps<Props>(), {
  width: '100%',
  showControls: true
});

// 全局变量
let camera: THREE.PerspectiveCamera;
let scene: THREE.Scene;
let renderer: THREE.WebGLRenderer;
let model: THREE.Group;
let skeleton: THREE.SkeletonHelper;
let mixer: THREE.AnimationMixer;
let clock: THREE.Clock;
let neck: THREE.Bone;
let waist: THREE.Bone;
let nowaction: THREE.AnimationAction;
let index = 0;
let standWeight: number;
let freezeWeight: number;
let footworkWeight: number;
let endingWeight: number;
let settings: Settings;
let crossFadeControls: any[] = [];
let InteractiveAnims: any[] = [];
let standAction: THREE.AnimationAction;
let freezeAction: THREE.AnimationAction;
let footworkAction: THREE.AnimationAction;
let endingAction: THREE.AnimationAction;
const currentAction = ref<THREE.AnimationAction | null>(null);
let singleStepMode = false;
let sizeOfNextStep = 0;
let actions: THREE.AnimationAction[];
let disposed = false;
let gui: any = null;

const isLoading = ref(true);

// 输出模型路径信息
//console.log('数字人模型路径:', animationModelPath);
// console.log('模型类型:', typeof animationModelPath);
//console.log('组件宽度:', props.width);

// 初始化场景
const init = async (): Promise<void> => {
  try {
    // 1.获取容器
    const container = document.getElementById("digital-human-container");

    // 2.场景
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xebd2c3); // 恢复原来的背景色

    // 获取容器尺寸
    let containerWidth = container.clientWidth;
    let containerHeight = container.clientHeight;

    // 如果容器尺寸为0，则使用props中的值
    if (containerWidth === 0)
      containerWidth =
        typeof props.width === "number"
          ? props.width
          : container.parentElement.clientWidth;

    console.log("容器尺寸:", containerWidth, containerHeight);

    // 3.相机 - 调整视角使地面和天空各占一半
    camera = new THREE.PerspectiveCamera(
      45,
      containerWidth / containerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 30); // 水平视角，不抬高

    // 4.渲染器
    renderer = new THREE.WebGLRenderer({ 
      antialias: true
    });
    renderer.setPixelRatio(window.devicePixelRatio);

    // 调整为容器大小
    renderer.setSize(containerWidth, containerHeight);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // 5.光照
    // 5.1环境光
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 1.7);
    hemiLight.position.set(0, 50, 0);
    scene.add(hemiLight);

    // 5.2平行光
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(-8, 12, 12);

    // 5.3设置阴影相机的裁剪面
    let d = 8.25;
    dirLight.castShadow = true;
    dirLight.shadow.mapSize = new THREE.Vector2(1024, 1024);
    dirLight.shadow.camera.near = 0.1;
    dirLight.shadow.camera.far = 1500;
    dirLight.shadow.camera.left = d * -1;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = d * -1;
    scene.add(dirLight);

    // 6.地面
    let floorGeometry = new THREE.PlaneGeometry(5000, 5000, 1, 1);
    let floorMaterial = new THREE.MeshPhongMaterial({
      color: 0xebd2c3,
      shininess: 0,
    });
    let floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -0.5 * Math.PI; // 保持水平旋转
    floor.receiveShadow = true;
    floor.position.y = -11; // 保持原来的位置设置
    scene.add(floor);

    // 7.加载模型
    const loader = new GLTFLoader();

    // 7.2加载模型
    //console.log('开始加载模型，路径:', animationModelPath);
    loader.load(
      animationModelPath,
      (gltf) => {
        console.log("模型加载成功:", gltf);
        scene.add(gltf.scene);
        // 7.3添加模型
        model = gltf.scene;
        const animations = gltf.animations;
        // console.log('动画数量:', animations.length);

        // 7.4遍历所有子物体
        model.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            // console.log('发现网格:', child.name);
          }
          if (child.isBone && child.name === "Neck") {
            neck = child; // 颈部
            //console.log('找到颈部骨骼');
          }
          if (child.isBone && child.name === "Spine") {
            waist = child; // 腰部
            // console.log('找到腰部骨骼');
          }
        });

        // 将模型比例设置为合适大小
        model.scale.set(7, 7, 7); // 恢复原来的缩放比例
        // 移动模型到合适位置
        model.position.set(0, -11, 0); // 调整到地面上
        scene.add(model);
        // console.log('模型已添加到场景中');

        // 8.2骨骼处理
        skeleton = new THREE.SkeletonHelper(model);
        skeleton.visible = false;
        scene.add(skeleton);

        // 创建动画混合器
        mixer = new THREE.AnimationMixer(model);
        //console.log("创建动画混合器");

        // 加载所有动画
        standAction = mixer.clipAction(animations[6]);
        freezeAction = mixer.clipAction(animations[5]);
        footworkAction = mixer.clipAction(animations[4]);
        endingAction = mixer.clipAction(animations[0]);

        standAction.name = "stand";
        freezeAction.name = "freeze";
        footworkAction.name = "footwork";
        endingAction.name = "ending";

        actions = [standAction, freezeAction, footworkAction, endingAction];

        //console.log('开始激活动作');
        actions.forEach(function (action) {
          action.enabled = true;
          action.setEffectiveWeight(0);
          action.play();
          // console.log('激活动作:', action.name);
        });

        // 设置默认动作
        currentAction.value = standAction;
        setWeight(standAction, 1);
        //console.log('设置默认动作:', standAction.name);

        isLoading.value = false;

        // 监听事件
        document.addEventListener("keydown", handleKeyDown);

        document.addEventListener("mousemove", handleMouseMove);

        clock = new THREE.Clock();
        animate();
      },

      (progress) => {
        const percent = ((progress.loaded / progress.total) * 100).toFixed(2);
      },
      (error) => {
        console.error("模型加载错误:", error);
      }
    );

    // 轨道控制器
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = true;
    controls.enableZoom = true;
    controls.target.set(0, -5, 0);
    controls.update();
    //console.log('轨道控制器已设置');

    window.addEventListener("resize", handleResize);
  } catch (error) {
    console.error("初始化错误:", error);
    isLoading.value = false;
  }
};

// 响应式调整大小
const handleResize = (): void => {
  const container = document.getElementById("digital-human-container");
  if (container && camera && renderer) {
    let width = container.clientWidth;
    let height = container.clientHeight;

    // 如果容器尺寸为0，则使用props中的值
    if (width === 0)
      width =
        typeof props.width === "number"
          ? props.width
          : container.parentElement.clientWidth;
    if (height === 0) height = 400;

    // console.log("调整大小:", width, height);

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }
};

// 获取鼠标坐标
const getMousePos = (e: MouseEvent): { x: number; y: number } => {
  return { x: e.clientX, y: e.clientY };
};

// 移动关节
const moveJoint = (
  mouse: { x: number; y: number },
  joint: THREE.Bone,
  degreeLimit: number
): void => {
  let degrees = getMouseDegrees(mouse.x, mouse.y, degreeLimit);
  joint.rotation.y = THREE.MathUtils.degToRad(degrees.x);
  joint.rotation.x = THREE.MathUtils.degToRad(degrees.y);
};

// 调整对应旋转角度
const getMouseDegrees = (
  x: number,
  y: number,
  degreeLimit: number
): { x: number; y: number } => {
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
    dy = ((degreeLimit * 0.5 * yPercentage) / 100) * -1;
  }
  if (y >= w.y / 2) {
    ydiff = y - w.y / 2;
    yPercentage = (ydiff / (w.y / 2)) * 100;
    dy = (degreeLimit * yPercentage) / 100;
  }
  return { x: dx, y: dy };
};

// 监听鼠标移动
const handleMouseMove = (e: MouseEvent): void => {
  const mousecoords = getMousePos(e);
  if (neck && waist) {
    moveJoint(mousecoords, neck, 50);
    moveJoint(mousecoords, waist, 30);
  }
};

// 监听键盘事件
const handleKeyDown = (e: KeyboardEvent): void => {
  let time = 0;
  if (e.keyCode === 40 || e.keyCode === 39) {
    // 按向下或向右键切换
    index >= actions.length - 1 ? (index = 0) : index++;
    prepareCrossFade(currentAction.value, actions[index], time); // 切换下一个动画
    currentAction.value = actions[index];
  }
  if (e.keyCode === 38 || e.keyCode === 37) {
    // 向左或向上键切换
    index === 0 ? (index = actions.length - 1) : index--;
    prepareCrossFade(currentAction.value, actions[index], time); // 切换前一个动画
    currentAction.value = actions[index];
  }
};

// 创建控制面板
const createPanel = (guiInstance: any): void => {
  try {
    gui = guiInstance;

    // 设置控制面板位置
    gui.domElement.style.position = "absolute";
    gui.domElement.style.right = "20px";
    gui.domElement.style.top = "20px";

    // 添加folder
    const folder1 = gui.addFolder("Visibility Control");
    const folder2 = gui.addFolder("Activate/Deactivate");
    const folder3 = gui.addFolder("Pause/Step Control");
    const folder4 = gui.addFolder("Action Switch");
    const folder5 = gui.addFolder("Action Weight");
    const folder6 = gui.addFolder("Speed Control");

    // 设置控制项
    settings = {
      showModel: true,
      showSkeleton: false,
      deactivateAllActions: deactivateAllActions,
      pauseContinue: pauseContinue,
      singleStep: toSingleStepMode,
      stepSize: 0.05,
      stand: function () {
        prepareCrossFade(currentAction.value, standAction, 0);
        currentAction.value = standAction;
      },
      freeze: function () {
        prepareCrossFade(currentAction.value, freezeAction, 0);
        currentAction.value = freezeAction;
      },
      footwork: function () {
        prepareCrossFade(currentAction.value, footworkAction, 0);
        currentAction.value = footworkAction;
      },
      ending: function () {
        prepareCrossFade(currentAction.value, endingAction, 0);
        currentAction.value = endingAction;
      },
      useDefaultDuration: true,
      customDuration: 0.5,
      standWeight: 0.0,
      freezeWeight: 0.0,
      footworkWeight: 0.0,
      endingWeight: 0.0,
      timeScale: 1.0,
    };

    folder1.add(settings, "showModel").onChange(showModel);
    folder1.add(settings, "showSkeleton").onChange(showSkeleton);
    folder2.add(settings, "deactivateAllActions");
    folder3.add(settings, "pauseContinue");
    folder3.add(settings, "singleStep");
    folder3.add(settings, "stepSize", 0.01, 0.1, 0.001);

    crossFadeControls.push(folder4.add(settings, "stand"));
    crossFadeControls.push(folder4.add(settings, "freeze"));
    crossFadeControls.push(folder4.add(settings, "footwork"));
    crossFadeControls.push(folder4.add(settings, "ending"));

    folder4.add(settings, "useDefaultDuration");
    folder4.add(settings, "customDuration", 0, 10, 0.01);

    // 控制不同动画权重
    folder5
      .add(settings, "standWeight", 0.0, 1.0, 0.01)
      .listen()
      .onChange(function (weight) {
        setWeight(standAction, weight);
      });
    folder5
      .add(settings, "freezeWeight", 0.0, 1.0, 0.01)
      .listen()
      .onChange(function (weight) {
        setWeight(freezeAction, weight);
      });
    folder5
      .add(settings, "footworkWeight", 0.0, 1.0, 0.01)
      .listen()
      .onChange(function (weight) {
        setWeight(footworkAction, weight);
      });
    folder5
      .add(settings, "endingWeight", 0.0, 1.0, 0.01)
      .listen()
      .onChange(function (weight) {
        setWeight(endingAction, weight);
      });
    folder6
      .add(settings, "timeScale", 0.0, 1.5, 0.01)
      .onChange(modifyTimeScale);

    folder1.open();
    folder2.open();
    folder3.open();
    folder4.open();
    folder5.open();
    folder6.open();
  } catch (err) {
    console.error("创建控制面板失败:", err);
  }
};

// 模型的可见性
const showModel = (visibility: boolean): void => {
  model.visible = visibility;
};

// 骨骼的可见性
const showSkeleton = (visibility: boolean): void => {
  skeleton.visible = visibility;
};

// 修改时间缩放比例
const modifyTimeScale = (speed: number): void => {
  mixer.timeScale = speed;
};

// 停止所有动画动作
const deactivateAllActions = (): void => {
  actions.forEach(function (action) {
    action.stop();
    action.setEffectiveWeight(0);
    action.enabled = false;
  });
};

// 激活所有动画动作并为其设置权重
const activateAllActions = (): void => {
  // console.log("激活所有动作");
  actions.forEach(function (action) {
    action.enabled = true;
    action.setEffectiveWeight(0);
    action.play();
  });
  // 默认播放
  setWeight(footworkAction, 1);
};

// 在动画暂停和继续之间切换
const pauseContinue = (): void => {
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
const pauseAllActions = (): void => {
  actions.forEach(function (action) {
    action.paused = true;
  });
};

// 恢复所有动画
const unPauseAllActions = (): void => {
  actions.forEach(function (action) {
    action.paused = false;
  });
};

// 切换到单步模式，并设置下一步步长
const toSingleStepMode = (): void => {
  unPauseAllActions();
  singleStepMode = true;
  sizeOfNextStep = settings["stepSize"];
};

// 从一个动画过渡到另一个动画
const prepareCrossFade = (
  startAction: THREE.AnimationAction,
  endAction: THREE.AnimationAction,
  defaultDuration: number
): void => {
  if (!startAction || !endAction) {
    console.error("动作对象无效:", { startAction, endAction });
    return;
  }

  const duration = setCrossFadeDuration(defaultDuration);

  // 重置所有动画的权重
  actions.forEach((action) => {
    if (action !== endAction) {
      setWeight(action, 0);
    }
  });

  // 设置目标动作的权重和时间
  endAction.time = 0;
  setWeight(endAction, 1);
  endAction.play();
};

const setCrossFadeDuration = (defaultDuration: number): number => {
  if (settings["useDefaultDuration"]) {
    return defaultDuration;
  } else {
    return settings["customDuration"];
  }
};

const synchronizeCrossFade = (
  startAction: THREE.AnimationAction,
  endAction: THREE.AnimationAction,
  duration: number
): void => {
  mixer.addEventListener("loop", onLoopFinished);
  function onLoopFinished(event) {
    if (event.action === startAction) {
      mixer.removeEventListener("loop", onLoopFinished);
      executeCrossFade(startAction, endAction, duration);
    }
  }
};

// 淡入淡出
const executeCrossFade = (
  startAction: THREE.AnimationAction,
  endAction: THREE.AnimationAction,
  duration: number
): void => {
  setWeight(endAction, 1);
  endAction.time = 0;
  startAction.crossFadeTo(endAction, duration, true);
};

// 设置权重
const setWeight = (action: THREE.AnimationAction, weight: number): void => {
  if (!action) {
    console.warn("动作不存在");
    return;
  }
  action.enabled = true;
  action.setEffectiveTimeScale(1);
  action.setEffectiveWeight(weight);
};

// 更新权重滑块
const updateWeightSliders = (): void => {
  if (!settings) return;
  settings["standWeight"] = standAction.getEffectiveWeight();
  settings["freezeWeight"] = freezeAction.getEffectiveWeight();
  settings["footworkWeight"] = footworkAction.getEffectiveWeight();
  settings["endingWeight"] = endingAction.getEffectiveWeight();
};

// 启用或禁用某些按钮
const updateCrossFadeControls = (): void => {
  if (!crossFadeControls.length) return;

  if (
    standWeight === 1 &&
    freezeWeight === 0 &&
    footworkWeight === 0 &&
    endingWeight === 0
  ) {
    crossFadeControls[0].disable();
    crossFadeControls[1].enable();
    crossFadeControls[2].enable();
    crossFadeControls[3].enable();
  }
  if (
    standWeight === 0 &&
    freezeWeight === 1 &&
    footworkWeight === 0 &&
    endingWeight === 0
  ) {
    crossFadeControls[0].enable();
    crossFadeControls[1].disable();
    crossFadeControls[2].enable();
    crossFadeControls[3].enable();
  }
  if (
    standWeight === 0 &&
    freezeWeight === 0 &&
    footworkWeight === 1 &&
    endingWeight === 0
  ) {
    crossFadeControls[0].enable();
    crossFadeControls[1].enable();
    crossFadeControls[2].disable();
    crossFadeControls[3].enable();
  }
  if (
    standWeight === 0 &&
    freezeWeight === 0 &&
    footworkWeight === 0 &&
    endingWeight === 1
  ) {
    crossFadeControls[0].enable();
    crossFadeControls[1].enable();
    crossFadeControls[2].enable();
    crossFadeControls[3].disable();
  }
  if (
    standWeight === 0 &&
    freezeWeight === 0 &&
    footworkWeight === 0 &&
    endingWeight === 0
  ) {
    crossFadeControls.forEach((control) => control.enable());
  }
};

// 动画循环
const animate = (): void => {
  if (disposed) return;

  // 检查关键对象是否存在
  if (!scene || !camera || !renderer) {
    console.error("动画循环中缺少关键对象:", {
      scene: !!scene,
      camera: !!camera,
      renderer: !!renderer,
    });
    return;
  }

  // 检查模型是否存在
  if (!model) {
    console.warn("模型尚未加载");
  } else if (!model.visible) {
    console.warn("模型存在但不可见");
  }

  // 更新动画混合器
  if (mixer) {
    const delta = clock.getDelta();
    mixer.update(delta);
  } else {
    console.warn("动画混合器不存在");
  }

  // 渲染场景
  try {
    renderer.render(scene, camera);
  } catch (error) {
    console.error("渲染场景时出错:", error);
  }

  // 使用 requestAnimationFrame 继续动画循环
  if (!disposed) {
    requestAnimationFrame(animate);
  }
};

// 组件挂载时
onMounted(async () => {
  try {
    await init();

    // 创建时钟
    clock = new THREE.Clock();

    // 开始动画循环
    animate();

    // 定义事件处理函数
    const handleModelVisibilityChange = (e: CustomEvent): void => {
      showModel(e.detail.visible);
    };

    const handleSkeletonVisibilityChange = (e: CustomEvent): void => {
      showSkeleton(e.detail.visible);
    };

    const handleActionChange = (e: CustomEvent): void => {
      const action = e.detail.action;
      let targetAction;
      switch (action) {
        case "stand":
          targetAction = standAction;
          break;
        case "freeze":
          targetAction = freezeAction;
          break;
        case "footwork":
          targetAction = footworkAction;
          break;
        case "ending":
          targetAction = endingAction;
          break;
      }

      if (!targetAction) {
        console.error("目标动作不存在:", action);
        return;
      }

      // 确保当前动作存在
      if (!currentAction.value) {
        targetAction.play();
        currentAction.value = targetAction;
        return;
      }

      // 停止当前动作
      if (currentAction.value) {
        currentAction.value.stop();
      }

      // 重置所有动作的权重
      actions.forEach((action) => {
        if (action !== targetAction) {
          setWeight(action, 0);
        }
      });

      // 设置并播放目标动作
      targetAction.time = 0;
      setWeight(targetAction, 1);
      targetAction.play();
      currentAction.value = targetAction;

      // 触发权重变化事件，更新控制面板
      const weights = {
        stand: targetAction === standAction ? 1 : 0,
        freeze: targetAction === freezeAction ? 1 : 0,
        footwork: targetAction === footworkAction ? 1 : 0,
        ending: targetAction === endingAction ? 1 : 0,
      };

      // 触发权重变化事件
      window.dispatchEvent(
        new CustomEvent("weight-change", {
          detail: weights,
        })
      );
    };

    const handleWeightChange = (e: CustomEvent): void => {
      const weights = e.detail;
      if (standAction) setWeight(standAction, weights.stand);
      if (freezeAction) setWeight(freezeAction, weights.freeze);
      if (footworkAction) setWeight(footworkAction, weights.footwork);
      if (endingAction) setWeight(endingAction, weights.ending);
    };

    const handleSpeedChange = (e: CustomEvent): void => {
      modifyTimeScale(e.detail.speed);
    };

    const handlePauseContinue = (e: CustomEvent): void => {
      if (e.detail.paused) {
        mixer.stopAllAction();
      } else {
        activateAllActions();
      }
    };

    const handleStopAll = (): void => {
      deactivateAllActions();
    };

    // 添加事件监听器
    window.addEventListener(
      "model-visibility-change",
      handleModelVisibilityChange
    );
    window.addEventListener(
      "skeleton-visibility-change",
      handleSkeletonVisibilityChange
    );
    window.addEventListener("action-change", (e: CustomEvent) => {
      handleActionChange(e);
    });
    window.addEventListener("weight-change", (e: CustomEvent) => {
      handleWeightChange(e);
    });
    window.addEventListener("speed-change", handleSpeedChange);
    window.addEventListener("pause-continue", handlePauseContinue);
    window.addEventListener("stop-all", handleStopAll);

    // 在组件卸载前保存事件处理函数的引用
    onBeforeUnmount(() => {
      disposed = true;

      // 移除事件监听器
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);

      // 移除自定义事件监听器
      window.removeEventListener(
        "model-visibility-change",
        handleModelVisibilityChange
      );
      window.removeEventListener(
        "skeleton-visibility-change",
        handleSkeletonVisibilityChange
      );
      window.removeEventListener("action-change", handleActionChange);
      window.removeEventListener("weight-change", handleWeightChange);
      window.removeEventListener("speed-change", handleSpeedChange);
      window.removeEventListener("pause-continue", handlePauseContinue);
      window.removeEventListener("stop-all", handleStopAll);

      // 释放资源
      if (mixer) {
        mixer.stopAllAction();
      }

      // 处理场景中的其他对象
      if (scene) {
        scene.clear();
      }

      if (renderer) {
        renderer.dispose();
        const container = document.getElementById("digital-human-container");
        if (container && container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
      }
    });
  } catch (error) {
    console.error("初始化数字人组件时出错:", error);
  }
});

// 暴露方法给模板使用
defineExpose({
  updateSize: (width: number, height: number): void => {
    const container = document.getElementById("digital-human-container");
    if (container && camera && renderer) {
      camera.aspect = width / (height || 400);
      camera.updateProjectionMatrix();
      renderer.setSize(width, height || 400);
    }
  },
});
</script>

<style lang="less" scoped>
.digital-human-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #ebd2c3;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

  #digital-human-container {
    width: 100%;
    height: 100%;
    min-height: 600px;
    background: #ebd2c3;
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
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(360deg);
      }
    }
  }
}
</style>
