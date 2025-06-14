<template>
  <div class="simple-model-container">
    <div class="loading" id="js-loader" v-if="isLoading">
      <div class="loader"></div>
    </div>
    <div id="simple-model-container"></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from "vue";
import * as THREE from "../../assets/digital-human/js/three.module.js";
import { OrbitControls } from "../../assets/digital-human/js/OrbitControls.js";
import { GLTFLoader } from "../../assets/digital-human/js/GLTFLoader.js";
import animationModelPath from "../../assets/digital-human/images/animation.glb";

// 全局变量
let camera: THREE.PerspectiveCamera;
let scene: THREE.Scene;
let renderer: THREE.WebGLRenderer;
let model: THREE.Group;
let head: THREE.Bone;
let neck: THREE.Bone;
let waist: THREE.Bone;
let mixer: THREE.AnimationMixer;
let clock: THREE.Clock;
let standAction: THREE.AnimationAction;
const isLoading = ref(true);
let disposed = false;

// 初始化场景
const init = async (): Promise<void> => {
  try {
    // 1.获取容器
    const container = document.getElementById("simple-model-container");

    // 2.场景
    scene = new THREE.Scene();
    scene.background = null; // 透明背景

    // 获取容器尺寸
    let containerWidth = container.clientWidth;
    let containerHeight = container.clientHeight;

    // 3.相机
    camera = new THREE.PerspectiveCamera(
      45,
      containerWidth / containerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 30);

    // 4.渲染器
    renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true // 启用透明
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(containerWidth, containerHeight);
    container.appendChild(renderer.domElement);

    // 5.光照
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 1.7);
    hemiLight.position.set(0, 50, 0);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(-8, 12, 12);
    scene.add(dirLight);

    // 6.加载模型
    const loader = new GLTFLoader();
    loader.load(
      animationModelPath,
      (gltf) => {
        model = gltf.scene;
        const animations = gltf.animations;

        // 遍历所有子物体
        model.traverse((child) => {
          if (child.isBone) {
            if (child.name === "Head") {
              head = child;
            }
            if (child.name === "Neck") {
              neck = child;
            }
            if (child.name === "Spine") {
              waist = child;
            }
          }
        });

        // 设置模型比例和位置
        model.scale.set(7, 7, 7);
        model.position.set(0, -11, 0);
        scene.add(model);

        // 创建动画混合器
        mixer = new THREE.AnimationMixer(model);
        standAction = mixer.clipAction(animations[6]);
        standAction.play();

        isLoading.value = false;
        clock = new THREE.Clock();
        animate();
      },
      undefined,
      (error) => {
        console.error("模型加载错误:", error);
      }
    );

    // 轨道控制器
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = false;
    controls.enableZoom = false;
    controls.target.set(0, -5, 0);
    controls.update();

    window.addEventListener("resize", handleResize);
  } catch (error) {
    console.error("初始化错误:", error);
    isLoading.value = false;
  }
};

// 响应式调整大小
const handleResize = (): void => {
  const container = document.getElementById("simple-model-container");
  if (container && camera && renderer) {
    const width = container.clientWidth;
    const height = container.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }
};

// 获取鼠标坐标
const getMousePos = (e: MouseEvent): { x: number; y: number } => {
  return { x: e.clientX, y: e.clientY };
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
  // 使用模型在页面中的实际位置（左9%，上42.5%）作为参考点
  const modelCenterX = w.x * 0.09; // 修改为页面9%的宽度位置
  const modelCenterY = w.y * 0.425; // 修改为页面42.5%的高度位置

  // 左右看的计算
  if (x <= modelCenterX) {
    xdiff = modelCenterX - x;
    xPercentage = (xdiff / modelCenterX) * 100;
    dx = ((degreeLimit * xPercentage) / 100) * -1;
  }
  if (x >= modelCenterX) {
    xdiff = x - modelCenterX;
    xPercentage = (xdiff / (w.x - modelCenterX)) * 100;
    dx = (degreeLimit * xPercentage) / 100;
  }

  // 上下看的计算
  if (y <= modelCenterY) {
    ydiff = modelCenterY - y;
    yPercentage = (ydiff / modelCenterY) * 100;
    // 向上看的角度限制为原来的0.3倍
    dy = ((degreeLimit * 0.3 * yPercentage) / 100) * -1;
  }
  if (y >= modelCenterY) {
    ydiff = y - modelCenterY;
    yPercentage = (ydiff / (w.y - modelCenterY)) * 100;
    // 向下看的角度增加到原来的1.5倍
    dy = (degreeLimit * 1.5 * yPercentage) / 100;
  }
  return { x: dx, y: dy };
};

// 监听鼠标移动
const handleMouseMove = (e: MouseEvent): void => {
  const mousecoords = getMousePos(e);
  if (head && neck) {
    moveJoint(mousecoords, head, 30);
    moveJoint(mousecoords, neck, 10);
  }
};

// 移动关节
const moveJoint = (
  mouse: { x: number; y: number },
  joint: THREE.Bone,
  degreeLimit: number
): void => {
  let degrees = getMouseDegrees(mouse.x, mouse.y, degreeLimit);
  // 在Three.js中，x轴旋转控制上下看，y轴旋转控制左右看
  joint.rotation.x = THREE.MathUtils.degToRad(degrees.y);
  joint.rotation.y = THREE.MathUtils.degToRad(degrees.x);
};

// 动画循环
const animate = (): void => {
  if (disposed) return;

  if (mixer) {
    const delta = clock.getDelta();
    mixer.update(delta);
  }

  if (renderer && scene && camera) {
    renderer.render(scene, camera);
  }

  if (!disposed) {
    requestAnimationFrame(animate);
  }
};

// 组件挂载时
onMounted(async () => {
  try {
    await init();
    document.addEventListener("mousemove", handleMouseMove);
  } catch (error) {
    console.error("初始化数字人组件时出错:", error);
  }
});

// 组件卸载前
onBeforeUnmount(() => {
  disposed = true;
  document.removeEventListener("mousemove", handleMouseMove);
  window.removeEventListener("resize", handleResize);

  if (mixer) {
    mixer.stopAllAction();
  }

  if (scene) {
    scene.clear();
  }

  if (renderer) {
    renderer.dispose();
    const container = document.getElementById("simple-model-container");
    if (container && container.contains(renderer.domElement)) {
      container.removeChild(renderer.domElement);
    }
  }
});
</script>

<style lang="less" scoped>
.simple-model-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: transparent;

  #simple-model-container {
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