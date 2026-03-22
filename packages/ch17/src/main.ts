import * as T from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// Canvas
const canvas = document.getElementById("app") as HTMLCanvasElement;

// --- 初始化场景 ---
const scene = new T.Scene();

/**
 * Texture Loader
 */
const textureLoader = new T.TextureLoader();
const particleTexture = textureLoader.load("/textures/particles/2.png");

/**
 * Particles
 */
// 在 r125+ 中，SphereBufferGeometry 已并入 SphereGeometry：内置几何体均为 BufferGeometry 子类，无需单独使用 SphereBufferGeometry
// const particlesGeometry = new T.SphereGeometry(1, 32, 32);
const particlesGeometry = new T.BufferGeometry();
const count = 20000;
const positions = new Float32Array(count * 3);
const colors = new Float32Array(count * 3);

for (let i = 0; i < count * 3; i++) {
  positions[i] = (Math.random() - 0.5) * 10;
  colors[i] = Math.random();
}

particlesGeometry.setAttribute("position", new T.BufferAttribute(positions, 3)); // 随机位置
particlesGeometry.setAttribute("color", new T.BufferAttribute(colors, 3)); // 随机颜色

const particlesMaterial = new T.PointsMaterial({
  size: 0.1,
  // 是否根据相机距离缩放粒子大小
  sizeAttenuation: true,
  color: "#ff88cc", // 基础颜色会影响到vertexColors的渲染效果
  vertexColors: true,
  alphaMap: particleTexture,
  transparent: true,
  // alphaTest: 0.001, // 可用于消除黑色边缘
  // depthTest: false, // 停用深度测试，不用管前后，如果存在其它物体，物体无法遮挡粒子
  depthWrite: false, // 停用深度写入，能够会遮挡其它物体
  blending: T.AdditiveBlending, // 添加混合，让粒子颜色叠加，而不是覆盖
});

const particles = new T.Points(particlesGeometry, particlesMaterial);
scene.add(particles);

// 用于测试上面 depthTest 和 depthWrite 效果的差异
// const cube = new T.Mesh(new T.BoxGeometry(1, 1, 1), new T.MeshBasicMaterial({ color: "#ffffff" }));
// scene.add(cube);

// Sizes
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

// Camera
const camera = new T.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.x = 3;
camera.position.y = 10;
camera.position.z = 10;

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

const axisHelper = new T.AxesHelper(2);
scene.add(axisHelper);

// --- 动画循环 ---
const timer = new T.Timer();

// 🚨 这里会更新几万个顶点的位置，性能消耗较大，需要优化。一般使用自定义shader来实现。
function tick() {
  timer.update();
  const elapsedTime = timer.getElapsed();

  for (let i = 0; i < count; i++) {
    // 每个顶点都是3个值，所以需要 * 3  (x, y, z)
    const i3 = i * 3;

    const x = particlesGeometry.attributes.position!.array[i3] ?? 0;

    // 因此 索引为 i3 + 1 的值就是y轴的值
    // 让粒子沿着y轴做正弦运动
    particlesGeometry.attributes.position!.array[i3 + 1] = Math.sin(elapsedTime + x);
  }

  // 更新几何体
  particlesGeometry.attributes.position!.needsUpdate = true;

  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}
tick();

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
