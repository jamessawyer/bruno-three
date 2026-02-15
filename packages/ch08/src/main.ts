import * as T from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// Canvas
const canvas = document.getElementById("app") as HTMLCanvasElement;

// --- 初始化场景 ---
const scene = new T.Scene();

// Objects
const group = new T.Group();
scene.add(group);

// 手动创建一份随机顶点数据，并塞进 BufferGeometry 里，用于后续渲染（通常会形成很多随机小三角形）
const geometry = new T.BufferGeometry(); // 创建一个空几何体，里面还没有任何顶点数据

const count = 50; // 生成 50 个三角形
// 每个三角形 3 个顶点，每个顶点 3 个坐标
const positionArray = new Float32Array(count * 3 * 3); // 50个顶点，每个顶点有3个坐标

for (let i = 0; i < count * 3 * 3; i++) {
  // -0.5 - 0.5 之间
  positionArray[i] = Math.random() - 0.5;
}
// 把一维数组解释为“每 3 个数是一组顶点坐标”
const positionAttribute = new T.BufferAttribute(positionArray, 3);
// 将这组顶点绑定到几何体的 position 属性
// 这样几何体就有了可渲染的顶点数据
geometry.setAttribute("position", positionAttribute);

const material = new T.MeshBasicMaterial({
  color: 0xff0000,
  wireframe: true,
});
const cube1 = new T.Mesh(geometry, material);

group.add(cube1);

// Axis Helper
const axisHelper = new T.AxesHelper(2);
scene.add(axisHelper);

// Sizes
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

// resize 事件
// 1. 调整画布尺寸
// 2. 更新相机
// 3. 更新渲染器
// 4. 更新像素比
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
camera.lookAt(group.position);
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

const tick = () => {
  controls.update();
  renderer.render(scene, camera);

  requestAnimationFrame(tick);
};

tick();
