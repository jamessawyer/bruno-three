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
 */
// 环境光
const ambientLight = new T.AmbientLight(0xffffff, 0.5);
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
const directionalLight = new T.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(2, 2, 1);
scene.add(directionalLight);
const directionalFolder = pane.addFolder({
  title: "Directional Light",
});
directionalFolder.addBinding(directionalLight, "intensity", {
  min: 0,
  max: 1,
  step: 0.001,
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

/**
 * Objects
 */
const material = new T.MeshStandardMaterial();
material.roughness = 0.4;

const sphere = new T.Mesh(new T.SphereGeometry(0.5, 32, 32), material);

const plane = new T.Mesh(new T.PlaneGeometry(5, 5, 100, 100), material);
plane.position.y = -1;
plane.rotation.x = -Math.PI / 2;

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
camera.position.y = 1;
camera.position.z = 2;
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

const clock = new T.Clock();

const tick = () => {
  controls.update();
  renderer.render(scene, camera);

  requestAnimationFrame(tick);
};

tick();
