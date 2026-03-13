import * as T from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Pane } from "tweakpane";

// Canvas
const canvas = document.getElementById("app") as HTMLCanvasElement;

// --- 初始化场景 ---
const scene = new T.Scene();

const pane = new Pane();

/**
 * Lights
 * 📚 只有 PointLight, DirectionalLight, SpotLight 可以投射阴影
 */
// 环境光
const ambientLight = new T.AmbientLight(0xffffff, 0.2);
scene.add(ambientLight);
const amibientFolder = pane.addFolder({
  title: "Ambient Light",
});
amibientFolder.addBinding(ambientLight, "intensity", {
  min: 0,
  max: 1,
  step: 0.001,
});

// 平行光
const directionalLight = new T.DirectionalLight(0xffffff, 0.9);
directionalLight.position.set(2, 2, -1);
scene.add(directionalLight);
// 平行光投射阴影
// 🔥 平行光在 castShadow = true 时会有 shadow 属性（DirectionalLightShadow），用来控制阴影怎么算、怎么画
directionalLight.castShadow = true;

console.log(directionalLight.shadow);
// 🔥 阴影是通过一张纹理（阴影贴图）算出来的，mapSize 是 Vector2，表示这张纹理的宽和高（单位：像素）。
// 分辨率越大（如 2048、4096）：阴影更清晰、锯齿更少，但占用的显存和计算更多。
// 分辨率越小（如 512、256）：阴影更糊、边缘更锯齿，但性能更好。
directionalLight.shadow.mapSize.set(1024, 1024);
// 这里的平行光camera是一个正交摄像机
directionalLight.shadow.camera.near = 1;
directionalLight.shadow.camera.far = 6;
// 这里的 left、right、top、bottom 是平行光camera的视锥体范围，决定了阴影投射的范围
directionalLight.shadow.camera.left = -2;
directionalLight.shadow.camera.right = 2;
directionalLight.shadow.camera.top = 2;
directionalLight.shadow.camera.bottom = -2;

// 阴影的模糊半径，越大越模糊
directionalLight.shadow.radius = 10;

// directionalLighter shadow camera helper
const directionalLightCameraHelper = new T.CameraHelper(directionalLight.shadow.camera);
directionalLightCameraHelper.visible = false;
scene.add(directionalLightCameraHelper);

const directionalFolder = pane.addFolder({
  title: "Directional Light",
});
directionalFolder.addBinding(directionalLight, "intensity", {
  min: 0,
  max: 4,
  step: 0.1,
});
directionalFolder.addBinding(directionalLight.position, "x", {
  min: -5,
  max: 5,
  step: 0.001,
});
directionalFolder.addBinding(directionalLight.position, "y", {
  min: -5,
  max: 5,
  step: 0.001,
});
directionalFolder.addBinding(directionalLight.position, "z", {
  min: -5,
  max: 5,
  step: 0.001,
});
directionalFolder.addBinding(directionalLightCameraHelper, "visible", {
  value: false,
  label: "Shadow Camera Helper",
});
directionalFolder.addBinding(directionalLight.shadow, "radius", {
  min: 0,
  max: 10,
  step: 0.001,
  label: "Shadow Radius",
});

// 聚光灯
const spotLight = new T.SpotLight(0xffffff, 3, 20, Math.PI * 0.3);
spotLight.castShadow = true;
spotLight.shadow.mapSize.set(1024, 1024);
spotLight.shadow.camera.fov = 30;
spotLight.shadow.camera.near = 1;
spotLight.shadow.camera.far = 6;

spotLight.position.set(0, 2, 2);
scene.add(spotLight);
scene.add(spotLight.target);

// 聚光灯相机是透视摄像机
const spotLightCameraHelper = new T.CameraHelper(spotLight.shadow.camera);
spotLightCameraHelper.visible = false;
scene.add(spotLightCameraHelper);

const spotLightFolder = pane.addFolder({
  title: "Spot Light",
});
spotLightFolder.addBinding(spotLight, "intensity", {
  min: 0,
  max: 4,
  step: 0.1,
});
spotLightFolder.addBinding(spotLightCameraHelper, "visible", {
  value: false,
  label: "Shadow Camera Helper",
});

