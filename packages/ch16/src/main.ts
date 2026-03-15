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
// const sphere = new T.Mesh(
//   new T.SphereGeometry(1, 32, 32),
//   new T.MeshStandardMaterial({ roughness: 0.7 }),
// );
// sphere.position.y = 1;
// scene.add(sphere);

// Floor
const floor = new T.Mesh(
  new T.PlaneGeometry(20, 20),
  new T.MeshStandardMaterial({ color: "#a9c388" }),
);
floor.rotation.x = -Math.PI * 0.5;
floor.position.y = 0;
scene.add(floor);

// House 房子
const house = new T.Group();
scene.add(house);

// Walls 墙壁
const walls = new T.Mesh(
  new T.BoxGeometry(4, 2.5, 4),
  new T.MeshStandardMaterial({ color: "#a9c388" }),
);
walls.position.y = 2.5 / 2;
house.add(walls);

// Roof 屋顶
const roof = new T.Mesh(
  new T.ConeGeometry(3.5, 1.5, 4),
  new T.MeshStandardMaterial({ color: "red" }),
);
roof.position.y = 2.5 + 1.5 / 2;
roof.rotation.y = Math.PI / 4;
house.add(roof);

// Door 房门
const door = new T.Mesh(
  new T.PlaneGeometry(2.2, 2.2),
  new T.MeshStandardMaterial({ color: "white" }),
);
door.position.y = 1;
door.position.z = 2 + 0.01; // +0.01 是为了防止 z-fighting
house.add(door);

// Bushes
const bushGeometry = new T.SphereGeometry(1, 16, 16);
const bushMaterial = new T.MeshStandardMaterial({ color: "green" });

const bush1 = new T.Mesh(bushGeometry, bushMaterial);
bush1.scale.setScalar(0.5); // 缩放 0.5 倍
bush1.position.set(0.8, 0.2, 2.2);
house.add(bush1);

const bush2 = new T.Mesh(bushGeometry, bushMaterial);
bush2.scale.setScalar(0.25); // 缩放 0.25 倍
bush2.position.set(1.4, 0.1, 2.1);
house.add(bush2);

const bush3 = new T.Mesh(bushGeometry, bushMaterial);
bush3.scale.setScalar(0.4);
bush3.position.set(-0.8, 0.1, 2.2);
house.add(bush3);

const bush4 = new T.Mesh(bushGeometry, bushMaterial);
bush4.scale.setScalar(0.15);
bush4.position.set(-1, 0.05, 2.6);
house.add(bush4);

// Graves 坟墓
const graveGeometry = new T.BoxGeometry(0.6, 0.8, 0.2);
const graveMaterial = new T.MeshStandardMaterial({ color: "pink" });

const graves = new T.Group();
scene.add(graves);

for (let i = 0; i < 30; i++) {
  const angle = Math.random() * Math.PI * 2;
  const radius = 3 + Math.random() * 4;
  const x = Math.sin(angle) * radius;
  const z = Math.cos(angle) * radius;
  const grave = new T.Mesh(graveGeometry, graveMaterial);
  grave.position.x = x;
  grave.position.y = Math.random() * 0.4;
  grave.position.z = z;
  grave.rotation.x = (Math.random() - 0.5) * 0.4;
  grave.rotation.y = (Math.random() - 0.5) * 0.4;
  grave.rotation.z = (Math.random() - 0.5) * 0.4;
  graves.add(grave);
}

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

// Axis Helper
const axisHelper = new T.AxesHelper(12);
scene.add(axisHelper);

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
