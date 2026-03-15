import * as T from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import { Pane } from "tweakpane";

// --- Tweakpane 调试面板 ---
const pane = new Pane({ title: "参数调试" });
// Canvas
const canvas = document.getElementById("app") as HTMLCanvasElement;

// --- 初始化场景 ---
const scene = new T.Scene();

// Camera
const camera = new T.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(4, 2, 5);

// Renderer
const renderer = new T.WebGLRenderer({
  canvas,
  antialias: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * House
 */
// Temporary sphere
const sphere = new T.Mesh(
  new T.SphereGeometry(1, 32, 32),
  new T.MeshStandardMaterial({ roughness: 0.7 }),
);
sphere.position.y = 1;
scene.add(sphere);

// Floor
const floor = new T.Mesh(
  new T.PlaneGeometry(20, 20),
  new T.MeshStandardMaterial({ color: "#a9c388" }),
);
floor.rotation.x = -Math.PI * 0.5;
floor.position.y = 0;
scene.add(floor);

/**
 * Lights
 */
// Ambient light
const ambientLight = new T.AmbientLight("#ffffff", 0.5);
const ambientLightFolder = pane.addFolder({
  title: "Ambient Light",
});
ambientLightFolder.addBinding(ambientLight, "intensity", {
  min: 0,
  max: 1,
  step: 0.001,
});
scene.add(ambientLight);

// Directional light
const moonLight = new T.DirectionalLight("#ffffff", 0.5);
moonLight.position.set(4, 5, -2);
const moonLightFolder = pane.addFolder({
  title: "Moon Light",
});
moonLightFolder.addBinding(moonLight, "intensity", {
  min: 0,
  max: 1,
  step: 0.1,
});
moonLightFolder.addBinding(moonLight.position, "x", {
  min: -5,
  max: 5,
  step: 0.001,
});
moonLightFolder.addBinding(moonLight.position, "y", {
  min: -5,
  max: 5,
  step: 0.001,
});
moonLightFolder.addBinding(moonLight.position, "z", {
  min: -5,
  max: 5,
  step: 0.001,
});
scene.add(moonLight);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

// --- 适配窗口 ---
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

/**
 * Animate
 */
// r163 中使用 Timer 来获取时间
const timer = new T.Timer();

const tick = () => {
  timer.update();
  const elapsedTime = timer.getElapsed();

  // Update controls
  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
