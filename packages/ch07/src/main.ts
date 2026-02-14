import * as T from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const cursor = {
  x: 0,
  y: 0,
};
window.addEventListener("mousemove", (evt: MouseEvent) => {
  cursor.x = evt.clientX / sizes.width - 0.5;
  cursor.y = -(evt.clientY / sizes.height - 0.5);
});

// Canvas
const canvas = document.getElementById("app") as HTMLCanvasElement;

// --- 初始化场景 ---
const scene = new T.Scene();

// Objects
const group = new T.Group();
scene.add(group);

const cube1 = new T.Mesh(new T.BoxGeometry(1, 1, 1), new T.MeshBasicMaterial({ color: 0xff0000 }));
group.add(cube1);

// Axis Helper
const axisHelper = new T.AxesHelper(2);
scene.add(axisHelper);

// Sizes
const sizes = {
  width: 800,
  height: 600,
};

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

const tick = () => {
  controls.update();
  renderer.render(scene, camera);

  requestAnimationFrame(tick);
};

tick();
