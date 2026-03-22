import * as T from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// Canvas
const canvas = document.getElementById("app") as HTMLCanvasElement;

// --- 初始化场景 ---
const scene = new T.Scene();

// Sizes
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

// Camera
const camera = new T.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 3;

// Renderer
const renderer = new T.WebGLRenderer({
  canvas,
  antialias: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// --- 添加物体 ---
const geometry = new T.IcosahedronGeometry(1, 4);
const material = new T.MeshNormalMaterial({ wireframe: true });
const mesh = new T.Mesh(geometry, material);
scene.add(mesh);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const axisHelper = new T.AxesHelper(2);
scene.add(axisHelper);

// --- 动画循环 ---
function animate() {
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();

// --- 适配窗口 ---
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