// 点光源（位置在球体左上方，能照到球体和地面）
const pointLight = new T.PointLight(0xffffff, 3);
pointLight.position.set(-1, 1, 0);
pointLight.castShadow = true;
pointLight.shadow.mapSize.set(1024, 1024);
pointLight.shadow.camera.near = 0.1;
pointLight.shadow.camera.far = 5;
scene.add(pointLight);

// 点光源的摄像机是透视摄像机
// 这里可能渲染的辅助器方向朝向随机方向
// 这是因为 点光源的阴影是用「立方体 6 个面」算出来的，你看到的辅助器只是其中一个方向的相机。
const pointLightCameraHelper = new T.CameraHelper(pointLight.shadow.camera);
pointLightCameraHelper.visible = false;
scene.add(pointLightCameraHelper);

const pointLightFolder = pane.addFolder({
  title: "Point Light",
});

pointLightFolder.addBinding(pointLight, "intensity", {
  min: 0,
  max: 4,
  step: 0.1,
});
pointLightFolder.addBinding(pointLightCameraHelper, "visible", {
  value: false,
  label: "Shadow Camera Helper",
});

/**
 * Objects
 */
const material = new T.MeshStandardMaterial();
material.roughness = 0.7;

const materialFolder = pane.addFolder({
  title: "Material",
});
materialFolder.addBinding(material, "roughness", {
  min: 0,
  max: 1,
  step: 0.001,
});
materialFolder.addBinding(material, "metalness", {
  min: 0,
  max: 1,
  step: 0.001,
});

const sphere = new T.Mesh(new T.SphereGeometry(0.5, 32, 32), material);
// 球体投射阴影
sphere.castShadow = true;

const plane = new T.Mesh(new T.PlaneGeometry(5, 5, 100, 100), material);
plane.position.y = -0.5;
plane.rotation.x = -Math.PI / 2;

// 平面接收阴影
plane.receiveShadow = true;

scene.add(sphere, plane);

const axisHelper = new T.AxesHelper(2);
scene.add(axisHelper);

// Sizes
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

// resize 事件
window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // 更新相机
  camera.aspect = sizes.width / sizes.height; // 更新宽高比
  camera.updateProjectionMatrix(); // 更新相机投影矩阵

  renderer.setSize(sizes.width, sizes.height); // 更新渲染器大小
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// 进入和退出全屏
window.addEventListener("dblclick", () => {
  if (document.fullscreenElement) {
    document.exitFullscreen();
  } else {
    // 对特定元素申请进入全屏（比如video, canvas等）
    canvas?.requestFullscreen();
  }
});

// Camera

// 透视相机
const camera = new T.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.x = 1;
camera.position.y = 8;
camera.position.z = 8;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true; // 必须在 tick() 中调用 controls.update()

// Renderer
const renderer = new T.WebGLRenderer({
  canvas: canvas,
});

renderer.setSize(sizes.width, sizes.height);
// 如果 pixelRatio 设置大于2 会消耗更多性能，但实际效果也没那么明显
// 因此最大设置为2即可
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// 阴影映射
renderer.shadowMap.enabled = true;
// 阴影映射类型，PCFSoftShadowMap 是软阴影
//// Shadowing Type
// export const BasicShadowMap: 0; // 性能较好，但是渲染效果比较差
// export const PCFShadowMap: 1; // 默认
// 如果设置为这个 directionalLight.shadow.radius 将失效；
// 一般会通过 directionalLight.shadow.mapSize 设置为更小的值达到模糊的效果
// export const PCFSoftShadowMap: 2;
// export const VSMShadowMap: 3; // 性能比较差
renderer.shadowMap.type = T.PCFShadowMap;
renderer.toneMapping = T.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.5; // 提高整体亮度

const clock = new T.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  controls.update();
  renderer.render(scene, camera);

  requestAnimationFrame(tick);
};

tick();
