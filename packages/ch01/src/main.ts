import * as THREE from "three";
import { Pane } from "tweakpane";

// --- 初始化场景 ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById("app") as HTMLCanvasElement,
  antialias: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// --- 添加物体 ---
const geometry = new THREE.IcosahedronGeometry(1, 4);
const material = new THREE.MeshNormalMaterial({ wireframe: true });
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);
camera.position.z = 3;

// --- Tweakpane 调试面板 ---
const pane = new Pane({ title: "参数调试" });
const params = {
  rotationSpeed: 0.01,
  wireframe: true,
  color: "#ffffff",
};

pane.addBinding(params, "rotationSpeed", { min: 0, max: 0.1, label: "旋转速度" });
pane.addBinding(params, "wireframe", { label: "线框模式" }).on("change", (ev) => {
  material.wireframe = ev.value;
});

// --- 动画循环 ---
function animate() {
  requestAnimationFrame(animate);
  mesh.rotation.y += params.rotationSpeed;
  renderer.render(scene, camera);
}
animate();

// --- 适配窗口 ---
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
