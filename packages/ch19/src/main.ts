import * as T from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Pane } from "tweakpane";

const canvas = document.getElementById("app") as HTMLCanvasElement;

// --- 初始化场景 ---
const scene = new T.Scene();

const parameters = {
  materialColor: "#ff0000",
};

// Sizes
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

// Mesh
const cube = new T.Mesh(
  new T.BoxGeometry(1, 1, 1),
  new T.MeshBasicMaterial({ color: parameters.materialColor }),
);
scene.add(cube);

// --- Tweakpane 调试面板 ---
const panel = new Pane({ title: "参数调试" });
panel.addBinding(parameters, "materialColor", { picker: "inline" }).on("change", (ev) => {
  cube.material.color.set(ev.value);
});

const camera = new T.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 3;

// Renderer
const renderer = new T.WebGLRenderer({
  canvas,
  antialias: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// --- 动画循环 ---
const timer = new T.Timer();

function tick() {
  timer.update();

  controls.update();
  const elapsedTime = timer.getElapsed();

  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}
tick();

// --- 适配窗口 ---
window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // 更新相机
  camera.aspect = sizes.width / sizes.height; // 更新宽高比
  camera.updateProjectionMatrix(); // 更新相机投影矩阵

  renderer.setSize(sizes.width, sizes.height); // 更新渲染器大小
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});
