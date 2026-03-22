import * as T from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// --- 初始化场景 ---
const scene = new T.Scene();
const camera = new T.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new T.WebGLRenderer({
  canvas: document.getElementById("app") as HTMLCanvasElement,
  antialias: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// --- 添加物体 ---
const geometry = new T.IcosahedronGeometry(1, 4);
const material = new T.MeshNormalMaterial({ wireframe: true });
const mesh = new T.Mesh(geometry, material);
scene.add(mesh);
camera.position.z = 3;

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// --- 动画循环 ---
function animate() {
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();

// --- 适配窗口 ---
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
