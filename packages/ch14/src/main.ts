import * as T from "three";
import { RectAreaLightHelper } from "three/examples/jsm/Addons.js";
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
  step: 0.01,
});

// 平行光
const directionalLight = new T.DirectionalLight(0x00fffc, 0.3);
directionalLight.position.set(1, 0.25, 0);
scene.add(directionalLight);

const directionalFolder = pane.addFolder({
  title: "Directional Light",
});
directionalFolder.addBinding(directionalLight.position, "x", {
  min: -5,
  max: 5,
  step: 0.01,
});

// 半球光
const hemisphereLight = new T.HemisphereLight(0xff0000, 0x0000ff, 1);
scene.add(hemisphereLight);

// 点光源
const pointLight = new T.PointLight(0xff9000, 0.5, 10, 2);
pointLight.position.set(1, -0.5, 1);
scene.add(pointLight);

// 矩形区域光（类似摄影棚补光灯效果）
// 🚨 它只对 MeshStandardMaterial & MeshPhysicalMaterial 材质有效
const rectAreaLight = new T.RectAreaLight(0x4e00ff, 20, 1, 1);
rectAreaLight.position.set(-1.5, 0.5, 1.5);
rectAreaLight.lookAt(new T.Vector3());
scene.add(rectAreaLight);

const rectFolder = pane.addFolder({
  title: "RectAreaLight",
});
rectFolder.addBinding(rectAreaLight.position, "x", {
  min: -5,
  max: 5,
  step: 0.1,
});
rectFolder.addBinding(rectAreaLight.position, "y", {
  min: -5,
  max: 5,
  step: 0.1,
});
rectFolder.addBinding(rectAreaLight.position, "z", {
  min: -5,
  max: 5,
  step: 0.1,
});
const rectParam = {
  size: 1,
};
rectFolder
  .addBinding(rectParam, "size", {
    min: 1,
    max: 10,
    step: 0.1,
  })
  .on("change", (ev) => {
    rectAreaLight.width = ev.value;
    rectAreaLight.height = ev.value;
  });

// 聚光灯
// 0.25 表示 penumbra 半影
const spotLight = new T.SpotLight(0x78ff00, 4, 10, Math.PI * 0.1, 0.25, 1);
spotLight.position.set(0, 2, 3);
scene.add(spotLight);

// spotLight.target 是 Three.js 给 SpotLight（以及 DirectionalLight）配套的一个“目标对象”，类型是 THREE.Object3D。
spotLight.target.position.x = -0.75;
scene.add(spotLight.target);

// 光源Helpers
const hemisphereLightHelper = new T.HemisphereLightHelper(hemisphereLight, 0.2);
scene.add(hemisphereLightHelper);
// 平行光辅助对象
const directionalLightHelper = new T.DirectionalLightHelper(directionalLight, 0.2);
scene.add(directionalLightHelper);
// 点光源辅助对象
const pointLightHelper = new T.PointLightHelper(pointLight, 0.2);
scene.add(pointLightHelper);

// 聚光灯辅助对象
const spotLightHelper = new T.SpotLightHelper(spotLight);
scene.add(spotLightHelper);

// 矩形区域光辅助对象
const rectAreaLightHelper = new RectAreaLightHelper(rectAreaLight);
scene.add(rectAreaLightHelper);

/**
 * Objects
 */
const material = new T.MeshStandardMaterial();
material.roughness = 0.4;

const sphere = new T.Mesh(new T.SphereGeometry(0.5, 32, 32), material);
sphere.position.x = -2;

const cube = new T.Mesh(new T.BoxGeometry(0.5, 0.5, 0.5), material);

const torus = new T.Mesh(new T.TorusGeometry(0.3, 0.2, 20, 45), material);
torus.position.x = 2;

const plane = new T.Mesh(new T.PlaneGeometry(5, 5, 100, 100), material);
plane.position.y = -1;
plane.rotation.x = -Math.PI / 2;

scene.add(sphere, cube, torus, plane);

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
camera.position.z = 3;
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
  const elapsedTime = clock.getElapsedTime();

  sphere.rotation.x = 0.2 * elapsedTime;
  cube.rotation.x = 0.2 * elapsedTime;
  torus.rotation.x = 0.2 * elapsedTime;

  sphere.rotation.y = -0.15 * elapsedTime;
  cube.rotation.y = -0.15 * elapsedTime;
  torus.rotation.y = -0.15 * elapsedTime;

  controls.update();
  renderer.render(scene, camera);

  requestAnimationFrame(tick);
};

tick();
